"""Idea Canvas service with interactive Q&A streaming."""

import json
import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import AsyncIterator

from loguru import logger

from ....domain.prompts.idea_canvas import (
    first_question_prompt,
    next_question_prompt,
    question_system_prompt,
)
from ....infrastructure.llm import LLMService
from ..schemas.idea_canvas import (
    AnswerRequest,
    ApproachOption,
    CanvasCompleteEvent,
    CanvasErrorEvent,
    CanvasNode,
    CanvasNodeType,
    CanvasProgressEvent,
    CanvasQuestion,
    CanvasQuestionEvent,
    CanvasReadyEvent,
    CanvasState,
    CanvasTemplate,
    QuestionOption,
    QuestionType,
    StartCanvasRequest,
)


class CanvasSession:
    """Represents an active canvas session."""

    def __init__(
        self,
        session_id: str,
        idea: str,
        template: CanvasTemplate,
        provider: str,
        model: str,
    ):
        self.session_id = session_id
        self.idea = idea
        self.template = template
        self.provider = provider
        self.model = model
        self.conversation_history: list[dict] = []
        self.nodes: CanvasNode = CanvasNode(
            id="root",
            type=CanvasNodeType.ROOT,
            label=idea[:150] + ("..." if len(idea) > 150 else ""),
            description=idea,
            children=[],
        )
        self.current_question_id: str | None = None
        self.current_question_options: list[QuestionOption] = (
            []
        )  # Store current question's options
        self.question_count = 0
        self.is_complete = False

    def add_question(
        self,
        question: str,
        question_id: str,
        options: list[QuestionOption] | None = None,
    ) -> None:
        """Add a question node to the tree."""
        question_node = CanvasNode(
            id=question_id,
            type=CanvasNodeType.QUESTION,
            label=question[:120] + ("..." if len(question) > 120 else ""),
            description=question,
            children=[],
        )
        self._find_and_add_child(self.nodes, question_node)
        self.current_question_id = question_id
        self.current_question_options = options or []  # Store options for later
        self.question_count += 1

    def add_answer(
        self, answer: str, answer_id: str, selected_option_id: str | None = None
    ) -> None:
        """Add an answer node to the tree with all available options."""
        answer_node = CanvasNode(
            id=answer_id,
            type=CanvasNodeType.ANSWER,
            label=answer[:120] + ("..." if len(answer) > 120 else ""),
            description=answer,
            children=[],
            options=self.current_question_options,  # Store all options that were available
            selected_option_id=selected_option_id,  # Mark which was selected
        )
        # Find the current question and add answer as its child
        if self.current_question_id:
            self._add_child_to_node(self.nodes, self.current_question_id, answer_node)
        # Clear current question options after adding answer
        self.current_question_options = []

    def _find_and_add_child(self, node: CanvasNode, child: CanvasNode) -> bool:
        """Find the deepest answer node and add child to it."""
        # If this node has no children, add here
        if not node.children:
            node.children.append(child)
            return True

        # Try to find the deepest path (last answer node)
        for i in range(len(node.children) - 1, -1, -1):
            child_node = node.children[i]
            if child_node.type == CanvasNodeType.ANSWER:
                return self._find_and_add_child(child_node, child)

        # If no answer nodes found, add to this node
        node.children.append(child)
        return True

    def _add_child_to_node(
        self, node: CanvasNode, target_id: str, child: CanvasNode
    ) -> bool:
        """Find a node by ID and add a child to it."""
        if node.id == target_id:
            node.children.append(child)
            return True
        for child_node in node.children:
            if self._add_child_to_node(child_node, target_id, child):
                return True
        return False

    def get_state(self) -> CanvasState:
        """Get the current canvas state."""
        return CanvasState(
            session_id=self.session_id,
            idea=self.idea,
            template=self.template,
            nodes=self.nodes,
            question_count=self.question_count,
            is_complete=self.is_complete,
        )


class IdeaCanvasService:
    """Service for managing idea canvas sessions."""

    def __init__(self):
        self._executor = ThreadPoolExecutor(max_workers=2)
        self._sessions: dict[str, CanvasSession] = {}

    def _configure_api_key(self, provider: str, api_key: str) -> None:
        """Configure API key in environment for the provider."""
        if provider in ("gemini", "google"):
            os.environ["GEMINI_API_KEY"] = api_key
            os.environ["GOOGLE_API_KEY"] = api_key
        elif provider == "openai":
            os.environ["OPENAI_API_KEY"] = api_key
        elif provider == "anthropic":
            os.environ["ANTHROPIC_API_KEY"] = api_key

    def _parse_question_response(self, response: str) -> dict:
        """Parse LLM response into question data."""
        try:
            data = json.loads(response)
            return data
        except json.JSONDecodeError:
            # Try to extract JSON from response
            return self._extract_json(response) or {}

    def _extract_json(self, text: str) -> dict | None:
        """Try to extract JSON object from text."""
        if not text:
            return None

        start_idx = text.find("{")
        if start_idx == -1:
            return None

        stack = []
        for i in range(start_idx, len(text)):
            ch = text[i]
            if ch == "{":
                stack.append(ch)
            elif ch == "}":
                if stack:
                    stack.pop()
                    if not stack:
                        try:
                            return json.loads(text[start_idx : i + 1])
                        except json.JSONDecodeError:
                            return None
        return None

    def _build_canvas_question(self, data: dict, question_id: str) -> CanvasQuestion:
        """Build a CanvasQuestion from parsed LLM response."""
        question_type = QuestionType(data.get("type", "single_choice"))

        options = []
        if question_type == QuestionType.SINGLE_CHOICE:
            for opt in data.get("options", []):
                options.append(
                    QuestionOption(
                        id=opt.get("id", f"opt_{uuid.uuid4().hex[:6]}"),
                        label=opt.get("label", ""),
                        description=opt.get("description"),
                        recommended=opt.get("recommended", False),
                    )
                )

        approaches = []
        if question_type == QuestionType.APPROACH:
            for appr in data.get("approaches", []):
                approaches.append(
                    ApproachOption(
                        id=appr.get("id", f"appr_{uuid.uuid4().hex[:6]}"),
                        title=appr.get("title", ""),
                        description=appr.get("description", ""),
                        pros=appr.get("pros", []),
                        cons=appr.get("cons", []),
                        recommended=appr.get("recommended", False),
                    )
                )

        return CanvasQuestion(
            id=question_id,
            question=data.get("question", "What would you like to do?"),
            type=question_type,
            options=options,
            approaches=approaches,
            allow_skip=True,
            context=data.get("context"),
        )

    async def start_session(
        self,
        request: StartCanvasRequest,
        api_key: str,
        user_id: str | None = None,
    ) -> AsyncIterator[
        CanvasReadyEvent | CanvasQuestionEvent | CanvasProgressEvent | CanvasErrorEvent
    ]:
        """Start a new canvas session and generate the first question.

        Args:
            request: Start canvas request
            api_key: API key for LLM provider
            user_id: Optional user ID

        Yields:
            Canvas events
        """
        try:
            # Create session
            session_id = f"sess_{uuid.uuid4().hex[:12]}"
            provider = request.provider.value
            if provider == "google":
                provider = "gemini"

            session = CanvasSession(
                session_id=session_id,
                idea=request.idea,
                template=request.template,
                provider=provider,
                model=request.model,
            )
            self._sessions[session_id] = session

            yield CanvasProgressEvent(message="Starting canvas session...")

            # Configure LLM
            self._configure_api_key(provider, api_key)
            llm_service = LLMService(provider=provider, model=request.model)

            if not llm_service.is_available():
                raise ValueError(f"LLM service not available for provider: {provider}")

            yield CanvasProgressEvent(message="Generating first question...")

            # Generate first question
            import asyncio

            loop = asyncio.get_event_loop()

            system_prompt = question_system_prompt(request.template.value)
            user_prompt = first_question_prompt(request.idea, request.template.value)

            response = await loop.run_in_executor(
                self._executor,
                llm_service._call_llm,
                system_prompt,
                user_prompt,
                2000,
                0.7,
                True,
                "first_question",
            )

            # Parse response
            question_data = self._parse_question_response(response)
            question_id = f"q_{uuid.uuid4().hex[:8]}"
            question = self._build_canvas_question(question_data, question_id)

            # Add question to session with its options
            session.add_question(question.question, question_id, question.options)

            # Yield ready event with first question
            yield CanvasReadyEvent(
                session_id=session_id,
                canvas=session.get_state(),
            )

            yield CanvasQuestionEvent(
                question=question,
                canvas=session.get_state(),
            )

        except Exception as e:
            logger.error(f"Failed to start canvas session: {e}")
            yield CanvasErrorEvent(
                message=str(e),
                code="START_ERROR",
            )

    async def submit_answer(
        self,
        request: AnswerRequest,
        api_key: str,
        user_id: str | None = None,
    ) -> AsyncIterator[
        CanvasQuestionEvent
        | CanvasCompleteEvent
        | CanvasProgressEvent
        | CanvasErrorEvent
    ]:
        """Submit an answer and get the next question.

        Args:
            request: Answer request
            api_key: API key for LLM provider
            user_id: Optional user ID

        Yields:
            Canvas events
        """
        try:
            session = self._sessions.get(request.session_id)
            if not session:
                raise ValueError(f"Session not found: {request.session_id}")

            yield CanvasProgressEvent(message="Processing answer...")

            # Format answer
            answer_str = (
                request.answer
                if isinstance(request.answer, str)
                else ", ".join(request.answer)
            )

            # Add answer to conversation history
            session.conversation_history.append(
                {
                    "question": (
                        session.nodes.children[-1].label
                        if session.nodes.children
                        else ""
                    ),
                    "answer": answer_str,
                }
            )

            # Add answer node - find matching option ID if user selected an option
            answer_id = f"a_{uuid.uuid4().hex[:8]}"
            selected_option_id = None
            for opt in session.current_question_options:
                if opt.label == answer_str or opt.id == answer_str:
                    selected_option_id = opt.id
                    break
            session.add_answer(answer_str, answer_id, selected_option_id)

            # Configure LLM
            self._configure_api_key(session.provider, api_key)
            llm_service = LLMService(provider=session.provider, model=session.model)

            yield CanvasProgressEvent(message="Generating next question...")

            # Generate next question
            import asyncio

            loop = asyncio.get_event_loop()

            system_prompt = question_system_prompt(session.template.value)
            user_prompt = next_question_prompt(
                session.idea,
                session.conversation_history,
                session.question_count,
            )

            response = await loop.run_in_executor(
                self._executor,
                llm_service._call_llm,
                system_prompt,
                user_prompt,
                2000,
                0.7,
                True,
                "next_question",
            )

            # Parse response
            question_data = self._parse_question_response(response)

            # Check if LLM suggests completion (primary decision maker)
            # Only use hard cap of 25 as absolute fallback
            llm_suggests_complete = question_data.get("suggest_complete", False)
            hard_cap_reached = session.question_count >= 25

            if llm_suggests_complete or hard_cap_reached:
                session.is_complete = True
                # Use LLM's summary if provided
                summary = question_data.get("summary", "")
                if summary:
                    completion_msg = summary
                elif hard_cap_reached:
                    completion_msg = (
                        "We've covered a lot of ground! "
                        "Ready to generate your implementation spec."
                    )
                else:
                    completion_msg = (
                        "I think we've explored the key areas of your idea. "
                        "Ready to generate your implementation spec?"
                    )
                yield CanvasCompleteEvent(
                    message=completion_msg,
                    canvas=session.get_state(),
                )
                return

            # Build and add question with its options
            question_id = f"q_{uuid.uuid4().hex[:8]}"
            question = self._build_canvas_question(question_data, question_id)
            session.add_question(question.question, question_id, question.options)

            yield CanvasQuestionEvent(
                question=question,
                canvas=session.get_state(),
            )

        except Exception as e:
            logger.error(f"Failed to process answer: {e}")
            yield CanvasErrorEvent(
                message=str(e),
                code="ANSWER_ERROR",
            )

    def get_session(self, session_id: str) -> CanvasSession | None:
        """Get a session by ID."""
        return self._sessions.get(session_id)

    def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False

    def generate_report(
        self, session_id: str, api_key: str, image_api_key: str | None = None
    ) -> dict:
        """Generate an LLM-powered implementation plan from a canvas session.

        Args:
            session_id: The session ID
            api_key: API key for LLM
            image_api_key: API key for image generation (optional)

        Returns:
            Dict with title and markdown_content
        """
        session = self._sessions.get(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")

        # Configure LLM
        self._configure_api_key(session.provider, api_key)
        llm_service = LLMService(provider=session.provider, model=session.model)

        # Build Q&A summary for the LLM
        qa_summary = ""
        for i, item in enumerate(session.conversation_history, 1):
            question = item.get("question", "")
            answer = item.get("answer", "")
            qa_summary += f"\nQ{i}: {question}\nA{i}: {answer}\n"

        # Create dynamic prompt based on template type
        template_name = session.template.value

        # Define sections based on template type
        if template_name in ("startup", "web_app", "ai_agent", "tech_stack"):
            # Technical templates
            sections_guidance = """1. **Executive Summary** - A brief overview of the project (2-3 paragraphs)
2. **Project Overview** - Goals, target users, and key value propositions
3. **Technical Architecture** - Recommended tech stack, system components, and architecture patterns
4. **Feature Breakdown** - Detailed list of features organized by priority (MVP, Phase 2, Future)
5. **Implementation Roadmap** - Phased approach with milestones and estimated timelines
6. **Risk Analysis** - Potential challenges and mitigation strategies
7. **Success Metrics** - KPIs and how to measure project success
8. **Next Steps** - Immediate action items to get started"""
            doc_type = "Implementation Plan"
            writer_role = "expert technical writer and product strategist"
        elif template_name == "project_spec":
            # Project specification
            sections_guidance = """1. **Executive Summary** - Brief overview of the project scope
2. **Project Goals & Objectives** - What success looks like
3. **Scope & Deliverables** - What's included and excluded
4. **Requirements** - Functional and non-functional requirements
5. **Timeline & Milestones** - Key dates and checkpoints
6. **Resources & Budget** - Required resources and cost estimates
7. **Risks & Dependencies** - Potential blockers and how to mitigate
8. **Acceptance Criteria** - How deliverables will be validated"""
            doc_type = "Project Specification"
            writer_role = "expert project manager and technical writer"
        elif template_name == "feature":
            # Feature planning
            sections_guidance = """1. **Feature Overview** - What this feature does and why it matters
2. **User Stories** - Who benefits and how
3. **Functional Requirements** - Detailed behavior specifications
4. **UI/UX Considerations** - Interface and experience design notes
5. **Technical Approach** - How to implement this feature
6. **Edge Cases & Error Handling** - What could go wrong and how to handle it
7. **Testing Strategy** - How to validate the feature works correctly
8. **Rollout Plan** - How to release this feature safely"""
            doc_type = "Feature Specification"
            writer_role = "expert product manager and technical writer"
        else:
            # Custom/general ideas - adapt to content dynamically
            sections_guidance = """Analyze the idea and questions/answers to determine the appropriate document structure.
Choose sections that make sense for this specific idea. Examples:

For creative projects (books, art, music):
- Vision & Concept, Target Audience, Creative Direction, Content Outline, Production Plan, Distribution Strategy

For business ideas:
- Executive Summary, Market Analysis, Value Proposition, Business Model, Go-to-Market Strategy, Financial Projections

For personal projects (travel, events, learning):
- Overview, Goals & Objectives, Planning Details, Timeline, Budget, Resources Needed

For research or academic work:
- Abstract, Background, Methodology, Expected Outcomes, Timeline, References

Choose the most appropriate structure based on the actual idea content."""
            doc_type = "Comprehensive Plan"
            writer_role = "expert writer who adapts to any domain"

        system_prompt = f"""You are an {writer_role}. Your task is to generate a comprehensive {doc_type} document based on the user's idea exploration session.

The document should be in Markdown format. Structure it with the following sections (adapt as needed based on the idea):

{sections_guidance}

Make the document actionable, specific, and tailored to the decisions made during the exploration session. Use proper Markdown formatting with headers, bullet points, and emphasis where appropriate."""

        user_prompt = f"""Based on the following idea exploration session, generate a comprehensive {doc_type} document.

ORIGINAL IDEA:
{session.idea}

TEMPLATE: {session.template.value.replace('_', ' ').title()}

EXPLORATION Q&A:
{qa_summary}

Please generate a detailed, actionable {doc_type} document in Markdown format. Make sure to reference the specific decisions and answers provided during the exploration."""

        import asyncio

        # Generate the implementation plan
        response = llm_service._call_llm(
            system_prompt,
            user_prompt,
            4000,
            0.7,
            False,
            "generate_report",
        )

        # Clean up the response (remove markdown code blocks if present)
        markdown_content = response.strip()
        if markdown_content.startswith("```markdown"):
            markdown_content = markdown_content[11:]
        if markdown_content.startswith("```"):
            markdown_content = markdown_content[3:]
        if markdown_content.endswith("```"):
            markdown_content = markdown_content[:-3]
        markdown_content = markdown_content.strip()

        # Add decision tree from the canvas
        decision_tree = self._build_decision_tree_markdown(session.nodes)

        # Add header and footer
        title = (
            f"{doc_type}: {session.idea[:50]}{'...' if len(session.idea) > 50 else ''}"
        )

        from datetime import datetime

        footer = f"\n\n---\n*Generated by PrismDocs on {datetime.now().strftime('%Y-%m-%d %H:%M')} | Based on {session.question_count} exploration questions*"

        full_content = markdown_content
        if decision_tree:
            full_content += f"\n\n{decision_tree}"
        full_content += footer

        summary_image_base64 = None
        if image_api_key:
            summary_image_base64 = self._generate_report_image(
                title, markdown_content, image_api_key
            )

        # Generate PDF
        pdf_base64 = self._generate_pdf_from_markdown(
            title, full_content, image_base64=summary_image_base64
        )

        return {
            "title": title,
            "markdown_content": full_content,
            "pdf_base64": pdf_base64,
            "image_base64": summary_image_base64,
            "image_format": "png" if summary_image_base64 else None,
        }

    def _generate_pdf_from_markdown(
        self,
        title: str,
        markdown_content: str,
        image_base64: str | None = None,
    ) -> str:
        """Generate PDF from markdown content and return as base64 string.

        Args:
            title: Document title
            markdown_content: Markdown content to convert
            image_base64: Optional base64 image to embed in PDF

        Returns:
            Base64-encoded PDF data
        """
        import base64
        import re
        import tempfile
        from pathlib import Path
        from datetime import datetime

        try:
            from ....infrastructure.generators.pdf.generator import PDFGenerator

            pdf_generator = PDFGenerator()

            # Create temporary directory for output
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)

                # Generate a clean filename from the title
                # Remove special characters and limit length
                clean_title = re.sub(r"[^\w\s-]", "", title).strip()
                clean_title = re.sub(r"[-\s]+", "_", clean_title)[:50]
                filename = f"{clean_title}.pdf" if clean_title else "canvas_report.pdf"

                pdf_markdown = markdown_content
                if image_base64:
                    image_path = temp_path / "idea_canvas_summary.png"
                    try:
                        cleaned = image_base64.split(",", 1)[-1]
                        image_path.write_bytes(base64.b64decode(cleaned))
                        pdf_markdown = (
                            f"![Implementation Summary]({image_path})\n\n"
                            + markdown_content
                        )
                    except Exception as exc:
                        logger.warning(f"Failed to embed summary image: {exc}")

                # Prepare content for PDF generator
                content = {
                    "title": title,
                    "markdown": pdf_markdown,
                }

                metadata = {
                    "title": title,  # PDF generator uses this for display title
                    "custom_filename": (
                        clean_title if clean_title else "canvas_report"
                    ),  # For file output
                    "source": "Idea Canvas",
                    "created_at": datetime.now().isoformat(),
                    "content_type": "Implementation Spec",
                }

                # Generate PDF
                pdf_path = pdf_generator.generate(content, metadata, temp_path)

                # Read and encode as base64
                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()
                    pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

                return pdf_base64

        except Exception as e:
            logger.error(f"Failed to generate PDF: {e}")
            return ""

    def _add_node_to_markdown(self, node: CanvasNode, lines: list, depth: int) -> None:
        """Recursively add canvas nodes to markdown."""
        indent = "  " * depth

        if node.type == CanvasNodeType.ROOT:
            lines.append(f"- 💡 **{node.label}**")
        elif node.type == CanvasNodeType.QUESTION:
            lines.append(f"{indent}- ❓ *{node.label}*")
        elif node.type == CanvasNodeType.ANSWER:
            lines.append(f"{indent}- ✅ **{node.label}**")
        elif node.type == CanvasNodeType.APPROACH:
            lines.append(f"{indent}- 🔧 **{node.label}**")

        for child in node.children:
            self._add_node_to_markdown(child, lines, depth + 1)

    def _build_decision_tree_markdown(self, root: CanvasNode) -> str:
        """Build a markdown decision tree section from the canvas nodes."""
        lines: list[str] = []
        self._add_node_to_markdown(root, lines, 0)
        if not lines:
            return ""
        return "## Decision Tree\n\n" + "\n".join(lines)

    def _generate_report_image(
        self, title: str, markdown_content: str, api_key: str
    ) -> str | None:
        """Generate a summary image for the report."""
        from ....domain.image_styles import get_style_by_id
        from ....infrastructure.image.image_service import ImageService

        if not api_key:
            return None

        service = ImageService(api_key=api_key)
        if not service.is_available():
            return None

        snippet = (markdown_content or "").strip()[:1500]
        prompt = (
            "Create a clean, hand-drawn style infographic that summarizes this "
            "implementation plan. Use warm colors, whiteboard aesthetics, simple "
            "icons, and arrows connecting concepts. Include the main title at the top.\n\n"
            f"Title: {title}\n\nKey points to visualize:\n{snippet}"
        )

        style = get_style_by_id("whiteboard_handwritten")
        image_data, _prompt_used = service.generate_raster_image(
            prompt=prompt, style=style, free_text_mode=False
        )
        return image_data


# Singleton instance
_idea_canvas_service: IdeaCanvasService | None = None


def get_idea_canvas_service() -> IdeaCanvasService:
    """Get or create idea canvas service instance."""
    global _idea_canvas_service
    if _idea_canvas_service is None:
        _idea_canvas_service = IdeaCanvasService()
    return _idea_canvas_service

"""Prompts for Idea Canvas question generation."""

TEMPLATE_CONTEXTS = {
    "startup": """The user wants to plan a startup. Focus on gathering information for these key areas:

HOOK & PROBLEM DEFINITION:
- One compelling story or striking statistic that illustrates the problem
- Why this problem matters NOW (timing, urgency, trends)
- Define the user/customer clearly (who exactly has this pain)
- Current workflow: How do they solve this problem today? What's broken?

SOLUTION:
- The core solution and how it solves the problem
- Key differentiators from existing solutions
- MVP scope and essential features

MARKET OPPORTUNITY:
- Target market size and segments
- Customer acquisition strategy
- Go-to-market approach

BUSINESS/IMPACT MODEL:
- Revenue model or impact metrics
- Productivity, quality, cost savings potential
- Risk reduction benefits
- Integration and adoption path for users
- Team and resources needed
- Key risks and mitigation""",
    "web_app": """The user wants to build a web application. Focus on:
- Core functionality and features
- Target users and use cases
- Tech stack decisions (frontend, backend, database)
- Architecture approach (monolith, microservices, serverless)
- Authentication and authorization
- Deployment and infrastructure
- Scalability considerations""",
    "ai_agent": """The user wants to build an AI/agentic system. Focus on:
- Agent purpose and capabilities
- Tool integrations needed
- Memory and state management
- Orchestration approach (single agent, multi-agent)
- LLM provider and model selection
- Guardrails and safety measures
- Evaluation and testing strategy""",
    "project_spec": """The user wants to plan a project. Focus on:
- Project goals and success criteria
- Scope and deliverables
- Key milestones and timeline
- Dependencies and blockers
- Resource requirements
- Risk assessment
- Communication and documentation""",
    "tech_stack": """The user wants to make technology decisions. Focus on:
- Requirements and constraints
- Options with trade-offs
- Team expertise and learning curve
- Performance and scalability needs
- Ecosystem and community support
- Cost considerations
- Migration and integration challenges""",
    "custom": """The user has a custom idea. Adapt your questions to explore:
- Core concept and goals
- Target audience/users
- Key requirements and constraints
- Implementation approach
- Potential challenges
- Success criteria""",
    # Developer-focused templates
    "implement_feature": """The user wants to implement a feature. Focus on:
- Feature requirements and acceptance criteria
- User stories and edge cases
- Dependencies and integration points
- Implementation approach (step-by-step)
- Testing strategy
- Rollout and monitoring plan
- Code examples where helpful""",
    "solve_problem": """The user wants to explore different approaches to solve a technical problem. Focus on:
- Problem definition and constraints
- Available resources and limitations
- Present 2-4 DIFFERENT APPROACHES with clear trade-offs
- For each approach: pros, cons, complexity, when to use
- Include code snippets or pseudocode when relevant
- Your recommendation with reasoning
IMPORTANT: Always present multiple approaches so the user can make an informed decision.""",
    "performance": """The user wants to optimize performance. Focus on:
- Current bottlenecks and symptoms
- Metrics and benchmarks (what to measure)
- Profiling approach
- Quick wins vs long-term optimizations
- Implementation priority
- Testing and validation plan
- Specific tools and techniques""",
    "scaling": """The user wants to scale a system. Focus on:
- Current load and capacity limits
- Target scale requirements
- Horizontal vs vertical scaling trade-offs
- Database scaling strategies
- Caching and CDN strategies
- Cost implications
- Migration plan and rollback strategy""",
    "security_review": """The user wants to review and improve security. Focus on:
- Threat model and attack surface
- Authentication and authorization
- Data encryption (at rest, in transit)
- Input validation and sanitization
- Dependency vulnerabilities
- Compliance requirements
- Security testing approach""",
    "code_architecture": """The user wants to design or refactor code architecture. Focus on:
- Current pain points and technical debt
- Design patterns and principles (SOLID, etc.)
- Module/package structure
- Dependency management
- Testing architecture
- Documentation approach
- Migration strategy if refactoring""",
}


def question_system_prompt(template: str) -> str:
    """Get the system prompt for question generation.

    Args:
        template: The canvas template type

    Returns:
        System prompt string
    """
    template_context = TEMPLATE_CONTEXTS.get(template, TEMPLATE_CONTEXTS["custom"])

    return f"""You are an expert product strategist and technical architect helping users explore and refine their ideas through guided questioning.

Your role is to ask ONE thoughtful question at a time to help the user think through their idea comprehensively. Like a skilled consultant, you guide them toward clarity through discovery rather than lecturing.

CONTEXT FOR THIS SESSION:
{template_context}

QUESTION STYLE GUIDELINES:
1. Ask ONE question at a time - never multiple questions in one response
2. ALWAYS provide 3-5 multiple choice options - users can still type custom answers in the UI
3. When there are clear trade-offs between approaches, present them as an "approach" type with pros/cons
4. Include your recommendation and explain why briefly
5. Questions should build on previous answers logically
6. Be conversational but efficient - don't waste the user's time

QUESTION TYPES:
- "single_choice": ALWAYS use this type with 3-5 options. Users can type custom answers in the UI.
- "approach": When presenting 2-3 different approaches with trade-offs (include pros/cons)

IMPORTANT: Never use "text_input" type. Always provide options even for open-ended questions.

JSON OUTPUT FORMAT:
{{
  "question": "Your question text here?",
  "type": "single_choice" | "approach",
  "options": [  // for single_choice - ALWAYS provide 3-5 options
    {{"id": "opt_1", "label": "Option 1", "description": "Brief explanation", "recommended": true}},
    {{"id": "opt_2", "label": "Option 2", "description": "Brief explanation", "recommended": false}},
    {{"id": "opt_3", "label": "Option 3", "description": "Brief explanation", "recommended": false}}
  ],
  "approaches": [  // for approach type
    {{
      "id": "approach_1",
      "title": "Approach Name",
      "description": "What this approach means",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"],
      "recommended": true
    }}
  ],
  "context": "Optional additional context about why you're asking this"
}}

Return ONLY valid JSON, no markdown formatting."""


def first_question_prompt(idea: str, template: str) -> str:
    """Get the prompt for generating the first question.

    Args:
        idea: The user's initial idea
        template: The canvas template type

    Returns:
        User prompt string
    """
    return f"""The user wants to explore this idea:

"{idea}"

Template type: {template}

Generate the FIRST question to start exploring this idea. This should be a foundational question that helps establish the core direction. Consider what's the most important thing to understand first about their idea.

Return the question as JSON."""


def next_question_prompt(
    idea: str, conversation_history: list[dict], question_count: int
) -> str:
    """Get the prompt for generating the next question.

    Args:
        idea: The user's initial idea
        conversation_history: List of previous Q&A pairs
        question_count: How many questions have been asked so far

    Returns:
        User prompt string
    """
    history_text = ""
    for i, item in enumerate(conversation_history, 1):
        history_text += f"\nQ{i}: {item['question']}\nA{i}: {item['answer']}\n"

    return f"""Original idea: "{idea}"

Conversation so far:
{history_text}

Questions asked: {question_count}

IMPORTANT - COMPLETION CRITERIA:
Evaluate whether you have gathered enough information to create a useful implementation spec. You should STOP asking questions and set "suggest_complete": true when:
1. You understand the core concept, goals, and target users
2. Key technical/implementation decisions have been made
3. You have a clear picture of scope and priorities
4. Asking more questions would provide diminishing returns

For simple ideas, 5-8 questions may be enough.
For complex projects, 10-15 questions may be needed.
Do NOT ask unnecessary questions just to reach a number.

If you determine we have enough information, return:
{{
  "suggest_complete": true,
  "summary": "Brief summary of what we've learned and are ready to spec out"
}}

Otherwise, generate the NEXT logical question that addresses the most important remaining gap.

Return your response as JSON."""


def completion_check_prompt(idea: str, conversation_history: list[dict]) -> str:
    """Get the prompt for checking if exploration is complete.

    Args:
        idea: The user's initial idea
        conversation_history: List of previous Q&A pairs

    Returns:
        User prompt string
    """
    history_text = ""
    for i, item in enumerate(conversation_history, 1):
        history_text += f"\nQ{i}: {item['question']}\nA{i}: {item['answer']}\n"

    return f"""Original idea: "{idea}"

Complete conversation:
{history_text}

Evaluate whether we have gathered enough information to create a comprehensive implementation spec. Consider:
1. Do we understand the core concept and goals?
2. Have we covered the key technical decisions?
3. Are there major gaps that would prevent creating an actionable plan?

Return JSON:
{{
  "is_complete": true/false,
  "coverage_score": 0-100,
  "missing_areas": ["area1", "area2"],  // if not complete
  "summary": "Brief summary of what we've learned"
}}"""

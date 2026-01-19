"""Prompts for mind map generation."""


def mindmap_system_prompt(mode: str) -> str:
    """Get the system prompt for mind map generation based on mode.

    Args:
        mode: Generation mode (summarize, brainstorm, structure)

    Returns:
        System prompt string
    """
    base_prompt = """You are an expert at creating clear, hierarchical mind maps that visualize information effectively.

Your task is to analyze the provided content and generate a mind map structure as JSON.

The JSON structure must follow this exact format:
{
  "title": "Main Topic",
  "summary": "Brief 1-2 sentence summary of the content",
  "nodes": {
    "id": "root",
    "label": "Central Concept",
    "children": [
      {
        "id": "1",
        "label": "Main Branch 1",
        "children": [
          {"id": "1.1", "label": "Sub-topic 1.1", "children": []},
          {"id": "1.2", "label": "Sub-topic 1.2", "children": []}
        ]
      }
    ]
  }
}

Rules:
1. Each node must have a unique "id", a concise "label" (max 50 chars), and a "children" array
2. IDs should follow a hierarchical pattern: "root", "1", "1.1", "1.1.1", etc.
3. Labels should be clear, concise phrases - not full sentences
4. Balance the tree - avoid having one branch with 10 items and another with 1
5. Return ONLY the JSON object, no markdown code blocks or additional text
"""

    mode_instructions = {
        "summarize": """
MODE: SUMMARIZE (Strict Extraction)
CRITICAL RULES:
- Extract ONLY information that is EXPLICITLY stated in the provided content
- DO NOT add any external knowledge, assumptions, or inferences
- DO NOT hallucinate or make up any information not present in the source
- Every node label must be directly derived from the content
- If the content is short, create a smaller mind map - do not pad with invented content

Instructions:
- Extract the key concepts and main ideas from the content
- Organize them hierarchically from most general to most specific
- Focus on capturing the essence of what is actually written
- Use factual, informative labels that reflect the source material""",
        "brainstorm": """
MODE: BRAINSTORM (Creative Expansion)
Instructions:
- Use the content as a starting point for related ideas
- Branch out into creative extensions and possibilities
- Include potential applications, questions, and connections
- Be expansive while maintaining relevance to the original topic
- You MAY suggest related concepts that extend beyond the source content""",
        "structure": """
MODE: STRUCTURE (Document Outline)
CRITICAL RULES:
- Reflect ONLY the actual structure and sections present in the content
- DO NOT add sections or headings that are not in the original document
- DO NOT hallucinate or invent structural elements
- If the document has no clear structure, create a flat list of key points
- Every node must correspond to actual content from the source

Instructions:
- Preserve the document's organization exactly as it appears
- Include main sections, subsections, and key points as they exist
- Maintain the logical flow of the original content
- Use the actual headings and section titles when available""",
        "goal_planning": """
MODE: GOAL PLANNING (Action Roadmap)
Instructions:
- Transform the idea or goal into a structured execution plan
- Create a hierarchical breakdown with phases, steps, and actionable tasks
- Organize from high-level objectives down to specific actions
- Include milestones and key deliverables at each phase
- Consider dependencies and logical sequencing

Structure:
- Root: The main goal or project
- Level 1: Major phases or milestones
- Level 2: Steps within each phase
- Level 3: Specific tasks and actions
- Level 4+: Sub-tasks and details as needed

Focus on:
- Clear, actionable language ("Define...", "Build...", "Test...")
- Logical progression from start to completion
- Realistic breakdown of complex goals into manageable pieces""",
        "pros_cons": """
MODE: PROS & CONS (Decision Analysis)
Instructions:
- Analyze the topic/decision from multiple perspectives
- Create a balanced view of benefits, risks, costs, and considerations
- Be thorough but fair in presenting both sides
- Include trade-offs and nuanced points

Structure:
- Root: The decision or topic being analyzed
- Level 1: Main categories (Pros, Cons, Considerations)
- Level 2: Specific points within each category
- Level 3: Supporting details, examples, or sub-points

Categories to consider:
- Pros/Benefits/Advantages
- Cons/Drawbacks/Risks
- Costs (time, money, resources)
- Trade-offs
- External factors
- Long-term vs short-term implications""",
        "presentation_structure": """
MODE: PRESENTATION STRUCTURE (Document Flow)
Instructions:
- Transform content into a logical presentation or document structure
- Create a narrative flow suitable for slides or written documents
- Organize into sections that build upon each other
- Focus on storytelling and audience engagement

Structure:
- Root: Presentation/Document title
- Level 1: Main sections (Introduction, Body sections, Conclusion)
- Level 2: Key points within each section
- Level 3: Supporting details, data points, examples

Flow considerations:
- Hook/Opening: Grab attention
- Context: Set the stage
- Main Body: Core content organized logically
- Evidence: Supporting points and examples
- Takeaways: Key messages
- Call to Action: What should the audience do next?""",
    }

    return base_prompt + mode_instructions.get(mode, mode_instructions["summarize"])


def mindmap_user_prompt(content: str, source_count: int) -> str:
    """Get the user prompt for mind map generation.

    Args:
        content: The source content to create a mind map from
        source_count: Number of sources being processed

    Returns:
        User prompt string
    """
    return f"""Create a mind map from the following content.

CONSTRAINTS:
- Determine the appropriate depth based on content complexity (maximum 20 levels allowed)
- Use deeper hierarchies for complex topics with many sub-concepts
- Use shallower hierarchies for simpler, straightforward topics
- Aim for 3-7 children per node when appropriate
- Total nodes should scale with content complexity (15-100+ nodes depending on content)
- Sources combined: {source_count}

DEPTH GUIDELINES:
- Simple topics: 2-4 levels
- Moderate topics: 4-8 levels
- Complex technical topics: 6-12 levels
- Very detailed/comprehensive content: 10-20 levels

CONTENT:
{content}

Generate the mind map JSON now. Remember to return ONLY valid JSON, no markdown formatting."""

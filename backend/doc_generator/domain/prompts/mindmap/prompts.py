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
    }

    return base_prompt + mode_instructions.get(mode, mode_instructions["summarize"])


def mindmap_user_prompt(content: str, max_depth: int, source_count: int) -> str:
    """Get the user prompt for mind map generation.

    Args:
        content: The source content to create a mind map from
        max_depth: Maximum depth of the tree (2-5)
        source_count: Number of sources being processed

    Returns:
        User prompt string
    """
    return f"""Create a mind map from the following content.

CONSTRAINTS:
- Maximum tree depth: {max_depth} levels (root counts as level 1)
- Aim for 3-7 children per node when appropriate
- Total nodes should be between 15-50 depending on content complexity
- Sources combined: {source_count}

CONTENT:
{content}

Generate the mind map JSON now. Remember to return ONLY valid JSON, no markdown formatting."""

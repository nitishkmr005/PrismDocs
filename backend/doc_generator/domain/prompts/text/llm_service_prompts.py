"""
Prompt templates for LLM service operations.
"""


def executive_summary_system_prompt() -> str:
    return "You are an executive communication specialist who creates clear, impactful summaries for senior leadership."


def executive_summary_prompt(content: str, max_points: int) -> str:
    return f"""Analyze the following content and create an executive summary suitable for senior leadership.

Requirements:
- Maximum {max_points} key points
- Focus on strategic insights, outcomes, and business impact
- Use clear, concise language
- Format as bullet points
- Each point should be 1-2 sentences max
- Use ONLY information present in the content; do not add new facts or assumptions

Content:
{content[:8000]}

Respond with ONLY the bullet points, no introduction or conclusion."""


def slide_structure_system_prompt() -> str:
    return "You are a presentation design expert who creates compelling executive presentations. Always respond with valid JSON."


def slide_structure_prompt(content: str, max_slides: int) -> str:
    return f"""Convert the following content into a corporate presentation structure.

Requirements:
- Maximum {max_slides} slides (excluding title slide)
- Each slide should have:
  - A clear, action-oriented title (5-8 words)
  - 3-4 bullet points (concise, 7-10 words max each)
  - Speaker notes (2-3 sentences for context)
- Focus on key messages that matter to senior leadership
- Use professional business language suitable for executive review
- Structure for logical flow (problem → insight → implication → action)
- Ensure bullet points are parallel in structure and style
- Avoid copying sentences verbatim; condense into crisp, decision-ready bullets
- Do NOT include numeric prefixes like "1." or "2.1" in titles or bullets
- Do not include markdown formatting, only plain text
- Use ONLY information from the content; do not introduce new facts or examples

Content:
{content[:8000]}

Respond in JSON format:
{{
  "slides": [
    {{
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "speaker_notes": "Context for the presenter..."
    }}
  ]
}}"""


def section_slide_structure_system_prompt() -> str:
    return "You are a presentation designer creating concise, slide-ready content. Always respond with valid JSON."


def section_slide_structure_prompt(sections: list[dict], max_slides: int) -> str:
    section_blocks = []
    for idx, section in enumerate(sections[:max_slides], 1):
        title = section.get("title", f"Section {idx}")
        content = section.get("content", "")
        image_hint = section.get("image_hint", "")
        snippet = content[:1200]
        section_blocks.append(
            f"Section {idx}: {title}\n"
            f"Image hint: {image_hint or 'None'}\n"
            f"Content:\n{snippet}\n"
        )

    return f"""Create a presentation outline aligned to the sections below.

Requirements:
- One slide per section (maximum {max_slides})
- Title must match the section title exactly
- 3-4 bullet points per slide, 7-10 words max each
- Bullets should be parallel, action-led, and slide-ready
- Avoid filler phrases and long sentences
- Bullets should align to the section content and image hint
- Avoid copying sentences verbatim; condense into executive-ready bullets
- Do NOT include numeric prefixes like "1." or "2.1" in titles or bullets
- Do not include markdown formatting, only plain text
- Provide 1-2 sentence speaker notes per slide
- Use ONLY information from each section; do not add new facts or examples

Sections:
{chr(10).join(section_blocks)}

Respond in JSON format:
{{
  "slides": [
    {{
      "section_title": "Exact Section Title",
      "title": "Exact Section Title",
      "bullets": ["Point 1", "Point 2"],
      "speaker_notes": "Brief speaker notes"
    }}
  ]
}}"""

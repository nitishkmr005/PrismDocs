"""
Text prompt templates for content generation.
"""

from .content_generator_prompts import (
    build_blog_from_outline_prompt,
    build_chunk_prompt,
    build_generation_prompt,
    build_outline_prompt,
    build_title_prompt,
    get_content_system_prompt,
)
from .llm_service_prompts import (
    executive_summary_prompt,
    executive_summary_system_prompt,
    section_slide_structure_prompt,
    section_slide_structure_system_prompt,
    slide_structure_prompt,
    slide_structure_system_prompt,
)

__all__ = [
    "build_blog_from_outline_prompt",
    "build_chunk_prompt",
    "build_generation_prompt",
    "build_outline_prompt",
    "build_title_prompt",
    "executive_summary_prompt",
    "executive_summary_system_prompt",
    "get_content_system_prompt",
    "section_slide_structure_prompt",
    "section_slide_structure_system_prompt",
    "slide_structure_prompt",
    "slide_structure_system_prompt",
]

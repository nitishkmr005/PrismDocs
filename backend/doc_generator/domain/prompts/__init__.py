"""
Prompt templates for LLM-powered document generation.

Exports prompt templates used by LLM content, image generation, and services.
"""

from .image import (
    build_gemini_image_prompt,
    build_image_description_prompt,
    build_prompt_generator_prompt,
)
from .text import (
    build_blog_from_outline_prompt,
    build_chunk_prompt,
    build_generation_prompt,
    build_outline_prompt,
    build_title_prompt,
    executive_summary_prompt,
    executive_summary_system_prompt,
    get_content_system_prompt,
    section_slide_structure_prompt,
    section_slide_structure_system_prompt,
    slide_structure_prompt,
    slide_structure_system_prompt,
)

__all__ = [
    "build_blog_from_outline_prompt",
    "build_chunk_prompt",
    "build_generation_prompt",
    "build_gemini_image_prompt",
    "build_image_description_prompt",
    "build_outline_prompt",
    "build_prompt_generator_prompt",
    "build_title_prompt",
    "executive_summary_prompt",
    "executive_summary_system_prompt",
    "get_content_system_prompt",
    "section_slide_structure_prompt",
    "section_slide_structure_system_prompt",
    "slide_structure_prompt",
    "slide_structure_system_prompt",
]

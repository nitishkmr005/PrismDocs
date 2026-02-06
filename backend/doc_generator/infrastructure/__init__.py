"""
Infrastructure layer for document generator.

This layer contains external dependencies and adapters:
- api/        - FastAPI HTTP layer (routes, schemas, dependencies)
- llm/        - LLM providers (Gemini, OpenAI, Claude)
- generators/ - Output generators (PDF, PPTX)
- parsers/    - Content parsers (MarkItDown, fallbacks)
- image/      - Image generation (Gemini, SVG)
- storage/    - File storage operations
"""

# Re-export commonly used items for backward compatibility
# Parsers
from . import parsers

# Image generators
from .image import (
    GeminiImageGenerator,
    encode_image_base64,
)

# LLM services
from .llm import LLMContentGenerator, LLMService
from .settings import Settings, get_settings

__all__ = [
    # Settings
    "get_settings",
    "Settings",
    # LLM
    "LLMService",
    "LLMContentGenerator",
    # Image
    "GeminiImageGenerator",
    "encode_image_base64",
    # Parsers
    "parsers",
]

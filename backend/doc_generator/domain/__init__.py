"""
Domain layer for document generator.

This layer contains pure business logic with no external dependencies:
- models.py       - Domain entities (Document, Section, etc.)
- exceptions.py   - Domain-specific exceptions
- interfaces.py   - Abstract interfaces/protocols
- content_types.py - Enums and value objects
- prompts/        - LLM prompts (domain knowledge)
"""

from .content_types import Audience, ContentFormat, ImageType, OutputFormat
from .exceptions import (
    DocumentGeneratorError,
    GenerationError,
    ParseError,
    UnsupportedFormatError,
    ValidationError,
)
from .interfaces import ContentParser, OutputGenerator
from .models import WorkflowState

__all__ = [
    # Models
    "WorkflowState",
    # Exceptions
    "DocumentGeneratorError",
    "GenerationError",
    "ParseError",
    "ValidationError",
    "UnsupportedFormatError",
    # Content types
    "ImageType",
    "ContentFormat",
    "OutputFormat",
    "Audience",
    # Interfaces
    "ContentParser",
    "OutputGenerator",
]

"""
Settings re-export for config module convenience.

The actual settings implementation is in infrastructure/settings.py.
This module provides a convenience import path:

    from doc_generator.config import settings, get_settings

For backwards compatibility, settings can also be imported from:
    from doc_generator.infrastructure.settings import settings, get_settings
"""

# Re-export from infrastructure for convenience
from ..infrastructure.settings import (
    # Sub-settings classes
    GeneratorSettings,
    ImageGenerationSettings,
    LlmSettings,
    LoggingSettings,
    ParserSettings,
    PdfCodeSettings,
    PdfHeaderFooterSettings,
    PdfMarginSettings,
    PdfMetadataSettings,
    PdfPaletteSettings,
    PdfQualitySettings,
    PdfSettings,
    PdfTocSettings,
    PdfTypographySettings,
    PptxSettings,
    PptxThemeSettings,
    Settings,
    WebParserSettings,
    get_settings,
    settings,
)

__all__ = [
    "Settings",
    "get_settings",
    "settings",
    "GeneratorSettings",
    "LlmSettings",
    "LoggingSettings",
    "PdfSettings",
    "PdfPaletteSettings",
    "PdfMarginSettings",
    "PdfTocSettings",
    "PdfCodeSettings",
    "PdfHeaderFooterSettings",
    "PdfTypographySettings",
    "PdfMetadataSettings",
    "PdfQualitySettings",
    "PptxSettings",
    "PptxThemeSettings",
    "ParserSettings",
    "WebParserSettings",
    "ImageGenerationSettings",
]

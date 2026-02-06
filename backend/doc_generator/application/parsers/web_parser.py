"""
Web article parser using MarkItDown or Firecrawl.

Fetches and converts web pages to markdown.
"""

import os
from pathlib import Path
from typing import Tuple

from loguru import logger

from ...domain.exceptions import ParseError
from ...infrastructure.parsers.firecrawl import (
    convert_url_to_markdown as convert_url_to_markdown_firecrawl,
)
from ...infrastructure.parsers.firecrawl import (
    is_firecrawl_available,
)
from ...infrastructure.parsers.markitdown import convert_url_to_markdown, is_markitdown_available
from ...infrastructure.settings import get_settings
from ...utils.content_cleaner import clean_markdown_content


class WebParser:
    """
    Parser for web articles and HTML content.

    Uses Microsoft's MarkItDown library to convert HTML to markdown.
    """

    def __init__(self, parser: str | None = None):
        """
        Invoked by: (no references found)
        """
        self.settings = get_settings().parsers.web
        self.parser = (parser or self.settings.default_parser or "firecrawl").lower()
        if self.parser == "firecrawl" and not is_firecrawl_available():
            logger.warning("Firecrawl not available - falling back to MarkItDown")
            self.parser = "markitdown"
        if self.parser == "markitdown" and not is_markitdown_available():
            logger.warning("MarkItDown not available - web parsing will fail")

    def parse(self, input_path: str | Path) -> Tuple[str, dict]:
        """
        Fetch and parse web article.

        Args:
            input_path: URL to web page

        Returns:
            Tuple of (markdown_content, metadata)

        Raises:
            ParseError: If fetching or parsing fails
        Invoked by: .claude/skills/pptx/ooxml/scripts/pack.py, .claude/skills/pptx/ooxml/scripts/validation/base.py, .claude/skills/pptx/ooxml/scripts/validation/docx.py, .claude/skills/pptx/ooxml/scripts/validation/pptx.py, .claude/skills/pptx/ooxml/scripts/validation/redlining.py, scripts/generate_from_folder.py, src/doc_generator/application/nodes/parse_content.py, src/doc_generator/application/workflow/nodes/parse_content.py, src/doc_generator/infrastructure/api/services/generation.py
        """
        url = str(input_path)
        logger.info(f"Fetching web article: {url} (parser={self.parser})")

        try:
            content, metadata, parser_used = self._fetch_markdown(url)
            cleaned_content = clean_markdown_content(content)
            if cleaned_content:
                content = cleaned_content

            # Extract title from content (first heading)
            title = metadata.get("title") or self._extract_title_from_markdown(content)
            metadata = {
                **metadata,
                "title": title,
                "url": url,
                "parser": parser_used,
            }

            logger.info(
                f"Web parsing completed: {len(content)} chars, "
                f"title='{title}'"
            )

            return content, metadata

        except Exception as e:
            logger.error(f"Web parsing failed for {url}: {e}")
            raise ParseError(f"Failed to parse web article: {e}")

    def _fetch_markdown(self, url: str) -> Tuple[str, dict, str]:
        """
        Fetch markdown using the selected parser.
        Invoked by: src/doc_generator/application/parsers/web_parser.py
        """
        parser = self.parser
        if parser == "auto":
            if is_firecrawl_available() and os.getenv("FIRECRAWL_API_KEY"):
                parser = "firecrawl"
            else:
                parser = "markitdown"

        if parser == "firecrawl":
            try:
                content, metadata = convert_url_to_markdown_firecrawl(url)
                return content, metadata, parser
            except Exception as e:
                logger.warning(f"Firecrawl failed, falling back to MarkItDown: {e}")
                parser = "markitdown"

        if not is_markitdown_available():
            raise ParseError("MarkItDown is not available for web parsing")

        content = convert_url_to_markdown(
            url,
            timeout=self.settings.timeout,
            user_agent=self.settings.user_agent,
        )
        return content, {}, parser

    def _extract_title_from_markdown(self, content: str) -> str:
        """
        Extract title from markdown content (first H1 heading).

        Args:
            content: Markdown content

        Returns:
            Extracted title or default
        Invoked by: src/doc_generator/application/parsers/web_parser.py
        """
        import re

        # Look for first H1 heading
        match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)

        if match:
            return match.group(1).strip()

        return "Web Article"

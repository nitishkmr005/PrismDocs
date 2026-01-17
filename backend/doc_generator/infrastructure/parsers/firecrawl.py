"""
Firecrawl adapter for web scraping and markdown extraction.
"""

import inspect
import os
from typing import Any, Tuple

from loguru import logger

try:
    from firecrawl import Firecrawl
    FIRECRAWL_AVAILABLE = True
except ImportError:
    FIRECRAWL_AVAILABLE = False
    logger.warning("Firecrawl not available - Firecrawl web parsing disabled")

from ...domain.exceptions import ParseError


def _metadata_to_dict(value: Any) -> dict:
    """
    Normalize metadata objects to a plain dict.
    """
    if value is None:
        return {}
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        return value.model_dump()
    if hasattr(value, "dict"):
        return value.dict()
    if hasattr(value, "__dict__"):
        return dict(value.__dict__)
    return {}


def _get_field(obj: Any, name: str) -> Any:
    """
    Get a field from either a dict or an object.
    """
    if isinstance(obj, dict):
        return obj.get(name)
    return getattr(obj, name, None)


def _extract_firecrawl_payload(result: Any) -> Tuple[str, dict]:
    """
    Extract markdown content and metadata from a Firecrawl response.
    """
    markdown = None
    metadata: dict = {}
    title = None

    metadata = _metadata_to_dict(_get_field(result, "metadata"))
    title = _get_field(result, "title") or metadata.get("title")

    data = _get_field(result, "data")
    if isinstance(data, list) and data:
        data = data[0]

    if data is not None:
        data_metadata = _metadata_to_dict(_get_field(data, "metadata"))
        if data_metadata:
            metadata = {**metadata, **data_metadata}
        title = title or _get_field(data, "title") or metadata.get("title")
        markdown = _get_field(data, "markdown") or _get_field(data, "content")

    markdown = markdown or _get_field(result, "markdown") or _get_field(result, "content")

    if title and "title" not in metadata:
        metadata["title"] = title

    if not isinstance(markdown, str) or not markdown.strip():
        raise ParseError("Firecrawl returned empty content")

    return markdown, metadata


def convert_url_to_markdown(
    url: str,
    api_key: str | None = None,
) -> Tuple[str, dict]:
    """
    Convert web page to markdown using Firecrawl.

    Args:
        url: URL to web page
        api_key: Firecrawl API key (defaults to FIRECRAWL_API_KEY env var)

    Returns:
        Tuple of markdown content and metadata

    Raises:
        ParseError: If conversion fails
        ImportError: If Firecrawl is not installed
    """
    if not FIRECRAWL_AVAILABLE:
        raise ImportError(
            "Firecrawl is not installed. Install with: pip install firecrawl-py"
        )

    api_key = api_key or os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        raise ParseError("FIRECRAWL_API_KEY is not set")

    try:
        logger.info(f"Fetching URL with Firecrawl: {url}")
        app = Firecrawl(api_key=api_key)
        scrape_kwargs = {}
        try:
            signature = inspect.signature(app.scrape)
            if "formats" in signature.parameters:
                scrape_kwargs["formats"] = ["markdown"]
        except (TypeError, ValueError):
            scrape_kwargs = {}

        try:
            result = app.scrape(url, **scrape_kwargs)
        except TypeError:
            result = app.scrape(url)
        markdown, metadata = _extract_firecrawl_payload(result)
        logger.info(f"Firecrawl conversion successful: {len(markdown)} chars")
        return markdown, metadata
    except Exception as e:
        logger.error(f"Firecrawl URL conversion failed for {url}: {e}")
        raise ParseError(f"Failed to convert URL with Firecrawl: {e}")


def is_firecrawl_available() -> bool:
    """
    Check if Firecrawl is available.

    Returns:
        True if Firecrawl is installed, False otherwise
    """
    return FIRECRAWL_AVAILABLE

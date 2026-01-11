"""Generation service for document creation with progress streaming."""

import asyncio
import tempfile
from pathlib import Path
from typing import AsyncIterator, Optional

from loguru import logger

from ..models.requests import (
    GenerateRequest,
    FileSource,
    UrlSource,
    TextSource,
)
from ..models.responses import (
    GenerationStatus,
    ProgressEvent,
    CompleteEvent,
    CompletionMetadata,
    ErrorEvent,
)
from .storage import StorageService


class GenerationService:
    """Orchestrates document generation with progress streaming."""

    def __init__(
        self,
        output_dir: Path = Path("src/output/generated"),
        storage_service: Optional[StorageService] = None,
    ):
        """Initialize generation service.

        Args:
            output_dir: Directory for generated outputs
            storage_service: Storage service for file operations
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.storage = storage_service or StorageService()

    async def generate(
        self,
        request: GenerateRequest,
        api_key: str,
    ) -> AsyncIterator[ProgressEvent | CompleteEvent | ErrorEvent]:
        """Generate document with progress streaming.

        Args:
            request: Generation request
            api_key: API key for LLM provider

        Yields:
            Progress events, then completion or error event
        """
        try:
            # Phase 1: Parse sources
            yield ProgressEvent(
                status=GenerationStatus.PARSING,
                progress=5,
                message="Starting to parse sources...",
            )

            content = await self._collect_sources(request)

            yield ProgressEvent(
                status=GenerationStatus.PARSING,
                progress=20,
                message=f"Parsed {len(request.sources.primary)} primary sources",
            )

            # Phase 2: Transform content
            yield ProgressEvent(
                status=GenerationStatus.TRANSFORMING,
                progress=30,
                message="Structuring content...",
            )

            # Run the workflow
            result = await self._run_workflow(
                content=content,
                request=request,
                api_key=api_key,
            )

            yield ProgressEvent(
                status=GenerationStatus.TRANSFORMING,
                progress=50,
                message="Content structured",
            )

            # Phase 3: Generate images (if applicable)
            yield ProgressEvent(
                status=GenerationStatus.GENERATING_IMAGES,
                progress=60,
                message="Generating images...",
            )

            await asyncio.sleep(0.1)  # Placeholder for actual image generation

            yield ProgressEvent(
                status=GenerationStatus.GENERATING_IMAGES,
                progress=70,
                message="Images generated",
            )

            # Phase 4: Generate output
            yield ProgressEvent(
                status=GenerationStatus.GENERATING_OUTPUT,
                progress=80,
                message=f"Building {request.output_format.value.upper()}...",
            )

            output_path = result.get("output_path", "")

            yield ProgressEvent(
                status=GenerationStatus.GENERATING_OUTPUT,
                progress=90,
                message="Output generated",
            )

            # Phase 5: Upload/finalize
            yield ProgressEvent(
                status=GenerationStatus.UPLOADING,
                progress=95,
                message="Finalizing...",
            )

            download_url = self.storage.get_download_url(Path(output_path)) if output_path else "/api/download/placeholder.pdf"

            # Complete
            yield CompleteEvent(
                download_url=download_url,
                expires_in=3600,
                metadata=CompletionMetadata(
                    title=result.get("metadata", {}).get("title", "Generated Document"),
                    pages=result.get("metadata", {}).get("pages", 0),
                    slides=result.get("metadata", {}).get("slides", 0),
                    images_generated=result.get("metadata", {}).get("images_generated", 0),
                ),
            )

        except Exception as e:
            logger.error(f"Generation failed: {e}")
            yield ErrorEvent(
                error=str(e),
                code="GENERATION_ERROR",
            )

    async def _collect_sources(self, request: GenerateRequest) -> str:
        """Collect content from all sources.

        Args:
            request: Generation request

        Returns:
            Combined content string
        """
        contents = []

        all_sources = list(request.sources.primary)
        all_sources.extend(request.sources.supporting)
        all_sources.extend(request.sources.reference)
        all_sources.extend(request.sources.data)

        for category_sources in request.sources.other.values():
            all_sources.extend(category_sources)

        for source in all_sources:
            if isinstance(source, TextSource):
                contents.append(source.content)
            elif isinstance(source, UrlSource):
                # TODO: Fetch URL content using web parser
                contents.append(f"[Content from: {source.url}]")
            elif isinstance(source, FileSource):
                # TODO: Get file content from storage
                contents.append(f"[Content from file: {source.file_id}]")

        return "\n\n".join(contents)

    async def _run_workflow(
        self,
        content: str,
        request: GenerateRequest,
        api_key: str,
    ) -> dict:
        """Run the document generation workflow.

        Args:
            content: Combined source content
            request: Generation request
            api_key: API key for LLM

        Returns:
            Workflow result dict
        """
        # For now, return a placeholder result
        # TODO: Integrate with actual graph_workflow
        return {
            "output_path": "",
            "metadata": {
                "title": "Generated Document",
                "pages": 0,
                "slides": 0,
                "images_generated": 0,
            },
        }

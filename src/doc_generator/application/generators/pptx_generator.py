"""
PPTX generator using python-pptx.

Generates PowerPoint presentations from structured markdown content.
Supports LLM-enhanced slide generation for executive presentations.
"""

import hashlib
import re
from pathlib import Path

from loguru import logger

from ...domain.exceptions import GenerationError
from ...infrastructure.pdf_utils import parse_markdown_lines
from ...infrastructure.pptx_utils import (
    add_chart_slide,
    add_content_slide,
    add_executive_summary_slide,
    add_image_slide,
    add_section_header_slide,
    add_title_slide,
    create_presentation,
    save_presentation,
)
from ...infrastructure.svg_generator import generate_chart
from ...utils.image_utils import resolve_image_path


class PPTXGenerator:
    """
    PPTX generator using python-pptx.

    Converts structured markdown content to PowerPoint presentation.
    """

    def __init__(self):
        """Initialize PPTX generator."""
        self._image_cache: Path | None = None
        self._max_bullets_per_slide = 4

    def _generate_mermaid_image(self, mermaid_code: str) -> Path | None:
        """
        Generate an image from mermaid code using Gemini.

        Args:
            mermaid_code: Mermaid diagram code

        Returns:
            Path to generated image or None if failed
        """
        if not self._image_cache:
            return None

        try:
            from ...infrastructure.gemini_image_generator import get_gemini_generator
        except ImportError:
            logger.warning("Gemini generator not available")
            return None

        self._image_cache.mkdir(parents=True, exist_ok=True)
        digest = hashlib.sha256(mermaid_code.encode("utf-8")).hexdigest()[:12]
        out_path = self._image_cache / f"mermaid-pptx-{digest}.png"

        if out_path.exists():
            return out_path

        generator = get_gemini_generator()
        if not generator.is_available():
            logger.warning("Gemini not available for mermaid rendering")
            return None

        result = generator.generate_diagram_from_mermaid(mermaid_code, out_path)
        return result

    def generate(self, content: dict, metadata: dict, output_dir: Path) -> Path:
        """
        Generate PPTX from structured content.

        Uses LLM-enhanced content when available for executive-quality presentations.

        Args:
            content: Structured content dictionary with 'title', 'markdown',
                     and optional 'slides', 'executive_summary', 'charts' keys
            metadata: Document metadata
            output_dir: Output directory

        Returns:
            Path to generated PPTX

        Raises:
            GenerationError: If PPTX generation fails
        """
        try:
            # Ensure output directory exists
            output_dir.mkdir(parents=True, exist_ok=True)

            # Set up image cache for mermaid diagrams
            self._image_cache = output_dir / "images"

            # Create output path
            # Get title for presentation content
            markdown_content = content.get("markdown", content.get("raw_content", ""))
            title = self._resolve_display_title(metadata.get("title", "presentation"), markdown_content)

            # Check for custom filename for output file
            if "custom_filename" in metadata:
                filename = metadata["custom_filename"]
            else:
                filename = title.replace(" ", "_").replace("/", "_")

            output_path = output_dir / f"{filename}.pptx"

            logger.info(f"Generating PPTX: {output_path.name}")

            if not markdown_content:
                raise GenerationError("No content provided for PPTX generation")

            # Check for LLM enhancements
            has_llm_enhancements = any(
                key in content for key in ["slides", "executive_summary", "charts", "visualizations"]
            )

            if has_llm_enhancements:
                logger.info("Using LLM-enhanced slide generation")

            # Create presentation with full structured content
            self._create_presentation(
                output_path,
                title,
                markdown_content,
                metadata,
                structured_content=content if has_llm_enhancements else None
            )

            logger.info(f"PPTX generated successfully: {output_path}")

            return output_path

        except Exception as e:
            logger.error(f"PPTX generation failed: {e}")
            raise GenerationError(f"Failed to generate PPTX: {e}")

    def _create_presentation(
        self,
        output_path: Path,
        title: str,
        markdown_content: str,
        metadata: dict,
        structured_content: dict = None
    ) -> None:
        """
        Create PowerPoint presentation.

        Uses LLM-generated slide structure when available for executive-quality output.

        Args:
            output_path: Path to output PPTX
            title: Presentation title
            markdown_content: Markdown content to convert
            metadata: Document metadata
            structured_content: Optional structured content with LLM enhancements
        """
        # Create presentation
        prs = create_presentation()

        # Add title slide
        subtitle = metadata.get("subtitle", metadata.get("author", ""))
        add_title_slide(prs, title, subtitle)

        agenda_items = self._extract_agenda(markdown_content)
        if agenda_items:
            add_content_slide(prs, "Agenda", agenda_items, is_bullets=True)

        # Check for LLM-enhanced content
        allow_diagrams = metadata.get("enable_pptx_diagrams", False)
        if structured_content:
            # Add executive summary if available
            executive_summary = structured_content.get("executive_summary", "")
            if executive_summary:
                summary_points = [
                    line.strip() for line in executive_summary.split("\n")
                    if line.strip() and (line.strip().startswith("-") or line.strip().startswith("•"))
                ]
                if summary_points:
                    add_executive_summary_slide(prs, "Executive Summary", summary_points)
                    logger.debug("Added executive summary slide")

            section_images = structured_content.get("section_images", {})
            self._add_slides_from_markdown(
                prs,
                markdown_content,
                allow_diagrams,
                section_images=section_images
            )

            if allow_diagrams:
                # Add chart slides if suggested
                charts = structured_content.get("charts", [])
                self._add_chart_slides(prs, charts, output_path.parent)

                # Add visualization slides if generated
                visualizations = structured_content.get("visualizations", [])
                self._add_visualization_slides(prs, visualizations)

        else:
            # No LLM enhancement - use markdown-based generation
            self._add_slides_from_markdown(prs, markdown_content, allow_diagrams, section_images={})

        # Save presentation
        save_presentation(prs, output_path)

        logger.debug(f"Created presentation with {len(prs.slides)} slides")

    def _add_llm_slides(self, prs, slides: list[dict]) -> None:
        """
        Add slides from LLM-generated structure.

        Args:
            prs: Presentation object
            slides: List of slide dictionaries with title, bullets, speaker_notes
        """
        for slide_data in slides:
            title = slide_data.get("title", "")
            bullets = slide_data.get("bullets", [])
            speaker_notes = slide_data.get("speaker_notes", "")

            if title and bullets:
                normalized = self._expand_bullets(bullets)
                self._add_bullet_slide_series(
                    prs,
                    title,
                    normalized,
                    speaker_notes=speaker_notes
                )

        logger.debug(f"Added {len(slides)} LLM-generated slides")

    def _add_chart_slides(self, prs, charts: list[dict], output_dir: Path) -> None:
        """
        Generate and add chart slides.

        Args:
            prs: Presentation object
            charts: List of chart suggestions from LLM
            output_dir: Directory for temporary chart files
        """
        for i, chart in enumerate(charts[:3]):  # Max 3 charts
            chart_type = chart.get("chart_type", "bar")
            title = chart.get("title", f"Chart {i+1}")
            data = chart.get("data", [])

            if not data:
                continue

            # Generate SVG
            svg_path = output_dir / f"chart_{i}.svg"
            try:
                generate_chart(chart_type, data, title, svg_path)
                add_chart_slide(prs, title, svg_path)
                logger.debug(f"Added chart slide: {title}")
            except Exception as e:
                logger.warning(f"Failed to generate chart: {e}")

    def _add_visualization_slides(self, prs, visualizations: list[dict]) -> None:
        """
        Add visualization slides from generated SVGs.

        Args:
            prs: Presentation object
            visualizations: List of visualization dictionaries with type, title, path
        """
        for visual in visualizations:
            title = visual.get("title", "Visualization")
            svg_path = visual.get("path", "")

            if not svg_path:
                continue

            svg_path = Path(svg_path)
            if not svg_path.exists():
                logger.warning(f"Visualization SVG not found: {svg_path}")
                continue

            try:
                add_chart_slide(prs, title, svg_path)
                vis_type = visual.get("type", "unknown")
                logger.debug(f"Added {vis_type} visualization slide: {title}")
            except Exception as e:
                logger.warning(f"Failed to add visualization slide: {e}")

    def _add_section_image_slides(self, prs, section_images: dict) -> None:
        """
        Add slides from Gemini-generated section images.

        Args:
            prs: Presentation object
            section_images: Dict mapping section_id -> image info
        """
        if not section_images:
            return

        for section_id, img_info in section_images.items():
            title = img_info.get("section_title", f"Section {section_id}")
            img_path = img_info.get("path", "")
            image_type = img_info.get("image_type", "image")

            if not img_path:
                continue

            img_path = Path(img_path)
            if not img_path.exists():
                logger.warning(f"Section image not found: {img_path}")
                continue

            try:
                add_image_slide(prs, title, img_path, f"{image_type.title()} for {title}")
                logger.debug(f"Added {image_type} slide for section: {title}")
            except Exception as e:
                logger.warning(f"Failed to add section image slide: {e}")

    def _add_slides_from_markdown(
        self,
        prs,
        markdown_content: str,
        allow_diagrams: bool = False,
        section_images: dict | None = None
    ) -> None:
        """
        Parse markdown and add slides to presentation.

        Creates slides based on markdown structure:
        - H1: Section header slides
        - H2: Content slide titles
        - Bullets: Bullet points on content slides
        - Images: Image slides

        Args:
            prs: Presentation object
            markdown_content: Markdown content to parse
        """
        section_images = section_images or {}
        current_slide_title = None
        current_slide_content = []
        section_index = -1
        for kind, content_item in parse_markdown_lines(markdown_content):
            # H1 becomes section header
            if kind == "h1":
                # Flush current slide if any
                if current_slide_title and current_slide_content:
                    self._add_bullet_slide_series(
                        prs,
                        current_slide_title,
                        current_slide_content
                    )
                    current_slide_content = []

                # Add section header
                add_section_header_slide(prs, content_item)
                current_slide_title = None

            # H2 becomes slide title
            elif kind == "h2":
                section_index += 1
                # Flush current slide if any
                if current_slide_title and current_slide_content:
                    self._add_bullet_slide_series(
                        prs,
                        current_slide_title,
                        current_slide_content
                    )

                if section_index in section_images:
                    img_info = section_images[section_index]
                    img_path = Path(img_info.get("path", ""))
                    if img_path.exists():
                        image_type = img_info.get("image_type", "image").title()
                        add_image_slide(prs, content_item, img_path, f"{image_type} for {content_item}")

                # Start new slide
                current_slide_title = content_item
                current_slide_content = []

            # H3 becomes content item (if no H2 title yet, becomes title)
            elif kind == "h3":
                if current_slide_title:
                    current_slide_content.append(content_item)
                else:
                    current_slide_title = content_item
                    current_slide_content = []

            # Bullets
            elif kind == "bullets":
                current_slide_content.extend(self._expand_bullets(content_item))

            # Paragraphs
            elif kind == "para":
                if content_item.strip():
                    current_slide_content.extend(self._expand_bullets([content_item]))

            # Images
            elif kind == "image":
                # Flush current slide if any
                if current_slide_title and current_slide_content:
                    self._add_bullet_slide_series(
                        prs,
                        current_slide_title,
                        current_slide_content
                    )
                    current_slide_content = []
                    current_slide_title = None

                alt, url = content_item
                image_path = self._resolve_image_path(url)
                if image_path:
                    add_image_slide(prs, alt, image_path, alt)
                else:
                    # Add as text slide if image not found
                    if not current_slide_title:
                        current_slide_title = "Image"
                    current_slide_content.append(f"Image: {alt}")

            # Code blocks, quotes - add as text content
            elif kind in ["code", "quote"]:
                # Truncate long code blocks for slides
                if len(content_item) > 200:
                    content_item = content_item[:200] + "..."
                current_slide_content.append(content_item)

            # Tables - add summary
            elif kind == "table":
                if content_item:
                    current_slide_content.append(f"Table with {len(content_item)} rows")

            # Mermaid diagrams - intentionally skipped
            elif kind == "mermaid":
                continue

            elif kind == "visual_marker":
                continue

        # Flush final slide
        if current_slide_title and current_slide_content:
            self._add_bullet_slide_series(
                prs,
                current_slide_title,
                current_slide_content
            )

    def _resolve_image_path(self, url: str) -> Path | None:
        """
        Resolve image URL to local path.

        Args:
            url: Image URL or path

        Returns:
            Path to local image or None
        """
        return resolve_image_path(url)

    def _extract_agenda(self, markdown_content: str) -> list[str]:
        headings = []
        for match in re.finditer(r"^##\s+(.+)$", markdown_content, re.MULTILINE):
            heading = match.group(1).strip()
            if heading:
                headings.append(heading)
        return headings[:6]

    def _resolve_display_title(self, metadata_title: str, markdown_content: str) -> str:
        raw_title = (metadata_title or "").strip()
        markdown_title = self._extract_markdown_title(markdown_content)
        cleaned_meta = self._clean_title(raw_title)

        if markdown_title and (not raw_title or self._looks_like_placeholder(raw_title)):
            return markdown_title

        return cleaned_meta or markdown_title or "Presentation"

    def _extract_markdown_title(self, markdown_content: str) -> str:
        match = re.search(r"^#\s+(.+)$", markdown_content, re.MULTILINE)
        return match.group(1).strip() if match else ""

    def _looks_like_placeholder(self, title: str) -> bool:
        if "/" in title or "\\" in title:
            return True
        if re.search(r"\.(pdf|docx|pptx|md|txt)$", title, re.IGNORECASE):
            return True
        if "_" in title and " " not in title:
            return True
        return False

    def _clean_title(self, title: str) -> str:
        if not title:
            return ""
        cleaned = title.strip()
        if "/" in cleaned or "\\" in cleaned:
            parts = [part for part in cleaned.split() if "/" not in part and "\\" not in part]
            cleaned = " ".join(parts) if parts else Path(cleaned).stem
        if re.search(r"\.(pdf|docx|pptx|md|txt)$", cleaned, re.IGNORECASE):
            cleaned = Path(cleaned).stem
        cleaned = cleaned.replace("_", " ").strip()
        return re.sub(r"\s+", " ", cleaned)

    def _add_bullet_slide_series(
        self,
        prs,
        title: str,
        bullets: list[str],
        speaker_notes: str = ""
    ) -> None:
        chunks = list(self._chunk_items(bullets, self._max_bullets_per_slide))
        for idx, chunk in enumerate(chunks):
            slide_title = title if idx == 0 else f"{title} (cont.)"
            add_content_slide(
                prs,
                slide_title,
                chunk,
                is_bullets=True,
                speaker_notes=speaker_notes if idx == 0 else ""
            )

    def _chunk_items(self, items: list[str], chunk_size: int) -> list[list[str]]:
        if not items:
            return []
        return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]

    def _expand_bullets(self, items: list[str]) -> list[str]:
        expanded = []
        for item in items:
            clean = self._normalize_bullet(item)
            if not clean:
                continue
            expanded.extend(self._split_sentences(clean))
        return expanded

    def _normalize_bullet(self, text: str) -> str:
        return text.lstrip("•-* ").strip()

    def _split_sentences(self, text: str) -> list[str]:
        if len(text) < 120:
            return [text]
        parts = [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]
        if len(parts) > 1:
            return parts
        clauses = [part.strip() for part in re.split(r"[;:]\s+", text) if part.strip()]
        return clauses if len(clauses) > 1 else [text]

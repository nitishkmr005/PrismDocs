"""
Image generation and editing service using Gemini models.

Supports:
- Raster image generation with gemini-3-pro-image-preview
- SVG generation with gemini-3-pro-preview
- Image editing with gemini-3-pro-image-preview
"""

import base64
import io
import re
import time
from typing import Optional

from loguru import logger

from ...domain.image_styles import ImageStyle, get_style_by_id

# Try to import Gemini client
try:
    from google import genai
    from google.genai import types

    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    genai = None
    types = None
    logger.warning("google-genai not installed - image generation/editing disabled")

try:
    from PIL import Image

    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    Image = None
    logger.warning("Pillow not installed - image processing limited")


# Model names
RASTER_MODEL = "gemini-3-pro-image-preview"
SVG_MODEL = "gemini-3-pro-preview"

# Fallback models for image generation (in order of preference)
RASTER_FALLBACK_MODELS = [
    "gemini-3-pro-image-preview",  # Primary
    "gemini-2.5-flash-image",  # Fallback
]


class ImageService:
    """
    Service for generating and editing images using Gemini models.
    """

    def __init__(self, api_key: str):
        """
        Initialize the image service with API key.

        Args:
            api_key: Gemini API key
        """
        self.api_key = api_key
        self.client = None

        if api_key and GENAI_AVAILABLE:
            self.client = genai.Client(api_key=api_key)
            logger.info("ImageService initialized with Gemini client")
        else:
            if not api_key:
                logger.warning("No API key provided for ImageService")
            if not GENAI_AVAILABLE:
                logger.warning("google-genai not available")

    def is_available(self) -> bool:
        """Check if the service is available."""
        return self.client is not None

    def generate_raster_image(
        self,
        prompt: str,
        style: Optional[ImageStyle] = None,
        free_text_mode: bool = False,
    ) -> tuple[Optional[str], str]:
        """
        Generate a raster image using Gemini.

        Args:
            prompt: User's description of the image
            style: Optional style to apply
            free_text_mode: If True, use prompt directly without style enhancement

        Returns:
            Tuple of (base64_image_data, prompt_used)
        """
        if not self.is_available():
            logger.error("ImageService not available")
            return None, prompt

        # Build the final prompt
        if free_text_mode or style is None:
            final_prompt = self._build_free_text_prompt(prompt)
        else:
            final_prompt = self._build_styled_prompt(prompt, style)

        start_time = time.perf_counter()
        last_error = None

        # Try each model in the fallback list
        for model in RASTER_FALLBACK_MODELS:
            try:
                logger.info(f"Generating raster image with model: {model}")

                # Create chat with image generation capabilities
                chat = self.client.chats.create(
                    model=model,
                    config=types.GenerateContentConfig(response_modalities=["IMAGE"]),
                )

                # Send the prompt
                response = chat.send_message(final_prompt)

                # Extract image from response
                for part in response.parts:
                    if hasattr(part, "as_image"):
                        image = part.as_image()
                        if image:
                            base64_data = self._encode_image(image)
                            if not base64_data:
                                logger.warning("Failed to encode raster image")
                                continue

                            duration_ms = int((time.perf_counter() - start_time) * 1000)
                            logger.success(
                                f"Raster image generated with {model} in {duration_ms}ms"
                            )
                            return base64_data, final_prompt

                logger.warning(f"No image in response from {model}")
                # Try next model

            except Exception as e:
                error_str = str(e)
                last_error = e
                # Check if it's a 503/overload error that we should retry
                if (
                    "503" in error_str
                    or "overload" in error_str.lower()
                    or "unavailable" in error_str.lower()
                ):
                    logger.warning(
                        f"Model {model} overloaded, trying next model. Error: {error_str[:100]}"
                    )
                    continue
                else:
                    logger.error(f"Raster image generation failed with {model}: {e}")
                    # For non-overload errors, still try next model
                    continue

        # All models failed
        if last_error:
            logger.error(f"All image models failed. Last error: {last_error}")
        return None, final_prompt

    def generate_svg(
        self,
        prompt: str,
        style: Optional[ImageStyle] = None,
        free_text_mode: bool = False,
    ) -> tuple[Optional[str], str]:
        """
        Generate SVG code using Gemini text model.

        Args:
            prompt: User's description of the diagram
            style: Optional style to apply
            free_text_mode: If True, use prompt directly without style enhancement

        Returns:
            Tuple of (svg_code, prompt_used)
        """
        if not self.is_available():
            logger.error("ImageService not available")
            return None, prompt

        # Build the SVG generation prompt
        if free_text_mode or style is None:
            final_prompt = self._build_svg_free_text_prompt(prompt)
        else:
            final_prompt = self._build_svg_styled_prompt(prompt, style)

        try:
            logger.info(f"Generating SVG with model: {SVG_MODEL}")
            start_time = time.perf_counter()

            response = self.client.models.generate_content(
                model=SVG_MODEL,
                contents=final_prompt,
            )

            response_text = (response.text or "").strip()

            # Extract SVG code from response
            svg_code = self._extract_svg(response_text)

            if svg_code:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                logger.success(f"SVG generated in {duration_ms}ms")
                return svg_code, final_prompt
            else:
                logger.warning("No valid SVG in response")
                return None, final_prompt

        except Exception as e:
            logger.error(f"SVG generation failed: {e}")
            return None, final_prompt

    def edit_image(
        self,
        image_base64: str,
        prompt: str,
        style: Optional[ImageStyle] = None,
        region: Optional[dict] = None,
    ) -> Optional[str]:
        """
        Edit an existing image using Gemini.

        Args:
            image_base64: Base64 encoded source image
            prompt: Edit instructions
            style: Optional style for style transfer
            region: Optional region dict with x, y, width, height (normalized 0-1)

        Returns:
            Base64 encoded edited image or None if failed
        """
        if not self.is_available():
            logger.error("ImageService not available")
            return None

        # Build the edit prompt
        final_prompt = self._build_edit_prompt(prompt, style, region)

        # Decode the input image (once, reuse for all attempts)
        try:
            image_bytes = base64.b64decode(image_base64)
        except Exception as e:
            logger.error(f"Failed to decode input image: {e}")
            return None

        start_time = time.perf_counter()
        last_error = None

        # Try each model in the fallback list
        for model in RASTER_FALLBACK_MODELS:
            try:
                logger.info(f"Editing image with model: {model}")

                # Create the image part for the API
                image_part = types.Part.from_bytes(
                    data=image_bytes, mime_type="image/png"
                )

                # Create chat with image generation capabilities
                chat = self.client.chats.create(
                    model=model,
                    config=types.GenerateContentConfig(response_modalities=["IMAGE"]),
                )

                # Send image and edit prompt
                response = chat.send_message([image_part, final_prompt])

                # Extract edited image from response
                for part in response.parts:
                    if hasattr(part, "as_image"):
                        image = part.as_image()
                        if image:
                            base64_data = self._encode_image(image)
                            if not base64_data:
                                logger.warning("Failed to encode edited image")
                                continue

                            duration_ms = int((time.perf_counter() - start_time) * 1000)
                            logger.success(
                                f"Image edited with {model} in {duration_ms}ms"
                            )
                            return base64_data

                logger.warning(f"No edited image in response from {model}")
                # Try next model

            except Exception as e:
                error_str = str(e)
                last_error = e
                if (
                    "503" in error_str
                    or "overload" in error_str.lower()
                    or "unavailable" in error_str.lower()
                ):
                    logger.warning(
                        f"Model {model} overloaded for editing, trying next model. Error: {error_str[:100]}"
                    )
                    continue
                else:
                    logger.error(f"Image editing failed with {model}: {e}")
                    continue

        # All models failed
        if last_error:
            logger.error(f"All image edit models failed. Last error: {last_error}")
        return None

    def _build_free_text_prompt(self, prompt: str) -> str:
        """Build prompt for free-text mode (no style)."""
        return f"""Generate a high-quality image based on this description:

{prompt}

Requirements:
- Clean, professional appearance
- High contrast and readability
- Suitable for documentation and presentations
"""

    def _build_styled_prompt(self, prompt: str, style: ImageStyle) -> str:
        """Build prompt with style guidance."""
        use_cases_str = ", ".join(style.use_cases)
        return f"""Create a {style.name} image.

Style characteristics: {style.looks_like}

Content to visualize:
{prompt}

Requirements:
- Clean, professional appearance
- High contrast and readability
- Match the visual style described above
- Suitable for: {use_cases_str}
"""

    def _build_svg_free_text_prompt(self, prompt: str) -> str:
        """Build SVG prompt for free-text mode."""
        return f"""Generate SVG code for a technical diagram based on this description:

{prompt}

Requirements:
- Output ONLY valid SVG markup, no explanations or markdown
- No external dependencies or images
- Clean, minimal code with proper indentation
- Professional color scheme (blues, grays, with accent colors)
- Default dimensions: viewBox="0 0 800 600"
- Use clear labels and readable fonts (font-family: Arial, sans-serif)
- Include appropriate arrows and connectors where needed

Output the SVG code directly, starting with <svg and ending with </svg>
"""

    def _build_svg_styled_prompt(self, prompt: str, style: ImageStyle) -> str:
        """Build SVG prompt with style guidance."""
        use_cases_str = ", ".join(style.use_cases)
        return f"""Generate SVG code for a {style.name}.

Style characteristics: {style.looks_like}

Content to visualize:
{prompt}

Requirements:
- Output ONLY valid SVG markup, no explanations or markdown
- No external dependencies or images
- Clean, minimal code with proper indentation
- Professional color scheme appropriate for: {use_cases_str}
- Default dimensions: viewBox="0 0 800 600"
- Use clear labels and readable fonts (font-family: Arial, sans-serif)
- Match the visual style: {style.looks_like}

Output the SVG code directly, starting with <svg and ending with </svg>
"""

    def _build_edit_prompt(
        self,
        prompt: str,
        style: Optional[ImageStyle] = None,
        region: Optional[dict] = None,
    ) -> str:
        """Build prompt for image editing."""
        parts = [f"Edit this image: {prompt}"]

        if style:
            parts.append(
                f"\nApply the visual style of {style.name}: {style.looks_like}"
            )

        if region:
            parts.append(
                f"\nFocus changes on the selected region "
                f"(x: {region['x']:.2f}, y: {region['y']:.2f}, "
                f"width: {region['width']:.2f}, height: {region['height']:.2f}) "
                f"while preserving the rest of the image."
            )

        parts.append("\nMaintain image quality and coherence.")

        return "\n".join(parts)

    def _extract_svg(self, text: str) -> Optional[str]:
        """Extract SVG code from response text."""
        # Try to find SVG in code blocks first
        code_block_pattern = r"```(?:svg|xml)?\s*([\s\S]*?)```"
        matches = re.findall(code_block_pattern, text)
        for match in matches:
            if "<svg" in match and "</svg>" in match:
                return self._clean_svg(match)

        # Try to find raw SVG
        svg_pattern = r"(<svg[\s\S]*?</svg>)"
        matches = re.findall(svg_pattern, text)
        if matches:
            return self._clean_svg(matches[0])

        return None

    def _clean_svg(self, svg: str) -> str:
        """Clean and validate SVG code."""
        # Remove any leading/trailing whitespace
        svg = svg.strip()

        # Ensure it starts with <svg
        if not svg.startswith("<svg"):
            start = svg.find("<svg")
            if start != -1:
                svg = svg[start:]

        # Ensure it ends with </svg>
        if not svg.endswith("</svg>"):
            end = svg.rfind("</svg>")
            if end != -1:
                svg = svg[: end + 6]

        return svg

    def _encode_image(self, image) -> Optional[str]:
        """Encode a generated image into base64 PNG."""
        # Handle raw bytes directly
        if isinstance(image, (bytes, bytearray)):
            return base64.b64encode(image).decode("utf-8")

        buffer = io.BytesIO()

        try:
            # If it's a PIL Image, save directly to buffer
            if PIL_AVAILABLE and isinstance(image, Image.Image):
                image.save(buffer, format="PNG")
                return base64.b64encode(buffer.getvalue()).decode("utf-8")

            # Check if it has a save method that accepts a file path (Gemini SDK image)
            # Some Gemini SDK versions return objects that need special handling
            if hasattr(image, "save"):
                try:
                    # First try: PIL-style save with format
                    image.save(buffer, format="PNG")
                except TypeError:
                    # Second try: Some objects need just the buffer
                    try:
                        image.save(buffer)
                    except TypeError:
                        # Third try: Save to temp file and read back
                        import tempfile
                        import os

                        with tempfile.NamedTemporaryFile(
                            suffix=".png", delete=False
                        ) as tmp:
                            tmp_path = tmp.name
                        try:
                            image.save(tmp_path)
                            with open(tmp_path, "rb") as f:
                                return base64.b64encode(f.read()).decode("utf-8")
                        finally:
                            if os.path.exists(tmp_path):
                                os.remove(tmp_path)

                return base64.b64encode(buffer.getvalue()).decode("utf-8")

            # Check if it has a tobytes method (some image libraries)
            if hasattr(image, "tobytes"):
                # Convert to PIL Image first
                if PIL_AVAILABLE and hasattr(image, "mode") and hasattr(image, "size"):
                    pil_image = Image.frombytes(image.mode, image.size, image.tobytes())
                    pil_image.save(buffer, format="PNG")
                    return base64.b64encode(buffer.getvalue()).decode("utf-8")

            logger.warning(f"Unsupported image type for encoding: {type(image)}")
            return None

        except Exception as e:
            logger.error(f"Failed to save image to buffer: {e}")
            return None


def get_image_service(api_key: str) -> ImageService:
    """Factory function to create ImageService instance."""
    return ImageService(api_key=api_key)

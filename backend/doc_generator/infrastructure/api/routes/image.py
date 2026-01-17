"""Image generation and editing routes."""

from typing import Optional

from fastapi import APIRouter, Header, HTTPException
from loguru import logger

from ....domain.image_styles import (
    IMAGE_STYLES,
    get_all_categories,
    get_style_by_id,
)
from ...image.image_service import ImageService
from ..schemas.image import (
    CategoryInfo,
    EditMode,
    ImageEditRequest,
    ImageEditResponse,
    ImageGenerateRequest,
    ImageGenerateResponse,
    OutputFormat,
    StyleInfo,
    StylesResponse,
)

router = APIRouter(prefix="/image", tags=["image"])


def get_gemini_api_key(
    x_gemini_key: Optional[str] = Header(None, alias="X-Gemini-API-Key"),
    x_google_key: Optional[str] = Header(None, alias="X-Google-Key"),
) -> str:
    """Extract Gemini API key from headers.

    Accepts either X-Gemini-API-Key or X-Google-Key header.

    Args:
        x_gemini_key: Gemini-specific API key header
        x_google_key: Google API key header (fallback)

    Returns:
        The API key

    Raises:
        HTTPException: If no API key is provided
    """
    api_key = x_gemini_key or x_google_key
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing required header: X-Gemini-API-Key or X-Google-Key",
        )
    return api_key


@router.get(
    "/styles",
    response_model=StylesResponse,
    summary="Get available image styles",
    description="Returns all available image style categories and styles for the dropdown selectors.",
)
async def get_styles() -> StylesResponse:
    """Get all available styles and categories.

    Returns:
        StylesResponse with categories and styles
    """
    categories = [CategoryInfo(id=c["id"], name=c["name"]) for c in get_all_categories()]

    styles = [
        StyleInfo(
            id=s.id,
            name=s.name,
            category=s.category.value,
            looks_like=s.looks_like,
            use_cases=s.use_cases,
            supports_svg=s.supports_svg,
        )
        for s in IMAGE_STYLES
    ]

    return StylesResponse(categories=categories, styles=styles)


@router.post(
    "/generate",
    response_model=ImageGenerateResponse,
    summary="Generate an image",
    description=(
        "Generate a new image from a text description. "
        "Supports styled generation with 40+ styles or free-text mode. "
        "Can output raster (PNG) or SVG format for technical diagrams."
    ),
)
async def generate_image(
    request: ImageGenerateRequest,
    api_key: str = Header(..., alias="X-Gemini-API-Key"),
) -> ImageGenerateResponse:
    """Generate an image from text description.

    Args:
        request: Image generation request
        api_key: Gemini API key from header

    Returns:
        ImageGenerateResponse with generated image data
    """
    logger.info(
        f"Image generation request: style={request.style}, "
        f"format={request.output_format}, free_text={request.free_text_mode}"
    )

    # Get style if specified
    style = None
    if request.style and not request.free_text_mode:
        style = get_style_by_id(request.style)
        if not style:
            logger.warning(f"Style not found: {request.style}")

    # Validate SVG output for non-SVG-supporting styles
    if request.output_format == OutputFormat.SVG:
        if style and not style.supports_svg:
            return ImageGenerateResponse(
                success=False,
                image_data=None,
                format="svg",
                prompt_used=request.prompt,
                error=f"Style '{style.name}' does not support SVG output. Use raster format instead.",
            )

    # Create image service
    service = ImageService(api_key=api_key)

    if not service.is_available():
        return ImageGenerateResponse(
            success=False,
            image_data=None,
            format=request.output_format.value,
            prompt_used=request.prompt,
            error="Image service not available. Check API key and dependencies.",
        )

    # Generate image based on format
    try:
        if request.output_format == OutputFormat.SVG:
            image_data, prompt_used = service.generate_svg(
                prompt=request.prompt,
                style=style,
                free_text_mode=request.free_text_mode,
            )
            output_format = "svg"
        else:
            image_data, prompt_used = service.generate_raster_image(
                prompt=request.prompt,
                style=style,
                free_text_mode=request.free_text_mode,
            )
            output_format = "png"

        if image_data:
            logger.success(f"Image generated successfully: format={output_format}")
            return ImageGenerateResponse(
                success=True,
                image_data=image_data,
                format=output_format,
                prompt_used=prompt_used,
                error=None,
            )
        else:
            logger.warning("Image generation returned no data")
            return ImageGenerateResponse(
                success=False,
                image_data=None,
                format=output_format,
                prompt_used=prompt_used,
                error="Image generation failed. Try a different prompt or style.",
            )

    except Exception as e:
        logger.error(f"Image generation error: {e}")
        return ImageGenerateResponse(
            success=False,
            image_data=None,
            format=request.output_format.value,
            prompt_used=request.prompt,
            error=str(e),
        )


@router.post(
    "/edit",
    response_model=ImageEditResponse,
    summary="Edit an existing image",
    description=(
        "Edit an existing image using AI. Supports basic editing with prompts, "
        "style transfer, and region-based editing (inpainting)."
    ),
)
async def edit_image(
    request: ImageEditRequest,
    api_key: str = Header(..., alias="X-Gemini-API-Key"),
) -> ImageEditResponse:
    """Edit an existing image.

    Args:
        request: Image edit request with source image and instructions
        api_key: Gemini API key from header

    Returns:
        ImageEditResponse with edited image data
    """
    logger.info(f"Image edit request: mode={request.edit_mode}")

    # Get style for style transfer mode
    style = None
    if request.edit_mode == EditMode.STYLE_TRANSFER and request.style:
        style = get_style_by_id(request.style)
        if not style:
            logger.warning(f"Style not found for transfer: {request.style}")

    # Convert region if provided
    region = None
    if request.edit_mode == EditMode.REGION and request.region:
        region = {
            "x": request.region.x,
            "y": request.region.y,
            "width": request.region.width,
            "height": request.region.height,
        }

    # Create image service
    service = ImageService(api_key=api_key)

    if not service.is_available():
        return ImageEditResponse(
            success=False,
            image_data=None,
            format="png",
            error="Image service not available. Check API key and dependencies.",
        )

    try:
        edited_image = service.edit_image(
            image_base64=request.image,
            prompt=request.prompt,
            style=style,
            region=region,
        )

        if edited_image:
            logger.success("Image edited successfully")
            return ImageEditResponse(
                success=True,
                image_data=edited_image,
                format="png",
                error=None,
            )
        else:
            logger.warning("Image editing returned no data")
            return ImageEditResponse(
                success=False,
                image_data=None,
                format="png",
                error="Image editing failed. Try a different prompt.",
            )

    except Exception as e:
        logger.error(f"Image editing error: {e}")
        return ImageEditResponse(
            success=False,
            image_data=None,
            format="png",
            error=str(e),
        )

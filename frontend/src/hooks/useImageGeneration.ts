"use client";

import { useState, useCallback } from "react";
import { generateImage, editImage } from "@/lib/api/image";
import type {
  ImageOperationState,
  ImageGenerateRequest,
  ImageEditRequest,
  ImageResult,
  ImageEditResult,
  OutputFormat,
  EditMode,
  Region,
} from "@/lib/types/image";
import type { StyleCategory } from "@/data/imageStyles";

interface UseImageGenerationReturn {
  // State
  state: ImageOperationState;
  result: ImageResult | null;
  error: string | null;

  // Actions
  generate: (
    prompt: string,
    apiKey: string,
    options?: {
      styleCategory?: StyleCategory | null;
      style?: string | null;
      outputFormat?: OutputFormat;
      freeTextMode?: boolean;
    }
  ) => Promise<void>;
  reset: () => void;
}

interface UseImageEditingReturn {
  // State
  state: ImageOperationState;
  result: ImageEditResult | null;
  error: string | null;

  // Actions
  edit: (
    imageBase64: string,
    prompt: string,
    apiKey: string,
    options?: {
      editMode?: EditMode;
      styleCategory?: StyleCategory | null;
      style?: string | null;
      region?: Region | null;
    }
  ) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for image generation functionality.
 */
export function useImageGeneration(): UseImageGenerationReturn {
  const [state, setState] = useState<ImageOperationState>("idle");
  const [result, setResult] = useState<ImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (
      prompt: string,
      apiKey: string,
      options?: {
        styleCategory?: StyleCategory | null;
        style?: string | null;
        outputFormat?: OutputFormat;
        freeTextMode?: boolean;
      }
    ) => {
      setState("generating");
      setResult(null);
      setError(null);

      try {
        const request: ImageGenerateRequest = {
          prompt,
          style_category: options?.styleCategory ?? null,
          style: options?.style ?? null,
          output_format: options?.outputFormat ?? "raster",
          free_text_mode: options?.freeTextMode ?? false,
        };

        const response = await generateImage(request, apiKey);

        if (response.success && response.image_data) {
          setResult({
            imageData: response.image_data,
            format: response.format,
            promptUsed: response.prompt_used,
          });
          setState("success");
        } else {
          setError(response.error || "Image generation failed");
          setState("error");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        setState("error");
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    state,
    result,
    error,
    generate,
    reset,
  };
}

/**
 * Hook for image editing functionality.
 */
export function useImageEditing(): UseImageEditingReturn {
  const [state, setState] = useState<ImageOperationState>("idle");
  const [result, setResult] = useState<ImageEditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const edit = useCallback(
    async (
      imageBase64: string,
      prompt: string,
      apiKey: string,
      options?: {
        editMode?: EditMode;
        styleCategory?: StyleCategory | null;
        style?: string | null;
        region?: Region | null;
      }
    ) => {
      setState("editing");
      setResult(null);
      setError(null);

      try {
        const request: ImageEditRequest = {
          image: imageBase64,
          prompt,
          edit_mode: options?.editMode ?? "basic",
          style_category: options?.styleCategory ?? null,
          style: options?.style ?? null,
          region: options?.region ?? null,
        };

        const response = await editImage(request, apiKey);

        if (response.success && response.image_data) {
          setResult({
            imageData: response.image_data,
            format: response.format,
          });
          setState("success");
        } else {
          setError(response.error || "Image editing failed");
          setState("error");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        setState("error");
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    state,
    result,
    error,
    edit,
    reset,
  };
}

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  StyleSelector,
  StylePreviewCard,
  ImagePreview,
} from "@/components/image";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { getStyleById, type StyleCategory } from "@/data/imageStyles";
import type { OutputFormat } from "@/lib/types/image";

export function ImageGenerateForm() {
  // Form state
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<StyleCategory | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("raster");
  const [freeTextMode, setFreeTextMode] = useState(false);

  // Generation hook
  const { state, result, error, generate, reset } = useImageGeneration();

  // Get selected style info for SVG availability check
  const styleInfo = selectedStyle ? getStyleById(selectedStyle) : null;
  const canUseSvg = freeTextMode || (styleInfo?.supportsSvg ?? false);

  // Handle format change
  const handleFormatChange = useCallback(
    (format: OutputFormat) => {
      setOutputFormat(format);
      // If switching to SVG and current style doesn't support it, reset style
      if (format === "svg" && styleInfo && !styleInfo.supportsSvg) {
        setSelectedStyle(null);
      }
    },
    [styleInfo]
  );

  // Handle free text mode toggle
  const handleFreeTextModeChange = useCallback((checked: boolean) => {
    setFreeTextMode(checked);
    if (checked) {
      setSelectedCategory(null);
      setSelectedStyle(null);
    }
  }, []);

  // Handle generate
  const handleGenerate = useCallback(async () => {
    if (!apiKey.trim()) {
      alert("Please enter your Gemini API key");
      return;
    }
    if (!prompt.trim()) {
      alert("Please enter a description for the image");
      return;
    }

    await generate(prompt, apiKey, {
      styleCategory: freeTextMode ? null : selectedCategory,
      style: freeTextMode ? null : selectedStyle,
      outputFormat,
      freeTextMode,
    });
  }, [
    apiKey,
    prompt,
    selectedCategory,
    selectedStyle,
    outputFormat,
    freeTextMode,
    generate,
  ]);

  // Handle new generation
  const handleNewGeneration = useCallback(() => {
    reset();
  }, [reset]);

  const isGenerating = state === "generating";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Form */}
      <div className="space-y-6">
        {/* API Key */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  disabled={isGenerating}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Image Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Image Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Context</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={4}
                disabled={isGenerating}
              />
            </div>
          </CardContent>
        </Card>

        {/* Style Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Style Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Free text mode toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="free-text"
                checked={freeTextMode}
                onCheckedChange={handleFreeTextModeChange}
                disabled={isGenerating}
              />
              <Label htmlFor="free-text" className="text-sm font-normal">
                Free text mode (no style applied)
              </Label>
            </div>

            {/* Style selector */}
            {!freeTextMode && (
              <StyleSelector
                selectedCategory={selectedCategory}
                selectedStyle={selectedStyle}
                onCategoryChange={setSelectedCategory}
                onStyleChange={setSelectedStyle}
                disabled={isGenerating}
                showSvgOnly={outputFormat === "svg"}
              />
            )}

            {/* Style preview */}
            {selectedStyle && !freeTextMode && (
              <StylePreviewCard styleId={selectedStyle} />
            )}

            {/* Output format */}
            <div className="space-y-2">
              <Label>Output Format</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={outputFormat === "raster" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFormatChange("raster")}
                  disabled={isGenerating}
                >
                  Raster (PNG)
                </Button>
                <Button
                  type="button"
                  variant={outputFormat === "svg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFormatChange("svg")}
                  disabled={isGenerating || !canUseSvg}
                >
                  SVG
                </Button>
              </div>
              {!canUseSvg && !freeTextMode && (
                <p className="text-xs text-muted-foreground">
                  SVG is only available for technical diagram styles or free
                  text mode.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating || !apiKey.trim() || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <svg
                className="w-4 h-4 mr-2 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Generate Image
            </>
          )}
        </Button>

        {/* New generation button */}
        {(state === "success" || state === "error") && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleNewGeneration}
          >
            Generate Another Image
          </Button>
        )}
      </div>

      {/* Right: Preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ImagePreview
          imageData={result?.imageData ?? null}
          format={result?.format ?? "png"}
          isLoading={isGenerating}
          error={error}
        />
      </div>
    </div>
  );
}

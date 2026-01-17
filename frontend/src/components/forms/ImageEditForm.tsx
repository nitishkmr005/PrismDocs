"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  StyleSelector,
  StylePreviewCard,
  RegionSelector,
  BeforeAfterView,
} from "@/components/image";
import { useImageEditing } from "@/hooks/useImageGeneration";
import { fileToBase64 } from "@/lib/api/image";
import type { StyleCategory } from "@/data/imageStyles";
import type { EditMode, Region } from "@/lib/types/image";

export function ImageEditForm() {
  // Form state
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [editMode, setEditMode] = useState<EditMode>("basic");
  const [selectedCategory, setSelectedCategory] =
    useState<StyleCategory | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  // Editing hook
  const { state, result, error, edit, reset } = useImageEditing();

  // Handle file upload
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG, JPG, WebP)");
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be less than 10MB");
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        setUploadedImage(base64);
        setRegion(null);
        reset();
      } catch {
        alert("Failed to read image file");
      }
    },
    [reset]
  );

  // Handle edit mode change
  const handleEditModeChange = useCallback((value: string) => {
    setEditMode(value as EditMode);
    // Reset style when switching away from style_transfer
    if (value !== "style_transfer") {
      setSelectedCategory(null);
      setSelectedStyle(null);
    }
    // Reset region when switching away from region
    if (value !== "region") {
      setRegion(null);
    }
  }, []);

  // Handle edit
  const handleEdit = useCallback(async () => {
    if (!apiKey.trim()) {
      alert("Please enter your Gemini API key");
      return;
    }
    if (!uploadedImage) {
      alert("Please upload an image to edit");
      return;
    }
    if (!prompt.trim()) {
      alert("Please describe what you want to change");
      return;
    }
    if (editMode === "region" && !region) {
      alert("Please select a region to edit");
      return;
    }

    await edit(uploadedImage, prompt, apiKey, {
      editMode,
      styleCategory: editMode === "style_transfer" ? selectedCategory : null,
      style: editMode === "style_transfer" ? selectedStyle : null,
      region: editMode === "region" ? region : null,
    });
  }, [
    apiKey,
    uploadedImage,
    prompt,
    editMode,
    selectedCategory,
    selectedStyle,
    region,
    edit,
  ]);

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // Handle clear image
  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    setRegion(null);
    reset();
  }, [reset]);

  const isEditing = state === "editing";

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
                  disabled={isEditing}
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

        {/* Image Upload */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Source Image</CardTitle>
              {uploadedImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearImage}
                  disabled={isEditing}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!uploadedImage ? (
              <label
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  isEditing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-10 h-10 mb-3 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or WebP (max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  disabled={isEditing}
                />
              </label>
            ) : (
              <img
                src={`data:image/png;base64,${uploadedImage}`}
                alt="Uploaded"
                className="w-full h-auto rounded-lg"
              />
            )}
          </CardContent>
        </Card>

        {/* Edit Mode */}
        {uploadedImage && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Edit Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={editMode} onValueChange={handleEditModeChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" disabled={isEditing}>
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="style_transfer" disabled={isEditing}>
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="region" disabled={isEditing}>
                    Region
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Describe what you want to change in the image.
                  </p>
                </TabsContent>

                <TabsContent value="style_transfer" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Apply a visual style to transform your image.
                  </p>
                  <StyleSelector
                    selectedCategory={selectedCategory}
                    selectedStyle={selectedStyle}
                    onCategoryChange={setSelectedCategory}
                    onStyleChange={setSelectedStyle}
                    disabled={isEditing}
                  />
                  {selectedStyle && (
                    <StylePreviewCard styleId={selectedStyle} />
                  )}
                </TabsContent>

                <TabsContent value="region" className="space-y-4">
                  <RegionSelector
                    imageData={uploadedImage}
                    region={region}
                    onRegionChange={setRegion}
                    disabled={isEditing}
                  />
                </TabsContent>
              </Tabs>

              {/* Edit prompt */}
              <div className="space-y-2">
                <Label htmlFor="edit-prompt">Edit Instructions</Label>
                <Textarea
                  id="edit-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    editMode === "basic"
                      ? "e.g., Remove the background, change colors to blue theme..."
                      : editMode === "style_transfer"
                        ? "Describe any additional changes along with the style transfer..."
                        : "Describe what to change in the selected region..."
                  }
                  rows={3}
                  disabled={isEditing}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Button */}
        {uploadedImage && (
          <>
            <Button
              className="w-full"
              size="lg"
              onClick={handleEdit}
              disabled={
                isEditing ||
                !apiKey.trim() ||
                !prompt.trim() ||
                (editMode === "region" && !region)
              }
            >
              {isEditing ? (
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
                  Editing...
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
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  Apply Edit
                </>
              )}
            </Button>

            {/* Reset button */}
            {(state === "success" || state === "error") && (
              <Button variant="outline" className="w-full" onClick={handleReset}>
                Edit Again
              </Button>
            )}
          </>
        )}
      </div>

      {/* Right: Preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        {uploadedImage ? (
          <BeforeAfterView
            originalImage={uploadedImage}
            editedImage={result?.imageData ?? null}
            isLoading={isEditing}
            error={error}
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-0">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-muted-foreground"
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
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload an image to get started
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

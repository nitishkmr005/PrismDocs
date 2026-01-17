"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadImage } from "@/lib/api/image";

interface ImagePreviewProps {
  imageData: string | null;
  format: "png" | "svg";
  isLoading?: boolean;
  error?: string | null;
  onDownload?: () => void;
}

export function ImagePreview({
  imageData,
  format,
  isLoading = false,
  error = null,
}: ImagePreviewProps) {
  const [showCode, setShowCode] = useState(false);

  const handleDownload = () => {
    if (!imageData) return;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
    downloadImage(imageData, `generated-image-${timestamp}`, format);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-video bg-muted animate-pulse flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">
                Generating image...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="overflow-hidden border-destructive">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-sm text-destructive font-medium">
              Generation Failed
            </p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!imageData) {
    return (
      <Card className="overflow-hidden border-dashed">
        <CardContent className="p-0">
          <div className="aspect-video bg-muted/30 flex items-center justify-center">
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
                Generated image will appear here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state - show image
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Image Display */}
        <div className="relative bg-muted/30">
          {format === "svg" ? (
            // SVG: Render inline or show code
            showCode ? (
              <div className="p-4 max-h-96 overflow-auto">
                <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <code>{imageData}</code>
                </pre>
              </div>
            ) : (
              <div
                className="p-4 flex items-center justify-center min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: imageData }}
              />
            )
          ) : (
            // PNG: Show as image
            <img
              src={`data:image/png;base64,${imageData}`}
              alt="Generated image"
              className="w-full h-auto"
            />
          )}

          {/* Format badge */}
          <div className="absolute top-2 right-2">
            <span className="text-xs px-2 py-1 rounded bg-black/50 text-white uppercase">
              {format}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            {format === "svg" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                {showCode ? "Preview" : "View Code"}
              </Button>
            )}
          </div>
          <Button size="sm" onClick={handleDownload}>
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download {format.toUpperCase()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

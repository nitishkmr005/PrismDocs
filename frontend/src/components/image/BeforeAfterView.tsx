"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadImage } from "@/lib/api/image";

interface BeforeAfterViewProps {
  originalImage: string; // Base64 encoded
  editedImage: string | null; // Base64 encoded
  isLoading?: boolean;
  error?: string | null;
}

export function BeforeAfterView({
  originalImage,
  editedImage,
  isLoading = false,
  error = null,
}: BeforeAfterViewProps) {
  const handleDownload = () => {
    if (!editedImage) return;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
    downloadImage(editedImage, `edited-image-${timestamp}`, "png");
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-0.5 bg-border">
            {/* Original */}
            <div className="bg-background">
              <div className="p-2 text-center border-b">
                <span className="text-xs font-medium text-muted-foreground">
                  Original
                </span>
              </div>
              <img
                src={`data:image/png;base64,${originalImage}`}
                alt="Original"
                className="w-full h-auto"
              />
            </div>
            {/* Editing in progress */}
            <div className="bg-background">
              <div className="p-2 text-center border-b">
                <span className="text-xs font-medium text-muted-foreground">
                  Edited
                </span>
              </div>
              <div className="aspect-video bg-muted animate-pulse flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Editing...</p>
                </div>
              </div>
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
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-0.5 bg-border">
            {/* Original */}
            <div className="bg-background">
              <div className="p-2 text-center border-b">
                <span className="text-xs font-medium text-muted-foreground">
                  Original
                </span>
              </div>
              <img
                src={`data:image/png;base64,${originalImage}`}
                alt="Original"
                className="w-full h-auto"
              />
            </div>
            {/* Error */}
            <div className="bg-background">
              <div className="p-2 text-center border-b">
                <span className="text-xs font-medium text-destructive">
                  Failed
                </span>
              </div>
              <div className="aspect-video flex items-center justify-center p-4">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <svg
                      className="w-5 h-5 text-destructive"
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
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No edited image yet
  if (!editedImage) {
    return (
      <Card className="overflow-hidden border-dashed">
        <CardContent className="p-0">
          <div className="p-2 text-center border-b">
            <span className="text-xs font-medium text-muted-foreground">
              Original Image
            </span>
          </div>
          <img
            src={`data:image/png;base64,${originalImage}`}
            alt="Original"
            className="w-full h-auto"
          />
          <div className="p-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Edited image will appear side by side
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success - show before/after
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-0.5 bg-border">
          {/* Original */}
          <div className="bg-background">
            <div className="p-2 text-center border-b">
              <span className="text-xs font-medium text-muted-foreground">
                Original
              </span>
            </div>
            <img
              src={`data:image/png;base64,${originalImage}`}
              alt="Original"
              className="w-full h-auto"
            />
          </div>
          {/* Edited */}
          <div className="bg-background">
            <div className="p-2 text-center border-b">
              <span className="text-xs font-medium text-primary">Edited</span>
            </div>
            <img
              src={`data:image/png;base64,${editedImage}`}
              alt="Edited"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Download button */}
        <div className="p-4 border-t flex justify-end">
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
            Download Edited
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStyleById, getCategoryName } from "@/data/imageStyles";

interface StylePreviewCardProps {
  styleId: string | null;
}

export function StylePreviewCard({ styleId }: StylePreviewCardProps) {
  if (!styleId) {
    return null;
  }

  const style = getStyleById(styleId);

  if (!style) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{style.name}</CardTitle>
          <div className="flex gap-2">
            {style.supportsSvg && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                SVG
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {getCategoryName(style.category)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Looks Like */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Looks like
          </p>
          <p className="text-sm">{style.looksLike}</p>
        </div>

        {/* Use Cases */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Best for
          </p>
          <div className="flex flex-wrap gap-1.5">
            {style.useCases.map((useCase, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

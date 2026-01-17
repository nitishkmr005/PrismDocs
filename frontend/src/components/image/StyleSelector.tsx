"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CATEGORIES,
  getStylesByCategory,
  type StyleCategory,
} from "@/data/imageStyles";

interface StyleSelectorProps {
  selectedCategory: StyleCategory | null;
  selectedStyle: string | null;
  onCategoryChange: (category: StyleCategory | null) => void;
  onStyleChange: (styleId: string | null) => void;
  disabled?: boolean;
  showSvgOnly?: boolean;
}

export function StyleSelector({
  selectedCategory,
  selectedStyle,
  onCategoryChange,
  onStyleChange,
  disabled = false,
  showSvgOnly = false,
}: StyleSelectorProps) {
  // Get styles for selected category
  const availableStyles = useMemo(() => {
    if (!selectedCategory) return [];
    let styles = getStylesByCategory(selectedCategory);
    if (showSvgOnly) {
      styles = styles.filter((s) => s.supportsSvg);
    }
    return styles;
  }, [selectedCategory, showSvgOnly]);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    if (value === "none") {
      onCategoryChange(null);
      onStyleChange(null);
    } else {
      onCategoryChange(value as StyleCategory);
      onStyleChange(null); // Reset style when category changes
    }
  };

  // Handle style change
  const handleStyleChange = (value: string) => {
    if (value === "none") {
      onStyleChange(null);
    } else {
      onStyleChange(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="category-select">Style Category</Label>
        <Select
          value={selectedCategory || "none"}
          onValueChange={handleCategoryChange}
          disabled={disabled}
        >
          <SelectTrigger id="category-select" className="w-full">
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No style (free text)</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Style Dropdown - Only shown when category is selected */}
      {selectedCategory && (
        <div className="space-y-2">
          <Label htmlFor="style-select">Style</Label>
          <Select
            value={selectedStyle || "none"}
            onValueChange={handleStyleChange}
            disabled={disabled || availableStyles.length === 0}
          >
            <SelectTrigger id="style-select" className="w-full">
              <SelectValue placeholder="Select a style..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select a style...</SelectItem>
              {availableStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  <div className="flex items-center gap-2">
                    <span>{style.name}</span>
                    {style.supportsSvg && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        SVG
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showSvgOnly && availableStyles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              This category has no SVG-compatible styles. Try a different
              category or switch to raster format.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

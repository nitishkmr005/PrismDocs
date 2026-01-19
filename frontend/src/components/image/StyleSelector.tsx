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

// Category icons and colors for visual tiles
const CATEGORY_CONFIG: Record<StyleCategory, { icon: string; color: string; bgColor: string; borderColor: string }> = {
  handwritten_and_human: { icon: "✍️", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", borderColor: "border-amber-300 dark:border-amber-700" },
  diagram_and_architecture: { icon: "🏗️", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-300 dark:border-blue-700" },
  developer_and_technical: { icon: "💻", color: "text-violet-600", bgColor: "bg-violet-50 dark:bg-violet-950/30", borderColor: "border-violet-300 dark:border-violet-700" },
  teaching_and_presentation: { icon: "📊", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", borderColor: "border-emerald-300 dark:border-emerald-700" },
  research_and_academic: { icon: "🔬", color: "text-cyan-600", bgColor: "bg-cyan-50 dark:bg-cyan-950/30", borderColor: "border-cyan-300 dark:border-cyan-700" },
  creative_and_social: { icon: "🎨", color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-950/30", borderColor: "border-pink-300 dark:border-pink-700" },
  product_and_business: { icon: "💼", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30", borderColor: "border-orange-300 dark:border-orange-700" },
  comparison_and_table: { icon: "📋", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30", borderColor: "border-indigo-300 dark:border-indigo-700" },
};

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

  // Handle category click
  const handleCategoryClick = (categoryId: StyleCategory) => {
    if (selectedCategory === categoryId) {
      // Deselect if already selected
      onCategoryChange(null);
      onStyleChange(null);
    } else {
      onCategoryChange(categoryId);
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
      {/* Category Tiles */}
      <div className="space-y-2">
        <Label>Style Category</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((category) => {
            const config = CATEGORY_CONFIG[category.id];
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                disabled={disabled}
                className={`group relative flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected 
                    ? `${config.bgColor} ${config.borderColor} ring-2 ring-offset-1 ring-current` 
                    : 'bg-card border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-xl mb-1">{config.icon}</span>
                <span className={`text-[10px] sm:text-xs font-medium leading-tight ${isSelected ? config.color : 'text-muted-foreground'}`}>
                  {category.name.split(' & ')[0]}
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1">
                    <svg className={`w-4 h-4 ${config.color}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Click a category to see available styles, or leave unselected for free text mode
        </p>
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

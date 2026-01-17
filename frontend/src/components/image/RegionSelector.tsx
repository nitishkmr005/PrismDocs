"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Region } from "@/lib/types/image";

interface RegionSelectorProps {
  imageData: string; // Base64 encoded image
  region: Region | null;
  onRegionChange: (region: Region | null) => void;
  disabled?: boolean;
}

export function RegionSelector({
  imageData,
  region,
  onRegionChange,
  disabled = false,
}: RegionSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentRegion, setCurrentRegion] = useState<Region | null>(region);

  // Sync with prop
  useEffect(() => {
    setCurrentRegion(region);
  }, [region]);

  // Get normalized coordinates (0-1) from mouse event
  const getNormalizedCoords = useCallback(
    (e: React.MouseEvent): { x: number; y: number } | null => {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      return {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      };
    },
    []
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      const coords = getNormalizedCoords(e);
      if (!coords) return;

      setIsDrawing(true);
      setStartPoint(coords);
      setCurrentRegion(null);
      onRegionChange(null);
    },
    [disabled, getNormalizedCoords, onRegionChange]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !startPoint) return;

      const coords = getNormalizedCoords(e);
      if (!coords) return;

      const newRegion: Region = {
        x: Math.min(startPoint.x, coords.x),
        y: Math.min(startPoint.y, coords.y),
        width: Math.abs(coords.x - startPoint.x),
        height: Math.abs(coords.y - startPoint.y),
      };

      setCurrentRegion(newRegion);
    },
    [isDrawing, startPoint, getNormalizedCoords]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentRegion) return;

    setIsDrawing(false);
    setStartPoint(null);

    // Only accept regions with some minimum size
    if (currentRegion.width > 0.02 && currentRegion.height > 0.02) {
      onRegionChange(currentRegion);
    } else {
      setCurrentRegion(null);
      onRegionChange(null);
    }
  }, [isDrawing, currentRegion, onRegionChange]);

  // Handle clear
  const handleClear = useCallback(() => {
    setCurrentRegion(null);
    onRegionChange(null);
  }, [onRegionChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {currentRegion
            ? "Region selected. Edit prompt will apply to this area."
            : "Click and drag to select a region to edit"}
        </p>
        {currentRegion && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
          >
            Clear
          </Button>
        )}
      </div>

      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-lg border ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-crosshair"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Image */}
        <img
          src={`data:image/png;base64,${imageData}`}
          alt="Image to edit"
          className="w-full h-auto pointer-events-none select-none"
          draggable={false}
        />

        {/* Region overlay */}
        {currentRegion && (
          <>
            {/* Darkened areas outside selection */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top */}
              <div
                className="absolute left-0 right-0 top-0 bg-black/40"
                style={{ height: `${currentRegion.y * 100}%` }}
              />
              {/* Bottom */}
              <div
                className="absolute left-0 right-0 bottom-0 bg-black/40"
                style={{
                  height: `${(1 - currentRegion.y - currentRegion.height) * 100}%`,
                }}
              />
              {/* Left */}
              <div
                className="absolute left-0 bg-black/40"
                style={{
                  top: `${currentRegion.y * 100}%`,
                  height: `${currentRegion.height * 100}%`,
                  width: `${currentRegion.x * 100}%`,
                }}
              />
              {/* Right */}
              <div
                className="absolute right-0 bg-black/40"
                style={{
                  top: `${currentRegion.y * 100}%`,
                  height: `${currentRegion.height * 100}%`,
                  width: `${(1 - currentRegion.x - currentRegion.width) * 100}%`,
                }}
              />
            </div>

            {/* Selection border */}
            <div
              className="absolute border-2 border-primary pointer-events-none"
              style={{
                left: `${currentRegion.x * 100}%`,
                top: `${currentRegion.y * 100}%`,
                width: `${currentRegion.width * 100}%`,
                height: `${currentRegion.height * 100}%`,
              }}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

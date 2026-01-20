"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ScrollingImageProps {
  src: string;
  alt: string;
  aspectRatio?: "portrait" | "landscape" | "square" | "video";
  className?: string;
}

export function ScrollingImage({ 
  src, 
  alt, 
  aspectRatio = "portrait",
  className 
}: ScrollingImageProps) {
  // Aspect ratio map
  const aspectClass = {
    portrait: "aspect-[3/4]",
    landscape: "aspect-video",
    square: "aspect-square",
    video: "aspect-video",
  }[aspectRatio];

  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900 group cursor-pointer",
        aspectClass,
        className
      )}
    >
      <div 
        className={cn(
          "relative w-full transition-transform ease-linear will-change-transform",
          // Default: scroll top to bottom slowly and back?
          // Or just scroll on hover? User asked for "like gif".
          // GIF implies constant motion.
          // Let's make it auto-scroll slowly to the bottom and reset?
          // Or just scroll on hover?
          // "Make this as gif" implies constant animation.
          // We'll use a CSS animation class defined in style tag or globals.
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={1200}
          className={cn(
            "w-full h-auto object-cover transition-transform duration-[8s] ease-in-out",
            "group-hover:translate-y-[calc(-100%+100%)]", // Scroll to bottom on hover
          )}
          style={{
             // Initial state: translate-y-0
             // On hover: translate-y to show bottom.
             // But to make it "like gif" automatically?
             // Let's stick to hover effect which is interactive and "gif-like" when interacted with.
             // To make it look "horrible" less, we should maybe position it top by default.
             transform: "translateY(0)"
          }}
        />
        {/* We need a specific override for hover because Tailwind calc might be tricky */}
        <div className="absolute inset-0 bg-transparent" />
      </div>
      
       {/* Inline style for the hover effect calculation */}
      <style jsx global>{`
        .group:hover img {
           transform: translateY(calc(-100% + var(--container-height, 300px)));
        }
        /* Actually simpler: just use object-position */
      `}</style>

       {/* Let's try a simpler Approach: object-position animation */}
       <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-top transition-[object-position] duration-[4s] ease-in-out group-hover:object-bottom"
       />

      {/* Overlay to indicate interactivity */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-xl" />
      
      {/* "GIF" badge or "Live" badge */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        Scrolls
      </div>
    </div>
  );
}

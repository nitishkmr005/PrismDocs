// frontend/src/lib/mindmap/exportMindMap.ts

import { toPng, toSvg } from "html-to-image";
import { MindMapTree } from "@/lib/types/mindmap";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

function getFilename(title: string, ext: string): string {
  const slug = slugify(title);
  const timestamp = Date.now();
  return `mindmap-${slug}-${timestamp}.${ext}`;
}

// Filter function to exclude MiniMap, Controls, and other non-essential elements
function filterElements(node: HTMLElement): boolean {
  const excludeClasses = [
    "react-flow__minimap",
    "react-flow__controls",
    "react-flow__background",
    "react-flow__attribution",
  ];

  if (node.classList) {
    for (const className of excludeClasses) {
      if (node.classList.contains(className)) {
        return false;
      }
    }
  }
  return true;
}

export async function exportToPng(
  element: HTMLElement,
  title: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: "#0f172a",
    cacheBust: true,
    filter: filterElements,
    quality: 1,
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = getFilename(title, "png");
  link.href = dataUrl;
  link.click();
}

export async function exportToSvg(
  element: HTMLElement,
  title: string
): Promise<void> {
  const dataUrl = await toSvg(element, {
    backgroundColor: "#0f172a",
    cacheBust: true,
    filter: filterElements,
  });

  const link = document.createElement("a");
  link.download = getFilename(title, "svg");
  link.href = dataUrl;
  link.click();
}

export function exportToJson(tree: MindMapTree, title: string): void {
  const json = JSON.stringify(tree, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = getFilename(title, "json");
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

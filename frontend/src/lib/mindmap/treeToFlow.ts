// frontend/src/lib/mindmap/treeToFlow.ts

import { Node, Edge } from "@xyflow/react";
import { MindMapNode } from "@/lib/types/mindmap";

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

const HORIZONTAL_SPACING = 320;
const VERTICAL_SPACING = 100;

// Calculate the height of a subtree (number of leaf nodes)
function getSubtreeHeight(node: MindMapNode): number {
  if (!node.children || node.children.length === 0) {
    return 1;
  }
  return node.children.reduce((sum, child) => sum + getSubtreeHeight(child), 0);
}

// Get color based on depth level (app theme: extended color palette for up to 20 levels)
export function getNodeColor(depth: number): { bg: string; border: string } {
  const colors = [
    { bg: "rgb(6, 182, 212)", border: "rgb(8, 145, 178)" },      // cyan-500/600 (root)
    { bg: "rgb(20, 184, 166)", border: "rgb(13, 148, 136)" },    // teal-500/600
    { bg: "rgb(34, 197, 94)", border: "rgb(22, 163, 74)" },      // green-500/600
    { bg: "rgb(132, 204, 22)", border: "rgb(101, 163, 13)" },    // lime-500/600
    { bg: "rgb(139, 92, 246)", border: "rgb(124, 58, 237)" },    // violet-500/600
    { bg: "rgb(168, 85, 247)", border: "rgb(147, 51, 234)" },    // purple-500/600
    { bg: "rgb(236, 72, 153)", border: "rgb(219, 39, 119)" },    // pink-500/600
    { bg: "rgb(244, 63, 94)", border: "rgb(225, 29, 72)" },      // rose-500/600
    { bg: "rgb(249, 115, 22)", border: "rgb(234, 88, 12)" },     // orange-500/600
    { bg: "rgb(234, 179, 8)", border: "rgb(202, 138, 4)" },      // yellow-500/600
    { bg: "rgb(14, 165, 233)", border: "rgb(2, 132, 199)" },     // sky-500/600
    { bg: "rgb(99, 102, 241)", border: "rgb(79, 70, 229)" },     // indigo-500/600
    { bg: "rgb(16, 185, 129)", border: "rgb(5, 150, 105)" },     // emerald-500/600
    { bg: "rgb(245, 158, 11)", border: "rgb(217, 119, 6)" },     // amber-500/600
    { bg: "rgb(239, 68, 68)", border: "rgb(220, 38, 38)" },      // red-500/600
    { bg: "rgb(59, 130, 246)", border: "rgb(37, 99, 235)" },     // blue-500/600
    { bg: "rgb(217, 70, 239)", border: "rgb(192, 38, 211)" },    // fuchsia-500/600
    { bg: "rgb(34, 211, 238)", border: "rgb(6, 182, 212)" },     // cyan-400/500
    { bg: "rgb(74, 222, 128)", border: "rgb(34, 197, 94)" },     // green-400/500
  ];
  return colors[depth % colors.length];
}

export function treeToFlow(
  root: MindMapNode,
  expandedNodes: Set<string> = new Set()
): FlowData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function traverse(
    node: MindMapNode,
    x: number,
    y: number,
    depth: number,
    parentId: string | null
  ): number {
    const nodeId = node.id;
    const isExpanded = expandedNodes.size === 0 || expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;
    const colors = getNodeColor(depth);

    nodes.push({
      id: nodeId,
      type: "mindMapNode",
      position: { x, y },
      data: {
        label: node.label,
        depth,
        hasChildren,
        isExpanded,
        childCount: node.children?.length || 0,
        colors,
      },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        style: { stroke: "rgb(100, 116, 139)", strokeWidth: 2 },
        animated: false,
      });
    }

    // If collapsed or no children, return height of 1
    if (!isExpanded || !hasChildren) {
      return VERTICAL_SPACING;
    }

    // Process children
    const totalHeight = node.children!.reduce((acc, child) => {
      return acc + getSubtreeHeight(child) * VERTICAL_SPACING;
    }, 0);

    // Center children vertically around parent
    let childY = y - totalHeight / 2 + VERTICAL_SPACING / 2;

    for (const child of node.children!) {
      const childHeight = getSubtreeHeight(child) * VERTICAL_SPACING;
      const childCenterY = childY + childHeight / 2 - VERTICAL_SPACING / 2;

      traverse(child, x + HORIZONTAL_SPACING, childCenterY, depth + 1, nodeId);
      childY += childHeight;
    }

    return totalHeight;
  }

  traverse(root, 0, 0, 0, null);

  return { nodes, edges };
}

// Get all node IDs in a tree
export function getAllNodeIds(node: MindMapNode): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllNodeIds(child));
    }
  }
  return ids;
}

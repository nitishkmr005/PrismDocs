// frontend/src/components/mindmap/MindMapNode.tsx

"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

interface MindMapNodeData extends Record<string, unknown> {
  label: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  childCount: number;
  colors: { bg: string; border: string };
  onToggle?: (nodeId: string) => void;
}

type MindMapNodeType = Node<MindMapNodeData, "mindMapNode">;

function MindMapNodeComponent({ id, data }: NodeProps<MindMapNodeType>) {
  const { label, hasChildren, isExpanded, childCount, colors, onToggle } = data;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle && hasChildren) {
      onToggle(id);
    }
  };

  return (
    <div
      className="relative px-4 py-2 rounded-lg shadow-lg min-w-[140px] max-w-[280px] cursor-pointer transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 2,
        borderStyle: "solid",
      }}
      onClick={handleToggle}
      title={label}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-slate-400"
      />

      <span className="text-white text-sm font-medium leading-snug block pr-2">
        {label}
      </span>

      {hasChildren && (
        <button
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-white text-xs hover:bg-slate-600 transition-colors"
          onClick={handleToggle}
        >
          {isExpanded ? "−" : childCount}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-slate-400"
      />
    </div>
  );
}

export const MindMapNode = memo(MindMapNodeComponent);

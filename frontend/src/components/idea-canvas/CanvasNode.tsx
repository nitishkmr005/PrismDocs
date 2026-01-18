// frontend/src/components/idea-canvas/CanvasNode.tsx

"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { CanvasNodeType, QuestionOption } from "@/lib/types/idea-canvas";

interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  nodeType: CanvasNodeType;
  isActive?: boolean;
  options?: QuestionOption[];
  selectedOptionId?: string;
  isSelected?: boolean; // For option nodes - whether this was the selected option
}

type CanvasNodeFlowType = Node<CanvasNodeData, "canvasNode">;

const nodeColors: Record<CanvasNodeType, { bg: string; border: string; text: string; iconBg: string }> = {
  root: {
    bg: "bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600",
    border: "border-indigo-400/50",
    text: "text-white",
    iconBg: "bg-white/20",
  },
  question: {
    bg: "bg-white dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-700 dark:text-slate-200",
    iconBg: "bg-slate-100 dark:bg-slate-700",
  },
  answer: {
    bg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    border: "border-emerald-400/50",
    text: "text-white",
    iconBg: "bg-white/20",
  },
  approach: {
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    border: "border-amber-400/50",
    text: "text-white",
    iconBg: "bg-white/20",
  },
  option: {
    bg: "bg-slate-100 dark:bg-slate-700",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-600 dark:text-slate-300",
    iconBg: "bg-slate-200 dark:bg-slate-600",
  },
};

const nodeIcons: Record<CanvasNodeType, React.ReactNode> = {
  root: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  question: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  answer: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  approach: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  option: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const nodeTypeLabels: Record<CanvasNodeType, string> = {
  root: "Idea",
  question: "Question",
  answer: "Answer",
  approach: "Approach",
  option: "Option",
};

function CanvasNodeComponent({ data }: NodeProps<CanvasNodeFlowType>) {
  const { label, description, nodeType, isActive, isSelected } = data;
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = nodeColors[nodeType] || nodeColors.question;
  const icon = nodeIcons[nodeType];
  const typeLabel = nodeTypeLabels[nodeType];

  const hasFullContent = description && description !== label && description.length > label.length;

  // Handle click for expanding full content (description)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasFullContent) {
      setIsExpanded(!isExpanded);
    }
  }, [hasFullContent, isExpanded]);

  // Special styling for selected option nodes
  const isSelectedOption = nodeType === "option" && isSelected;
  const selectedStyles = isSelectedOption 
    ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background bg-gradient-to-br from-emerald-400 to-teal-500 text-white" 
    : "";

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900"
      />
      {/* Wrapper to allow badge to overflow */}
      <div className="relative pt-3" style={{ overflow: 'visible' }}>
        {/* Type badge - positioned at top of node */}
        <div 
          className={`absolute -top-1 left-3 z-20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap shadow-md border ${
            isSelectedOption 
              ? 'bg-emerald-500 text-white border-emerald-400' 
              : nodeType === 'root'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : nodeType === 'answer'
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : nodeType === 'question'
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-slate-500 text-white border-slate-400'
          }`}
        >
          {isSelectedOption ? "✓ Selected" : typeLabel}
        </div>
        
        <div
          onClick={handleClick}
          className={`
            relative group ${hasFullContent ? 'cursor-pointer' : ''}
            px-4 py-3 rounded-xl border-2 shadow-lg
            min-w-[160px] max-w-[300px]
            ${isSelectedOption ? selectedStyles : `${colors.bg} ${colors.border} ${colors.text}`}
            ${isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
            hover:shadow-xl hover:scale-[1.02]
            transition-all duration-200
          `}
        >
          <div className="flex items-start gap-2 mt-1">
            <div className={`shrink-0 mt-0.5 p-1.5 rounded-lg ${isSelectedOption ? 'bg-white/20' : colors.iconBg}`}>
              {isSelectedOption ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight break-words">
                {isExpanded && description ? description : label}
              </div>
            </div>
          </div>

          {/* Expand indicator - only for nodes with full content */}
          {hasFullContent && (
            <div className="absolute bottom-1 right-2 opacity-60 flex items-center gap-1">
              <svg 
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

          {/* Active pulse animation */}
          {isActive && (
            <div className="absolute inset-0 rounded-xl border-2 border-primary animate-ping opacity-25" />
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900"
      />
    </>
  );
}

export const CanvasNodeMemo = memo(CanvasNodeComponent);

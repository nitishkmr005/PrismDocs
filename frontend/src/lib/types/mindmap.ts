// frontend/src/lib/types/mindmap.ts

export type MindMapMode = "summarize" | "brainstorm" | "structure" | "goal_planning" | "pros_cons" | "presentation_structure";

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface MindMapTree {
  title: string;
  summary: string;
  source_count: number;
  mode: MindMapMode;
  nodes: MindMapNode;
}

export interface MindMapRequest {
  sources: import("./requests").SourceItem[];
  mode: MindMapMode;
  provider: import("./requests").Provider;
  model: string;
}

export interface MindMapProgressEvent {
  type: "progress";
  stage: "extracting" | "analyzing" | "generating" | "complete";
  percent: number;
  message?: string;
}

export interface MindMapCompleteEvent {
  type: "complete";
  tree: MindMapTree;
}

export interface MindMapErrorEvent {
  type: "error";
  message: string;
  code?: string;
}

export type MindMapEvent = MindMapProgressEvent | MindMapCompleteEvent | MindMapErrorEvent;

export function isMindMapCompleteEvent(event: MindMapEvent): event is MindMapCompleteEvent {
  return event.type === "complete" && "tree" in event;
}

export function isMindMapErrorEvent(event: MindMapEvent): event is MindMapErrorEvent {
  return event.type === "error";
}

export function isMindMapProgressEvent(event: MindMapEvent): event is MindMapProgressEvent {
  return event.type === "progress";
}

// frontend/src/hooks/useMindMapGeneration.ts

"use client";

import { useState, useCallback } from "react";
import { generateMindMap, GenerateMindMapOptions } from "@/lib/api/mindmap";
import {
  MindMapTree,
  MindMapRequest,
  MindMapEvent,
  isCompleteEvent,
  isErrorEvent,
} from "@/lib/types/mindmap";

export type MindMapGenerationState = "idle" | "generating" | "complete" | "error";

export interface UseMindMapGenerationResult {
  state: MindMapGenerationState;
  progress: number;
  status: string;
  tree: MindMapTree | null;
  error: string | null;
  generate: (
    request: MindMapRequest,
    apiKey: string,
    userId?: string
  ) => Promise<void>;
  reset: () => void;
}

export function useMindMapGeneration(): UseMindMapGenerationResult {
  const [state, setState] = useState<MindMapGenerationState>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [tree, setTree] = useState<MindMapTree | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setStatus("");
    setTree(null);
    setError(null);
  }, []);

  const handleEvent = useCallback((event: MindMapEvent) => {
    if ("progress" in event) {
      setProgress(event.progress);
    }

    if (isCompleteEvent(event)) {
      setState("complete");
      setTree(event.tree);
      setStatus("Mind map generated successfully");
    } else if (isErrorEvent(event)) {
      setState("error");
      setError(event.error);
      setStatus("Generation failed");
    } else {
      const statusMessages: Record<string, string> = {
        parsing: "Parsing source content...",
        generating: "Generating mind map structure...",
      };
      setStatus(event.message || statusMessages[event.status] || event.status);
    }
  }, []);

  const generate = useCallback(
    async (request: MindMapRequest, apiKey: string, userId?: string) => {
      reset();
      setState("generating");

      const options: GenerateMindMapOptions = {
        request,
        apiKey,
        userId,
        onEvent: handleEvent,
        onError: (err) => {
          setState("error");
          setError(err.message);
        },
      };

      try {
        await generateMindMap(options);
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    },
    [handleEvent, reset]
  );

  return {
    state,
    progress,
    status,
    tree,
    error,
    generate,
    reset,
  };
}

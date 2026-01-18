// frontend/src/hooks/useMindMapGeneration.ts

"use client";

import { useState, useCallback } from "react";
import { generateMindMap, GenerateMindMapOptions } from "@/lib/api/mindmap";
import {
  MindMapTree,
  MindMapRequest,
  MindMapEvent,
  isMindMapCompleteEvent,
  isMindMapErrorEvent,
  isMindMapProgressEvent,
} from "@/lib/types/mindmap";

export type MindMapGenerationState = "idle" | "generating" | "complete" | "error";

export interface MindMapProgressState {
  stage: string;
  percent: number;
  message?: string;
}

export interface UseMindMapGenerationResult {
  state: MindMapGenerationState;
  progress: MindMapProgressState;
  tree: MindMapTree | null;
  error: string | null;
  generate: (
    request: MindMapRequest,
    apiKey: string,
    userId?: string
  ) => Promise<void>;
  reset: () => void;
}

const initialProgress: MindMapProgressState = {
  stage: "extracting",
  percent: 0,
  message: undefined,
};

export function useMindMapGeneration(): UseMindMapGenerationResult {
  const [state, setState] = useState<MindMapGenerationState>("idle");
  const [progress, setProgress] = useState<MindMapProgressState>(initialProgress);
  const [tree, setTree] = useState<MindMapTree | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setProgress(initialProgress);
    setTree(null);
    setError(null);
  }, []);

  const handleEvent = useCallback((event: MindMapEvent) => {
    if (isMindMapCompleteEvent(event)) {
      setState("complete");
      setTree(event.tree);
      setProgress({ stage: "complete", percent: 100, message: "Mind map generated successfully" });
    } else if (isMindMapErrorEvent(event)) {
      setState("error");
      setError(event.message);
    } else if (isMindMapProgressEvent(event)) {
      setProgress({
        stage: event.stage,
        percent: event.percent,
        message: event.message,
      });
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
    tree,
    error,
    generate,
    reset,
  };
}

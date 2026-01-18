// frontend/src/hooks/useIdeaCanvas.ts

"use client";

import { useState, useCallback } from "react";
import { startCanvas, submitAnswer } from "@/lib/api/idea-canvas";
import {
  StartCanvasRequest,
  CanvasState,
  CanvasQuestion,
  CanvasEvent,
  isCanvasReadyEvent,
  isCanvasQuestionEvent,
  isCanvasProgressEvent,
  isCanvasCompleteEvent,
  isCanvasErrorEvent,
} from "@/lib/types/idea-canvas";
import { Provider } from "@/lib/types/requests";

export type CanvasGenerationState =
  | "idle"
  | "starting"
  | "ready"
  | "answering"
  | "suggest_complete"
  | "error";

export interface QuestionHistoryItem {
  question: CanvasQuestion;
  answer: string | string[];
}

export interface UseIdeaCanvasResult {
  state: CanvasGenerationState;
  sessionId: string | null;
  canvas: CanvasState | null;
  currentQuestion: CanvasQuestion | null;
  questionHistory: QuestionHistoryItem[];
  progressMessage: string | null;
  error: string | null;
  provider: Provider;
  apiKey: string;
  canGoBack: boolean;
  start: (
    request: StartCanvasRequest,
    apiKey: string,
    userId?: string
  ) => Promise<void>;
  answer: (answer: string | string[], userId?: string) => Promise<void>;
  goBack: () => void;
  reset: () => void;
}

export function useIdeaCanvas(): UseIdeaCanvasResult {
  const [state, setState] = useState<CanvasGenerationState>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<CanvasState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CanvasQuestion | null>(null);
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("gemini");
  const [apiKey, setApiKey] = useState<string>("");

  const reset = useCallback(() => {
    setState("idle");
    setSessionId(null);
    setCanvas(null);
    setCurrentQuestion(null);
    setQuestionHistory([]);
    setProgressMessage(null);
    setError(null);
    setProvider("gemini");
    setApiKey("");
  }, []);

  const handleEvent = useCallback((event: CanvasEvent) => {
    if (isCanvasReadyEvent(event)) {
      setSessionId(event.session_id);
      setCanvas(event.canvas);
      setState("ready");
    } else if (isCanvasQuestionEvent(event)) {
      setCurrentQuestion(event.question);
      setCanvas(event.canvas);
      setState("ready");
      setProgressMessage(null);
    } else if (isCanvasProgressEvent(event)) {
      setProgressMessage(event.message);
    } else if (isCanvasCompleteEvent(event)) {
      setCanvas(event.canvas);
      setState("suggest_complete");
      setProgressMessage(event.message);
      setCurrentQuestion(null);
    } else if (isCanvasErrorEvent(event)) {
      setState("error");
      setError(event.message);
    }
  }, []);

  const start = useCallback(
    async (request: StartCanvasRequest, key: string, userId?: string) => {
      reset();
      setState("starting");
      setProvider(request.provider);
      setApiKey(key);
      setProgressMessage("Starting canvas session...");

      try {
        await startCanvas({
          request,
          apiKey: key,
          userId,
          onEvent: handleEvent,
          onError: (err) => {
            setState("error");
            setError(err.message);
          },
        });
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    },
    [handleEvent, reset]
  );

  const answer = useCallback(
    async (answerValue: string | string[], userId?: string) => {
      if (!sessionId || !currentQuestion) {
        setError("No active session or question");
        return;
      }

      // Save current question to history before moving to next
      setQuestionHistory(prev => [...prev, {
        question: currentQuestion,
        answer: answerValue,
      }]);

      setState("answering");
      setProgressMessage("Processing your answer...");

      try {
        await submitAnswer({
          request: {
            session_id: sessionId,
            question_id: currentQuestion.id,
            answer: answerValue,
          },
          apiKey,
          provider,
          userId,
          onEvent: handleEvent,
          onError: (err) => {
            setState("error");
            setError(err.message);
          },
        });
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    },
    [sessionId, currentQuestion, apiKey, provider, handleEvent]
  );

  // Go back to a previous question (allows re-answering)
  const goBack = useCallback(() => {
    if (questionHistory.length === 0) return;

    // Get the last answered question
    const newHistory = [...questionHistory];
    const lastItem = newHistory.pop();
    
    if (lastItem) {
      setQuestionHistory(newHistory);
      setCurrentQuestion(lastItem.question);
      setState("ready");
      setProgressMessage(null);
    }
  }, [questionHistory]);

  const canGoBack = questionHistory.length > 0 && state === "ready";

  return {
    state,
    sessionId,
    canvas,
    currentQuestion,
    questionHistory,
    progressMessage,
    error,
    provider,
    apiKey,
    canGoBack,
    start,
    answer,
    goBack,
    reset,
  };
}

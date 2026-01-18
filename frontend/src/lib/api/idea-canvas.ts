// frontend/src/lib/api/idea-canvas.ts

import { getApiUrl } from "@/config/api";
import {
  StartCanvasRequest,
  AnswerRequest,
  CanvasEvent,
} from "@/lib/types/idea-canvas";
import { Provider } from "@/lib/types/requests";

function getApiKeyHeader(provider: Provider): string {
  switch (provider) {
    case "gemini":
    case "google":
      return "X-Google-Key";
    case "openai":
      return "X-OpenAI-Key";
    case "anthropic":
      return "X-Anthropic-Key";
    default:
      return "X-Google-Key";
  }
}

export interface StartCanvasOptions {
  request: StartCanvasRequest;
  apiKey: string;
  userId?: string;
  onEvent: (event: CanvasEvent) => void;
  onError: (error: Error) => void;
}

export async function startCanvas(options: StartCanvasOptions): Promise<void> {
  const { request, apiKey, userId, onEvent, onError } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [getApiKeyHeader(request.provider)]: apiKey,
  };

  if (userId) {
    headers["X-User-Id"] = userId;
  }

  const url = getApiUrl("/api/canvas/start");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start canvas: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data && data !== "[DONE]") {
            try {
              const event = JSON.parse(data) as CanvasEvent;
              onEvent(event);
            } catch {
              // Ignore parse errors for partial data
            }
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export interface SubmitAnswerOptions {
  request: AnswerRequest;
  apiKey: string;
  provider: Provider;
  userId?: string;
  onEvent: (event: CanvasEvent) => void;
  onError: (error: Error) => void;
}

export async function submitAnswer(options: SubmitAnswerOptions): Promise<void> {
  const { request, apiKey, provider, userId, onEvent, onError } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [getApiKeyHeader(provider)]: apiKey,
  };

  if (userId) {
    headers["X-User-Id"] = userId;
  }

  const url = getApiUrl("/api/canvas/answer");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit answer: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data && data !== "[DONE]") {
            try {
              const event = JSON.parse(data) as CanvasEvent;
              onEvent(event);
            } catch {
              // Ignore parse errors for partial data
            }
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export interface GenerateReportOptions {
  sessionId: string;
  outputFormat?: "pdf" | "markdown" | "both";
  provider: Provider;
  apiKey: string;
}

export interface GenerateReportResult {
  session_id: string;
  title: string;
  pdf_url?: string;
  pdf_base64?: string;
  markdown_url?: string;
  markdown_content?: string;
}

export async function generateCanvasReport(options: GenerateReportOptions): Promise<GenerateReportResult> {
  const { sessionId, outputFormat = "both", provider, apiKey } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [getApiKeyHeader(provider)]: apiKey,
  };

  const url = getApiUrl("/api/canvas/report");

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      session_id: sessionId,
      output_format: outputFormat,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate report: ${errorText}`);
  }

  return response.json();
}


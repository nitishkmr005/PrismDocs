// frontend/src/components/mindmap/MindMapProgress.tsx

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MindMapProgressProps {
  stage: string;
  progress: number;
  message?: string;
}

export function MindMapProgress({ stage, progress, message }: MindMapProgressProps) {
  const stageLabels: Record<string, string> = {
    extracting: "Extracting Content",
    analyzing: "Analyzing Structure",
    generating: "Generating Mind Map",
    complete: "Complete",
  };

  const stageDescriptions: Record<string, string> = {
    extracting: "Reading and processing your sources...",
    analyzing: "Understanding the content structure...",
    generating: "Creating the mind map visualization...",
    complete: "Your mind map is ready!",
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">
          {stageLabels[stage] || stage}
        </CardTitle>
        <CardDescription>
          {message || stageDescriptions[stage] || "Processing..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>

        {/* Stage indicators */}
        <div className="flex justify-between mt-4">
          {["extracting", "analyzing", "generating"].map((s, i) => {
            const isActive = stage === s;
            const isComplete =
              (stage === "analyzing" && i === 0) ||
              (stage === "generating" && i <= 1) ||
              (stage === "complete");

            return (
              <div key={s} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isComplete
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {s === "extracting" ? "Extract" : s === "analyzing" ? "Analyze" : "Generate"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

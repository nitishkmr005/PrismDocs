// frontend/src/components/idea-canvas/IdeaCanvasForm.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Provider } from "@/lib/types/requests";
import {
  CanvasTemplate,
  StartCanvasRequest,
  CANVAS_TEMPLATES,
} from "@/lib/types/idea-canvas";

interface IdeaCanvasFormProps {
  onSubmit: (
    request: StartCanvasRequest,
    contentApiKey: string,
    imageApiKey: string | null,
    includeReportImage: boolean
  ) => void;
  isStarting?: boolean;
}

const contentModelOptions: Record<Provider, { value: string; label: string }[]> = {
  gemini: [
    { value: "gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite" },
    { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
    { value: "gemini-2.5-pro", label: "gemini-2.5-pro" },
  ],
  openai: [
    { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
    { value: "gpt-4.1", label: "gpt-4.1" },
  ],
  anthropic: [
    { value: "claude-haiku-4-5-20251001", label: "claude-haiku-4-5" },
    { value: "claude-sonnet-4-5-20250929", label: "claude-sonnet-4-5" },
  ],
  google: [
    { value: "gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite" },
    { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
  ],
};

const templateIcons: Record<string, React.ReactNode> = {
  rocket: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0l-3-3m3 3l-3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  code: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  bot: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  layers: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  sparkles: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

export function IdeaCanvasForm({ onSubmit, isStarting = false }: IdeaCanvasFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate | null>(null);
  const [idea, setIdea] = useState("");
  const [provider, setProvider] = useState<Provider>("gemini");
  const [model, setModel] = useState("gemini-2.5-flash-lite");
  const [apiKey, setApiKey] = useState("");
  const [includeReportImage, setIncludeReportImage] = useState(true);
  const [imageApiKey, setImageApiKey] = useState("");

  // Update model when provider changes
  useEffect(() => {
    const options = contentModelOptions[provider] || [];
    if (options.length > 0 && !options.some(opt => opt.value === model)) {
      setModel(options[0].value);
    }
  }, [provider, model]);

  const handleTemplateClick = useCallback((template: CanvasTemplate) => {
    setSelectedTemplate(template);
    // Pre-fill idea with template-specific placeholder
    const templateInfo = CANVAS_TEMPLATES.find(t => t.id === template);
    if (templateInfo && !idea) {
      setIdea("");
    }
  }, [idea]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!apiKey.trim() || !idea.trim()) return;
      if (includeReportImage && !imageApiKey.trim()) return;

      const request: StartCanvasRequest = {
        template: selectedTemplate || "custom",
        idea: idea.trim(),
        provider,
        model,
      };

      onSubmit(
        request,
        apiKey,
        includeReportImage ? imageApiKey.trim() : null,
        includeReportImage
      );
    },
    [selectedTemplate, idea, provider, model, apiKey, includeReportImage, imageApiKey, onSubmit]
  );

  const getPlaceholderText = () => {
    if (!selectedTemplate) return "Describe your idea, project, or what you want to build...";
    switch (selectedTemplate) {
      case "startup":
        return "Describe your startup idea... e.g., 'A platform that helps remote teams collaborate better'";
      case "web_app":
        return "Describe the web app you want to build... e.g., 'A task management app with team collaboration'";
      case "ai_agent":
        return "Describe the AI agent you want to create... e.g., 'A research assistant that summarizes papers'";
      case "project_spec":
        return "Describe your project... e.g., 'Build a customer feedback system for our product'";
      case "tech_stack":
        return "Describe what you're building and your constraints... e.g., 'E-commerce site, need to handle 10k users'";
      case "feature":
        return "Describe the feature you want to plan... e.g., 'Add real-time notifications to our app'";
      default:
        return "Describe your idea...";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose a Starting Point</CardTitle>
          <CardDescription>
            Select a template or start with your own idea
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CANVAS_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateClick(template.id)}
                className={`relative flex flex-col items-start p-4 rounded-lg border text-left transition-all ${
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <div className={`p-2 rounded-md bg-gradient-to-br ${template.color} text-white mb-2`}>
                  {templateIcons[template.icon]}
                </div>
                <div className="font-medium text-sm">{template.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Idea Input */}
      <Card>
        <CardHeader>
          <CardTitle>Your Idea</CardTitle>
          <CardDescription>
            Describe what you want to explore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={getPlaceholderText()}
            rows={4}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>Configure the AI model</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(contentModelOptions[provider] || []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Content API Key</CardTitle>
          <CardDescription>
            Enter your API key for the selected provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="canvas-api-key">API Key *</Label>
            {provider === "gemini" && (
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get Gemini API Key
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {provider === "openai" && (
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get OpenAI API Key
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {provider === "anthropic" && (
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get Claude API Key
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          <Input
            id="canvas-api-key"
            type="password"
            placeholder={`Enter your ${provider === "gemini" ? "Gemini" : provider === "openai" ? "OpenAI" : "Claude"} API key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
          />
        </CardContent>
      </Card>

      {/* Report Image */}
      <Card>
        <CardHeader>
          <CardTitle>Report Image</CardTitle>
          <CardDescription>
            Add a Gemini-generated visual summary to the report (model: gemini-3-pro-image-preview)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-report-image"
              checked={includeReportImage}
              onCheckedChange={(checked) => setIncludeReportImage(checked === true)}
              disabled={isStarting}
            />
            <Label htmlFor="include-report-image" className="text-sm font-normal">
              Include visual summary in report
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="canvas-image-api-key">
                Gemini Image API Key{includeReportImage ? " *" : ""}
              </Label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get Gemini API Key
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <Input
              id="canvas-image-api-key"
              type="password"
              placeholder="Enter your Gemini image API key"
              value={imageApiKey}
              onChange={(e) => setImageApiKey(e.target.value)}
              autoComplete="off"
              disabled={!includeReportImage || isStarting}
            />
            <p className="text-xs text-muted-foreground">
              Image generation uses Gemini only, even if content uses another provider.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={
          isStarting ||
          !idea.trim() ||
          !apiKey.trim() ||
          (includeReportImage && !imageApiKey.trim())
        }
      >
        {isStarting ? "Starting Canvas..." : "Start Exploring"}
      </Button>
    </form>
  );
}

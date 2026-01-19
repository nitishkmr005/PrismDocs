// frontend/src/components/idea-canvas/IdeaCanvasForm.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  code: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  bot: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  layers: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  ),
  sparkles: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  // Developer template icons
  wrench: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
    </svg>
  ),
  lightbulb: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  zap: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  "trending-up": (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  "folder-tree": (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
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
      // Developer-focused templates
      case "implement_feature":
        return "Describe the feature you want to implement... e.g., 'Add user authentication with OAuth and email login'";
      case "solve_problem":
        return "Describe the problem you're trying to solve... e.g., 'Need to handle file uploads for large files efficiently'";
      case "performance":
        return "Describe the performance issue... e.g., 'API response times are slow, p95 is 2s'";
      case "scaling":
        return "Describe what you need to scale... e.g., 'Database hitting limits at 10k concurrent users'";
      case "security_review":
        return "Describe what you want to secure... e.g., 'Review authentication system for vulnerabilities'";
      case "code_architecture":
        return "Describe your codebase situation... e.g., 'Monolith becoming hard to maintain, considering refactor'";
      default:
        return "Describe your idea...";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Template Selection - Compact Grid */}
      <section>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">Choose a Starting Point</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Select a template or start with your own idea</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CANVAS_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateClick(template.id)}
              className={`group relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                selectedTemplate === template.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border/60 hover:border-border hover:bg-muted/30 hover:shadow-sm"
              }`}
            >
              <div className={`shrink-0 p-2 rounded-lg bg-gradient-to-br ${template.color} text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}>
                {templateIcons[template.icon]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm leading-tight">{template.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {template.description}
                </div>
              </div>
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Idea Input */}
      <section>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-foreground">Your Idea</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Describe what you want to explore</p>
        </div>
        <Textarea
          placeholder={getPlaceholderText()}
          rows={3}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="resize-none text-base bg-background/50 border-border/60 focus:border-primary/50 focus:ring-primary/20"
        />
      </section>

      {/* AI Settings + API Key - Combined Section */}
      <section className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          AI Configuration
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger className="bg-background border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-background border-border/60">
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
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="canvas-api-key" className="text-xs font-medium text-muted-foreground">API Key</Label>
            {provider === "gemini" && (
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Get API Key <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}
            {provider === "openai" && (
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Get API Key <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}
            {provider === "anthropic" && (
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Get API Key <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
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
            className="bg-background border-border/60"
          />
        </div>
      </section>

      {/* Report Image - Compact Toggle */}
      <section className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-sm font-medium text-muted-foreground">Visual Summary</span>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-report-image"
              checked={includeReportImage}
              onCheckedChange={(checked) => setIncludeReportImage(checked === true)}
              disabled={isStarting}
            />
            <Label htmlFor="include-report-image" className="text-sm font-normal cursor-pointer">
              Include in report
            </Label>
          </div>
        </div>

        {includeReportImage && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="canvas-image-api-key" className="text-xs font-medium text-muted-foreground">
                Gemini Image API Key
              </Label>
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Get API Key <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
            <Input
              id="canvas-image-api-key"
              type="password"
              placeholder="Enter your Gemini image API key"
              value={imageApiKey}
              onChange={(e) => setImageApiKey(e.target.value)}
              autoComplete="off"
              disabled={isStarting}
              className="bg-background border-border/60"
            />
            <p className="text-xs text-muted-foreground/70">
              Uses Gemini for image generation regardless of content provider
            </p>
          </div>
        )}
      </section>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
        disabled={
          isStarting ||
          !idea.trim() ||
          !apiKey.trim() ||
          (includeReportImage && !imageApiKey.trim())
        }
      >
        {isStarting ? (
          <>
            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Starting Canvas...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Start Exploring
          </>
        )}
      </Button>
    </form>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

function RefractionIllustration() {
  return (
    <svg
      viewBox="0 0 400 200"
      className="w-full max-w-md mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="prism-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0891b2', stopOpacity: 0.9 }} />
          <stop offset="50%" style={{ stopColor: '#7c3aed', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#c026d3', stopOpacity: 0.9 }} />
        </linearGradient>
        <linearGradient id="input-beam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#94a3b8', stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: '#64748b' }} />
        </linearGradient>
        <linearGradient id="ray-teal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#06d6a0' }} />
          <stop offset="100%" style={{ stopColor: '#06d6a0', stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="ray-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#0891b2' }} />
          <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="ray-violet" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#7c3aed' }} />
          <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="ray-fuchsia" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#c026d3' }} />
          <stop offset="100%" style={{ stopColor: '#c026d3', stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="ray-rose" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#e11d48' }} />
          <stop offset="100%" style={{ stopColor: '#e11d48', stopOpacity: 0 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Input document icon */}
      <g transform="translate(30, 70)" className="animate-pulse" style={{ animationDuration: '3s' }}>
        <rect x="0" y="0" width="40" height="50" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <rect x="8" y="10" width="24" height="3" rx="1" fill="#64748b" />
        <rect x="8" y="18" width="20" height="3" rx="1" fill="#64748b" />
        <rect x="8" y="26" width="22" height="3" rx="1" fill="#64748b" />
        <rect x="8" y="34" width="16" height="3" rx="1" fill="#64748b" />
      </g>

      {/* Input beam */}
      <line x1="80" y1="95" x2="160" y2="95" stroke="url(#input-beam)" strokeWidth="4" strokeLinecap="round" />

      {/* Prism */}
      <g transform="translate(160, 55)" filter="url(#glow)">
        <polygon points="40,0 80,80 0,80" fill="url(#prism-fill)" />
        <polygon points="40,0 80,80 0,80" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      </g>

      {/* Output rays */}
      <g transform="translate(240, 95)" filter="url(#glow)">
        <line x1="0" y1="0" x2="120" y2="-55" stroke="url(#ray-teal)" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="130" y2="-25" stroke="url(#ray-cyan)" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="135" y2="5" stroke="url(#ray-violet)" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="130" y2="35" stroke="url(#ray-fuchsia)" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="115" y2="60" stroke="url(#ray-rose)" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Output labels */}
      <g className="text-xs" style={{ fontFamily: 'system-ui' }}>
        <text x="365" y="45" fill="#06d6a0" fontSize="11" fontWeight="500">PDF</text>
        <text x="375" y="75" fill="#0891b2" fontSize="11" fontWeight="500">PPTX</text>
        <text x="380" y="105" fill="#7c3aed" fontSize="11" fontWeight="500">Markdown</text>
        <text x="375" y="135" fill="#c026d3" fontSize="11" fontWeight="500">Mind Map</text>
        <text x="360" y="160" fill="#e11d48" fontSize="11" fontWeight="500">Podcast</text>
      </g>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-cyan-50 to-fuchsia-50 dark:from-cyan-950/50 dark:to-fuchsia-950/50 border-violet-200 dark:border-violet-800">
            <span className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              AI-Powered Document Generation
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
            One Source.{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Infinite Formats.
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl md:text-xl leading-relaxed">
            Transform PDFs, URLs, and documents into professional reports,
            presentations, mind maps, and more. Bring your own LLM API key
            and watch your content refract into any format.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
              <Link href="/generate">Start Generating</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <a href="https://github.com/nitishkmr005/document-generator" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Refraction Illustration */}
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <RefractionIllustration />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 border-t">
        <h2 className="text-2xl font-bold text-center mb-4">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Like light through a prism, your content refracts into multiple professional formats
        </p>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {/* Input Card */}
          <div className="group relative flex flex-col items-center text-center space-y-4 p-6 rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/50 dark:to-cyan-950/50 flex items-center justify-center">
              <svg className="h-7 w-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Any Source</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Upload PDFs, Word docs, images, or paste URLs and plain text. We parse and understand it all.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="px-2 py-1 text-xs rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">PDF</span>
              <span className="px-2 py-1 text-xs rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">URL</span>
              <span className="px-2 py-1 text-xs rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">DOCX</span>
              <span className="px-2 py-1 text-xs rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">Images</span>
            </div>
            {/* Connector arrow (hidden on mobile) */}
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Transform Card */}
          <div className="group relative flex flex-col items-center text-center space-y-4 p-6 rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/50 dark:to-violet-950/50 flex items-center justify-center">
              <svg className="h-7 w-7 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12,2 22,20 2,20" strokeWidth={2} strokeLinejoin="round" />
                <circle cx="12" cy="14" r="2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">AI Prism</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your content passes through our AI-powered prism, transforming and restructuring intelligently.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="px-2 py-1 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">Claude</span>
              <span className="px-2 py-1 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">Gemini</span>
              <span className="px-2 py-1 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">OpenAI</span>
            </div>
            {/* Connector arrow (hidden on mobile) */}
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Output Card */}
          <div className="group flex flex-col items-center text-center space-y-4 p-6 rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/10 hover:-translate-y-1">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 dark:from-fuchsia-900/50 dark:to-fuchsia-950/50 flex items-center justify-center">
              <svg className="h-7 w-7 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Many Formats</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Download your content refracted into multiple professional formats, ready to share.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="px-2 py-1 text-xs rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300">PDF</span>
              <span className="px-2 py-1 text-xs rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300">PPTX</span>
              <span className="px-2 py-1 text-xs rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300">Mind Map</span>
              <span className="px-2 py-1 text-xs rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300">Podcast</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6 p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 border border-violet-100 dark:border-violet-900/50">
          <h2 className="text-2xl font-bold">Ready to transform your content?</h2>
          <p className="text-muted-foreground">
            Bring your own API key and start generating professional documents in seconds.
          </p>
          <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
            <Link href="/generate">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

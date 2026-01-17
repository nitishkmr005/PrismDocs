/**
 * Image style definitions for the image generation feature.
 * Mirrors the backend image_styles.py definitions.
 */

export type StyleCategory =
  | "handwritten_and_human"
  | "diagram_and_architecture"
  | "developer_and_technical"
  | "teaching_and_presentation"
  | "research_and_academic"
  | "creative_and_social"
  | "product_and_business"
  | "comparison_and_table";

export interface ImageStyle {
  id: string;
  name: string;
  category: StyleCategory;
  looksLike: string;
  useCases: string[];
  supportsSvg: boolean;
}

export interface CategoryInfo {
  id: StyleCategory;
  name: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "handwritten_and_human", name: "Handwritten & Human" },
  { id: "diagram_and_architecture", name: "Diagram & Architecture" },
  { id: "developer_and_technical", name: "Developer & Technical" },
  { id: "teaching_and_presentation", name: "Teaching & Presentation" },
  { id: "research_and_academic", name: "Research & Academic" },
  { id: "creative_and_social", name: "Creative & Social" },
  { id: "product_and_business", name: "Product & Business" },
  { id: "comparison_and_table", name: "Comparison & Table" },
];

export const IMAGE_STYLES: ImageStyle[] = [
  // Handwritten & Human Styles
  {
    id: "whiteboard_handwritten",
    name: "Whiteboard Handwritten",
    category: "handwritten_and_human",
    looksLike:
      "Marker-written text on a whiteboard with boxes, arrows, underlines, and rough human handwriting",
    useCases: [
      "Teaching",
      "Explainer videos",
      "YouTube thumbnails",
      "Concept explanation",
      "Classroom-style visuals",
    ],
    supportsSvg: false,
  },
  {
    id: "notebook_handwritten",
    name: "Notebook Handwritten",
    category: "handwritten_and_human",
    looksLike:
      "Handwritten notes on ruled notebook pages with pen or pencil, highlights, and margins",
    useCases: [
      "Study notes",
      "Revision material",
      "Personal learning",
      "Documentation screenshots",
    ],
    supportsSvg: false,
  },
  {
    id: "sticky_notes_board",
    name: "Sticky Notes Board",
    category: "handwritten_and_human",
    looksLike:
      "Multiple colored sticky notes arranged on a wall or board with short phrases",
    useCases: [
      "Brainstorming",
      "Feature planning",
      "Ideation sessions",
      "High-level system planning",
    ],
    supportsSvg: false,
  },
  {
    id: "rough_scratchpad",
    name: "Rough Scratchpad",
    category: "handwritten_and_human",
    looksLike:
      "Messy, unstructured notes with crossed lines, arrows, and quick sketches",
    useCases: ["Thinking process", "Early ideation", "Problem exploration"],
    supportsSvg: false,
  },
  {
    id: "exam_revision_notes",
    name: "Exam Revision Notes",
    category: "handwritten_and_human",
    looksLike:
      "Neatly written but dense notes with underlines, highlights, and boxed formulas",
    useCases: ["Last-minute revision", "Cheat sheets", "Learning summaries"],
    supportsSvg: false,
  },
  {
    id: "book_margin_notes",
    name: "Book Margin Notes",
    category: "handwritten_and_human",
    looksLike:
      "Printed book or document pages with handwritten annotations and highlights",
    useCases: [
      "Explaining research papers",
      "Reading notes",
      "Concept commentary",
    ],
    supportsSvg: false,
  },

  // Diagram & Architecture Styles
  {
    id: "system_architecture_diagram",
    name: "System Architecture Diagram",
    category: "diagram_and_architecture",
    looksLike:
      "Clean boxes and arrows showing components and their interactions",
    useCases: [
      "SaaS architecture",
      "ML systems",
      "LLM pipelines",
      "Backend design",
    ],
    supportsSvg: true,
  },
  {
    id: "flowchart",
    name: "Flowchart",
    category: "diagram_and_architecture",
    looksLike:
      "Step-by-step boxes and decision diamonds connected by arrows",
    useCases: ["Logic explanation", "Process workflows", "Decision systems"],
    supportsSvg: true,
  },
  {
    id: "component_diagram",
    name: "Component Diagram",
    category: "diagram_and_architecture",
    looksLike: "Modular blocks showing internal structure of a system",
    useCases: [
      "Software design",
      "Service decomposition",
      "Codebase architecture",
    ],
    supportsSvg: true,
  },
  {
    id: "mind_map",
    name: "Mind Map",
    category: "diagram_and_architecture",
    looksLike: "Central node with branching subtopics in a radial layout",
    useCases: ["Idea exploration", "Concept breakdown", "Learning maps"],
    supportsSvg: true,
  },
  {
    id: "pipeline_diagram",
    name: "Pipeline Diagram",
    category: "diagram_and_architecture",
    looksLike: "Left-to-right or top-to-bottom staged processing flow",
    useCases: ["ML pipelines", "Data processing flows", "ETL systems"],
    supportsSvg: true,
  },
  {
    id: "layered_architecture_diagram",
    name: "Layered Architecture Diagram",
    category: "diagram_and_architecture",
    looksLike:
      "Stacked horizontal layers representing different system tiers",
    useCases: [
      "Frontend-backend-infra separation",
      "Clean architecture",
      "Enterprise systems",
    ],
    supportsSvg: true,
  },

  // Developer & Technical Styles
  {
    id: "ide_code_screenshot",
    name: "IDE Code Screenshot Style",
    category: "developer_and_technical",
    looksLike:
      "Code displayed inside an editor window like VSCode or PyCharm",
    useCases: ["Tutorials", "Code walkthroughs", "Documentation"],
    supportsSvg: false,
  },
  {
    id: "excalidraw_sketch",
    name: "Excalidraw Style Sketch",
    category: "developer_and_technical",
    looksLike: "Hand-drawn but structured boxes, arrows, and text",
    useCases: [
      "Twitter/LinkedIn tech posts",
      "Quick explanations",
      "Casual diagrams",
    ],
    supportsSvg: false,
  },
  {
    id: "figma_clean_diagram",
    name: "Figma-Style Clean Diagram",
    category: "developer_and_technical",
    looksLike:
      "Very polished, minimal, aligned professional UI-style diagram",
    useCases: ["Presentations", "Product docs", "Architecture reviews"],
    supportsSvg: false,
  },
  {
    id: "api_flow_diagram",
    name: "API Flow Diagram",
    category: "developer_and_technical",
    looksLike: "Request/response arrows between services and clients",
    useCases: [
      "Backend documentation",
      "Integration design",
      "System contracts",
    ],
    supportsSvg: true,
  },
  {
    id: "llm_agent_workflow",
    name: "LLM Agent Workflow Diagram",
    category: "developer_and_technical",
    looksLike:
      "Boxes representing agents, tools, memory, and orchestrator with arrows",
    useCases: [
      "Agentic AI explanation",
      "Tool-using systems",
      "Autonomous workflows",
    ],
    supportsSvg: true,
  },

  // Teaching & Presentation Styles
  {
    id: "powerpoint_slide",
    name: "PowerPoint Slide Style",
    category: "teaching_and_presentation",
    looksLike: "Title, bullet points, and one main diagram per slide",
    useCases: ["Office presentations", "Tech talks", "Stakeholder updates"],
    supportsSvg: false,
  },
  {
    id: "classroom_projector_slide",
    name: "Classroom Projector Slide",
    category: "teaching_and_presentation",
    looksLike: "Projected slide in a classroom or lecture hall",
    useCases: ["Training", "Courses", "Workshops"],
    supportsSvg: false,
  },
  {
    id: "infographic_poster",
    name: "Infographic / Poster",
    category: "teaching_and_presentation",
    looksLike: "Big headings, icons, and vertically structured content",
    useCases: ["Blog posts", "LinkedIn posts", "Marketing content"],
    supportsSvg: false,
  },
  {
    id: "cheat_sheet",
    name: "Cheat Sheet",
    category: "teaching_and_presentation",
    looksLike: "Dense but structured one-page summary",
    useCases: ["Quick reference", "Revision", "Internal docs"],
    supportsSvg: false,
  },
  {
    id: "one_pager_explainer",
    name: "One-Pager Explainer",
    category: "teaching_and_presentation",
    looksLike: "Single-page high-level explanation with sections",
    useCases: [
      "Product explanation",
      "Architecture overview",
      "Onboarding docs",
    ],
    supportsSvg: false,
  },

  // Research & Academic Styles
  {
    id: "research_paper_figure",
    name: "Research Paper Figure",
    category: "research_and_academic",
    looksLike:
      "Formal black-and-white or minimal color academic diagram",
    useCases: ["Paper explanation", "Technical blogs", "Research summaries"],
    supportsSvg: true,
  },
  {
    id: "benchmark_comparison_chart",
    name: "Benchmark Comparison Chart",
    category: "research_and_academic",
    looksLike: "Bar charts, tables, or line graphs comparing methods",
    useCases: ["Model comparison", "Performance evaluation"],
    supportsSvg: false,
  },
  {
    id: "model_architecture_diagram",
    name: "Model Architecture Diagram",
    category: "research_and_academic",
    looksLike:
      "Neural network blocks like Transformer layers and attention modules",
    useCases: ["Deep learning explanation", "Paper breakdowns"],
    supportsSvg: true,
  },
  {
    id: "ablation_study_diagram",
    name: "Ablation Study Diagram",
    category: "research_and_academic",
    looksLike: "Multiple variants of the same pipeline side by side",
    useCases: ["Research analysis", "Experimental explanation"],
    supportsSvg: true,
  },

  // Creative & Social Styles
  {
    id: "cartoon_diagram",
    name: "Cartoon Diagram",
    category: "creative_and_social",
    looksLike: "Friendly characters and simplified drawings",
    useCases: ["Social media", "Beginner explanations", "Engagement posts"],
    supportsSvg: false,
  },
  {
    id: "doodle_style",
    name: "Doodle Style",
    category: "creative_and_social",
    looksLike: "Sketchy, playful drawings",
    useCases: ["Casual explanations", "Personal blogs"],
    supportsSvg: false,
  },
  {
    id: "isometric_3d_diagram",
    name: "Isometric 3D Diagram",
    category: "creative_and_social",
    looksLike: "3D blocks in an isometric view representing systems",
    useCases: ["SaaS marketing", "High-end visuals"],
    supportsSvg: false,
  },
  {
    id: "futuristic_neon",
    name: "Futuristic Neon Style",
    category: "creative_and_social",
    looksLike: "Dark background with glowing neon elements",
    useCases: ["AI branding", "Tech marketing pages"],
    supportsSvg: false,
  },
  {
    id: "glassmorphism_ui",
    name: "Glassmorphism UI Style",
    category: "creative_and_social",
    looksLike: "Translucent glass-like UI cards and panels",
    useCases: ["Modern product visuals", "Landing pages"],
    supportsSvg: false,
  },

  // Product & Business Styles
  {
    id: "saas_dashboard_mock",
    name: "SaaS Dashboard Mock",
    category: "product_and_business",
    looksLike: "Web app dashboard UI with charts and panels",
    useCases: ["Product demos", "Marketing", "Feature explanation"],
    supportsSvg: false,
  },
  {
    id: "microservices_architecture",
    name: "Microservices Architecture Diagram",
    category: "product_and_business",
    looksLike: "Multiple independent services connected via network",
    useCases: ["Backend system design", "Scalability planning"],
    supportsSvg: false,
  },
  {
    id: "business_process_flow",
    name: "Business Process Flow",
    category: "product_and_business",
    looksLike: "Process steps with business icons and stages",
    useCases: ["Stakeholder communication", "Operations explanation"],
    supportsSvg: false,
  },
  {
    id: "user_journey_map",
    name: "User Journey Map",
    category: "product_and_business",
    looksLike: "Step-by-step user flow with emotions or actions",
    useCases: ["UX design", "Product thinking"],
    supportsSvg: false,
  },
  {
    id: "enterprise_architecture",
    name: "Enterprise Architecture Diagram",
    category: "product_and_business",
    looksLike: "Formal multi-system corporate IT diagram",
    useCases: ["Large org documentation", "Governance", "Reviews"],
    supportsSvg: false,
  },

  // Comparison & Table Styles
  {
    id: "side_by_side_comparison",
    name: "Side-by-Side Comparison Chart",
    category: "comparison_and_table",
    looksLike: "Two or more columns comparing options visually",
    useCases: ["Decision making", "Tool comparison", "Architecture choices"],
    supportsSvg: true,
  },
  {
    id: "table_screenshot",
    name: "Table Screenshot Style",
    category: "comparison_and_table",
    looksLike: "Grid table with rows and columns",
    useCases: ["Feature comparison", "Specs comparison"],
    supportsSvg: false,
  },
  {
    id: "before_vs_after",
    name: "Before vs After Split",
    category: "comparison_and_table",
    looksLike: "Split screen showing old vs new",
    useCases: ["Refactor explanation", "Optimization showcase"],
    supportsSvg: false,
  },
  {
    id: "ab_architecture_diagram",
    name: "A/B Architecture Diagram",
    category: "comparison_and_table",
    looksLike: "Two parallel pipelines compared side by side",
    useCases: ["Experiment comparison", "Approach evaluation"],
    supportsSvg: true,
  },
];

/**
 * Get styles filtered by category
 */
export function getStylesByCategory(category: StyleCategory): ImageStyle[] {
  return IMAGE_STYLES.filter((style) => style.category === category);
}

/**
 * Get a style by its ID
 */
export function getStyleById(id: string): ImageStyle | undefined {
  return IMAGE_STYLES.find((style) => style.id === id);
}

/**
 * Get all SVG-eligible styles
 */
export function getSvgEligibleStyles(): ImageStyle[] {
  return IMAGE_STYLES.filter((style) => style.supportsSvg);
}

/**
 * Get category display name
 */
export function getCategoryName(category: StyleCategory): string {
  return CATEGORIES.find((c) => c.id === category)?.name ?? category;
}

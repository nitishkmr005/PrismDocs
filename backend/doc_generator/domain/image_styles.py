"""
Image style definitions for image generation.

Contains all style categories, styles, and their metadata for
generating styled images using Gemini models.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class StyleCategory(str, Enum):
    """Categories of image styles."""
    HANDWRITTEN_AND_HUMAN = "handwritten_and_human"
    DIAGRAM_AND_ARCHITECTURE = "diagram_and_architecture"
    DEVELOPER_AND_TECHNICAL = "developer_and_technical"
    TEACHING_AND_PRESENTATION = "teaching_and_presentation"
    RESEARCH_AND_ACADEMIC = "research_and_academic"
    CREATIVE_AND_SOCIAL = "creative_and_social"
    PRODUCT_AND_BUSINESS = "product_and_business"
    COMPARISON_AND_TABLE = "comparison_and_table"


@dataclass
class ImageStyle:
    """Definition of an image style."""
    id: str
    name: str
    category: StyleCategory
    looks_like: str
    use_cases: list[str]
    supports_svg: bool = False


# All image styles organized by category
IMAGE_STYLES: list[ImageStyle] = [
    # Handwritten & Human Styles
    ImageStyle(
        id="whiteboard_handwritten",
        name="Whiteboard Handwritten",
        category=StyleCategory.HANDWRITTEN_AND_HUMAN,
        looks_like="Marker-written text on a whiteboard with boxes, arrows, underlines, and rough human handwriting",
        use_cases=["Teaching", "Explainer videos", "YouTube thumbnails", "Concept explanation", "Classroom-style visuals"],
    ),
    ImageStyle(
        id="notebook_handwritten",
        name="Notebook Handwritten",
        category=StyleCategory.HANDWRITTEN_AND_HUMAN,
        looks_like="Handwritten notes on ruled notebook pages with pen or pencil, highlights, and margins",
        use_cases=["Study notes", "Revision material", "Personal learning", "Documentation screenshots"],
    ),
    ImageStyle(
        id="sticky_notes_board",
        name="Sticky Notes Board",
        category=StyleCategory.HANDWRITTEN_AND_HUMAN,
        looks_like="Multiple colored sticky notes arranged on a wall or board with short phrases",
        use_cases=["Brainstorming", "Feature planning", "Ideation sessions", "High-level system planning"],
    ),
    ImageStyle(
        id="rough_scratchpad",
        name="Rough Scratchpad",
        category=StyleCategory.HANDWRITTEN_AND_HUMAN,
        looks_like="Messy, unstructured notes with crossed lines, arrows, and quick sketches",
        use_cases=["Thinking process", "Early ideation", "Problem exploration"],
    ),
    ImageStyle(
        id="exam_revision_notes",
        name="Exam Revision Notes",
        category=StyleCategory.HANDWRITTEN_AND_HUMAN,
        looks_like="Neatly written but dense notes with underlines, highlights, and boxed formulas",
        use_cases=["Last-minute revision", "Cheat sheets", "Learning summaries"],
    ),
    ImageStyle(
        id="book_margin_notes",
        name="Book Margin Notes",
        category=StyleCategory.HANDWRITTEN_AND_HUMAN,
        looks_like="Printed book or document pages with handwritten annotations and highlights",
        use_cases=["Explaining research papers", "Reading notes", "Concept commentary"],
    ),

    # Diagram & Architecture Styles
    ImageStyle(
        id="system_architecture_diagram",
        name="System Architecture Diagram",
        category=StyleCategory.DIAGRAM_AND_ARCHITECTURE,
        looks_like="Clean boxes and arrows showing components and their interactions",
        use_cases=["SaaS architecture", "ML systems", "LLM pipelines", "Backend design"],
        supports_svg=True,
    ),
    ImageStyle(
        id="flowchart",
        name="Flowchart",
        category=StyleCategory.DIAGRAM_AND_ARCHITECTURE,
        looks_like="Step-by-step boxes and decision diamonds connected by arrows",
        use_cases=["Logic explanation", "Process workflows", "Decision systems"],
        supports_svg=True,
    ),
    ImageStyle(
        id="component_diagram",
        name="Component Diagram",
        category=StyleCategory.DIAGRAM_AND_ARCHITECTURE,
        looks_like="Modular blocks showing internal structure of a system",
        use_cases=["Software design", "Service decomposition", "Codebase architecture"],
        supports_svg=True,
    ),
    ImageStyle(
        id="mind_map",
        name="Mind Map",
        category=StyleCategory.DIAGRAM_AND_ARCHITECTURE,
        looks_like="Central node with branching subtopics in a radial layout",
        use_cases=["Idea exploration", "Concept breakdown", "Learning maps"],
        supports_svg=True,
    ),
    ImageStyle(
        id="pipeline_diagram",
        name="Pipeline Diagram",
        category=StyleCategory.DIAGRAM_AND_ARCHITECTURE,
        looks_like="Left-to-right or top-to-bottom staged processing flow",
        use_cases=["ML pipelines", "Data processing flows", "ETL systems"],
        supports_svg=True,
    ),
    ImageStyle(
        id="layered_architecture_diagram",
        name="Layered Architecture Diagram",
        category=StyleCategory.DIAGRAM_AND_ARCHITECTURE,
        looks_like="Stacked horizontal layers representing different system tiers",
        use_cases=["Frontend-backend-infra separation", "Clean architecture", "Enterprise systems"],
        supports_svg=True,
    ),

    # Developer & Technical Styles
    ImageStyle(
        id="ide_code_screenshot",
        name="IDE Code Screenshot Style",
        category=StyleCategory.DEVELOPER_AND_TECHNICAL,
        looks_like="Code displayed inside an editor window like VSCode or PyCharm",
        use_cases=["Tutorials", "Code walkthroughs", "Documentation"],
    ),
    ImageStyle(
        id="excalidraw_sketch",
        name="Excalidraw Style Sketch",
        category=StyleCategory.DEVELOPER_AND_TECHNICAL,
        looks_like="Hand-drawn but structured boxes, arrows, and text",
        use_cases=["Twitter/LinkedIn tech posts", "Quick explanations", "Casual diagrams"],
    ),
    ImageStyle(
        id="figma_clean_diagram",
        name="Figma-Style Clean Diagram",
        category=StyleCategory.DEVELOPER_AND_TECHNICAL,
        looks_like="Very polished, minimal, aligned professional UI-style diagram",
        use_cases=["Presentations", "Product docs", "Architecture reviews"],
    ),
    ImageStyle(
        id="api_flow_diagram",
        name="API Flow Diagram",
        category=StyleCategory.DEVELOPER_AND_TECHNICAL,
        looks_like="Request/response arrows between services and clients",
        use_cases=["Backend documentation", "Integration design", "System contracts"],
        supports_svg=True,
    ),
    ImageStyle(
        id="llm_agent_workflow",
        name="LLM Agent Workflow Diagram",
        category=StyleCategory.DEVELOPER_AND_TECHNICAL,
        looks_like="Boxes representing agents, tools, memory, and orchestrator with arrows",
        use_cases=["Agentic AI explanation", "Tool-using systems", "Autonomous workflows"],
        supports_svg=True,
    ),

    # Teaching & Presentation Styles
    ImageStyle(
        id="powerpoint_slide",
        name="PowerPoint Slide Style",
        category=StyleCategory.TEACHING_AND_PRESENTATION,
        looks_like="Title, bullet points, and one main diagram per slide",
        use_cases=["Office presentations", "Tech talks", "Stakeholder updates"],
    ),
    ImageStyle(
        id="classroom_projector_slide",
        name="Classroom Projector Slide",
        category=StyleCategory.TEACHING_AND_PRESENTATION,
        looks_like="Projected slide in a classroom or lecture hall",
        use_cases=["Training", "Courses", "Workshops"],
    ),
    ImageStyle(
        id="infographic_poster",
        name="Infographic / Poster",
        category=StyleCategory.TEACHING_AND_PRESENTATION,
        looks_like="Big headings, icons, and vertically structured content",
        use_cases=["Blog posts", "LinkedIn posts", "Marketing content"],
    ),
    ImageStyle(
        id="cheat_sheet",
        name="Cheat Sheet",
        category=StyleCategory.TEACHING_AND_PRESENTATION,
        looks_like="Dense but structured one-page summary",
        use_cases=["Quick reference", "Revision", "Internal docs"],
    ),
    ImageStyle(
        id="one_pager_explainer",
        name="One-Pager Explainer",
        category=StyleCategory.TEACHING_AND_PRESENTATION,
        looks_like="Single-page high-level explanation with sections",
        use_cases=["Product explanation", "Architecture overview", "Onboarding docs"],
    ),

    # Research & Academic Styles
    ImageStyle(
        id="research_paper_figure",
        name="Research Paper Figure",
        category=StyleCategory.RESEARCH_AND_ACADEMIC,
        looks_like="Formal black-and-white or minimal color academic diagram",
        use_cases=["Paper explanation", "Technical blogs", "Research summaries"],
        supports_svg=True,
    ),
    ImageStyle(
        id="benchmark_comparison_chart",
        name="Benchmark Comparison Chart",
        category=StyleCategory.RESEARCH_AND_ACADEMIC,
        looks_like="Bar charts, tables, or line graphs comparing methods",
        use_cases=["Model comparison", "Performance evaluation"],
    ),
    ImageStyle(
        id="model_architecture_diagram",
        name="Model Architecture Diagram",
        category=StyleCategory.RESEARCH_AND_ACADEMIC,
        looks_like="Neural network blocks like Transformer layers and attention modules",
        use_cases=["Deep learning explanation", "Paper breakdowns"],
        supports_svg=True,
    ),
    ImageStyle(
        id="ablation_study_diagram",
        name="Ablation Study Diagram",
        category=StyleCategory.RESEARCH_AND_ACADEMIC,
        looks_like="Multiple variants of the same pipeline side by side",
        use_cases=["Research analysis", "Experimental explanation"],
        supports_svg=True,
    ),

    # Creative & Social Styles
    ImageStyle(
        id="cartoon_diagram",
        name="Cartoon Diagram",
        category=StyleCategory.CREATIVE_AND_SOCIAL,
        looks_like="Friendly characters and simplified drawings",
        use_cases=["Social media", "Beginner explanations", "Engagement posts"],
    ),
    ImageStyle(
        id="doodle_style",
        name="Doodle Style",
        category=StyleCategory.CREATIVE_AND_SOCIAL,
        looks_like="Sketchy, playful drawings",
        use_cases=["Casual explanations", "Personal blogs"],
    ),
    ImageStyle(
        id="isometric_3d_diagram",
        name="Isometric 3D Diagram",
        category=StyleCategory.CREATIVE_AND_SOCIAL,
        looks_like="3D blocks in an isometric view representing systems",
        use_cases=["SaaS marketing", "High-end visuals"],
    ),
    ImageStyle(
        id="futuristic_neon",
        name="Futuristic Neon Style",
        category=StyleCategory.CREATIVE_AND_SOCIAL,
        looks_like="Dark background with glowing neon elements",
        use_cases=["AI branding", "Tech marketing pages"],
    ),
    ImageStyle(
        id="glassmorphism_ui",
        name="Glassmorphism UI Style",
        category=StyleCategory.CREATIVE_AND_SOCIAL,
        looks_like="Translucent glass-like UI cards and panels",
        use_cases=["Modern product visuals", "Landing pages"],
    ),

    # Product & Business Styles
    ImageStyle(
        id="saas_dashboard_mock",
        name="SaaS Dashboard Mock",
        category=StyleCategory.PRODUCT_AND_BUSINESS,
        looks_like="Web app dashboard UI with charts and panels",
        use_cases=["Product demos", "Marketing", "Feature explanation"],
    ),
    ImageStyle(
        id="microservices_architecture",
        name="Microservices Architecture Diagram",
        category=StyleCategory.PRODUCT_AND_BUSINESS,
        looks_like="Multiple independent services connected via network",
        use_cases=["Backend system design", "Scalability planning"],
    ),
    ImageStyle(
        id="business_process_flow",
        name="Business Process Flow",
        category=StyleCategory.PRODUCT_AND_BUSINESS,
        looks_like="Process steps with business icons and stages",
        use_cases=["Stakeholder communication", "Operations explanation"],
    ),
    ImageStyle(
        id="user_journey_map",
        name="User Journey Map",
        category=StyleCategory.PRODUCT_AND_BUSINESS,
        looks_like="Step-by-step user flow with emotions or actions",
        use_cases=["UX design", "Product thinking"],
    ),
    ImageStyle(
        id="enterprise_architecture",
        name="Enterprise Architecture Diagram",
        category=StyleCategory.PRODUCT_AND_BUSINESS,
        looks_like="Formal multi-system corporate IT diagram",
        use_cases=["Large org documentation", "Governance", "Reviews"],
    ),

    # Comparison & Table Styles
    ImageStyle(
        id="side_by_side_comparison",
        name="Side-by-Side Comparison Chart",
        category=StyleCategory.COMPARISON_AND_TABLE,
        looks_like="Two or more columns comparing options visually",
        use_cases=["Decision making", "Tool comparison", "Architecture choices"],
        supports_svg=True,
    ),
    ImageStyle(
        id="table_screenshot",
        name="Table Screenshot Style",
        category=StyleCategory.COMPARISON_AND_TABLE,
        looks_like="Grid table with rows and columns",
        use_cases=["Feature comparison", "Specs comparison"],
    ),
    ImageStyle(
        id="before_vs_after",
        name="Before vs After Split",
        category=StyleCategory.COMPARISON_AND_TABLE,
        looks_like="Split screen showing old vs new",
        use_cases=["Refactor explanation", "Optimization showcase"],
    ),
    ImageStyle(
        id="ab_architecture_diagram",
        name="A/B Architecture Diagram",
        category=StyleCategory.COMPARISON_AND_TABLE,
        looks_like="Two parallel pipelines compared side by side",
        use_cases=["Experiment comparison", "Approach evaluation"],
        supports_svg=True,
    ),
]


def get_style_by_id(style_id: str) -> Optional[ImageStyle]:
    """Get a style by its ID."""
    for style in IMAGE_STYLES:
        if style.id == style_id:
            return style
    return None


def get_all_categories() -> list[dict]:
    """Get all categories with their display names."""
    category_names = {
        StyleCategory.HANDWRITTEN_AND_HUMAN: "Handwritten & Human",
        StyleCategory.DIAGRAM_AND_ARCHITECTURE: "Diagram & Architecture",
        StyleCategory.DEVELOPER_AND_TECHNICAL: "Developer & Technical",
        StyleCategory.TEACHING_AND_PRESENTATION: "Teaching & Presentation",
        StyleCategory.RESEARCH_AND_ACADEMIC: "Research & Academic",
        StyleCategory.CREATIVE_AND_SOCIAL: "Creative & Social",
        StyleCategory.PRODUCT_AND_BUSINESS: "Product & Business",
        StyleCategory.COMPARISON_AND_TABLE: "Comparison & Table",
    }
    return [
        {"id": cat.value, "name": category_names[cat]}
        for cat in StyleCategory
    ]

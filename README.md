# AI COMMS Studio

A professional 3-step AI-powered content editing application with a modern, reusable component-based UI.

---

## 🎯 Overview

The application executes the **Capture → Refine → Finalize** workflow via a strictly decoupled architecture. The frontend handles state and UI routing, while the Python backend serves as a secure AI orchestration layer.

**Core Features:**
1. **Guided Draft Generation** — Capture a transcript, select a target channel, tone etc and generate 3 AI draft variants
2. **One-Click Refinement** — Quick-action buttons for targeted edits (Tone, Shorten, Longer, Dramatic, Engaging)
3. **Finalize & Export** — Review with automated quality checks, copy to clipboard, download as Markdown, or push to CMS

---

## ✨ UI System

### Professional Component Architecture
- **Reusable Base Components** (Button, Card, Input, Tabs, Badge, StepIndicator, Alert, PageHeader)
- **Light & Dark Mode Support** — Automatic theme switching
- **Responsive Design** — Mobile-first, works on all devices
- **Full TypeScript Support** — Type-safe components
- **WCAG AA Accessibility** — Focus management, semantic HTML

---

## 🚀 Quick Start

### Single-command startup

**Unix / Linux / Mac:**
```bash
./start.sh
```

**Windows PowerShell:**
```powershell
.\start.ps1
```

This automatically:
1. Sets up a Python virtual environment and installs backend dependencies
2. Installs frontend npm packages
3. Starts both servers (Backend on `:8000`, Frontend on `:5173`)

### Manual startup

```bash
# Terminal 1 — Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## 🧠 Mock LLM Service

The project ships with a **high-fidelity mock service** (`MockLLMService`) that realistically simulates AI-generated drafts without requiring an OpenAI API key. Set `USE_MOCK_LLM=true` in `backend/.env` (the default).

### Channel-Specific Templates

The mock generates structurally distinct drafts for each target channel:

| Channel | Draft Format |
|---|---|
| **LinkedIn** | Short, conversational post with emojis, bullet points, and hashtag-style language |
| **Blog Post / Website** | Long-form Markdown with `#` titles, `##` section headings, and structured paragraphs |
| **Internal Email** | `Subject:` line, greeting, body paragraphs, and professional signature block |

### Tone Variation

Each channel template has three tone variants that include keywords matching the frontend quality checks:

| Tone | Style | Keywords included |
|---|---|---|
| **Professional** | Formal, polished | `regards`, `sincerely`, `dear`, `professional`, `respectfully` |
| **Enthusiastic** | Energetic, exclamation-heavy | `excited`, `thrilled`, `amazing`, `great`, `enthusiastic`, 🚀🎉✨ |
| **Executive Summary** | Concise, data-driven | `summary`, `overview`, `key takeaways`, `high-level` |

### Dynamic Refinement

The `refine_text` endpoint applies contextually-aware transformations:

| Adjustment | Behavior |
|---|---|
| **Shorten** | Condenses to headings + first bullet point; truncates paragraphs |
| **Longer** | Appends channel-appropriate expansion (industry outlook for blogs, Q&A for emails, conversation prompt for LinkedIn) |
| **Dramatic** | Replaces headings with bold impactful language (`Key Highlights` → `**Standout Achievements**`) |
| **Engaging** | Prepends conversational hooks and appends call-to-action questions |
| **Tone** | Switches between Enthusiastic ↔ Professional (strips/adds emojis, swaps vocabulary) |

### Key Points Extraction

The mock service extracts bullet points from the user's transcript and returns them as `key_points` in the API response. The frontend stores these in `draftState.keyPoints` so that the **Keyword Density** quality check passes automatically.

---

## 🔌 API Interactions & Provider Abstraction

Clean LLM abstraction using Python Abstract Base Classes:

```python
# backend/app/services/llm_provider.py
from abc import ABC, abstractmethod

class ILLMProvider(ABC):
    @abstractmethod
    async def generate_draft(self, inputs: GenerateRequest) -> AIResponse: ...

    @abstractmethod
    async def refine_text(self, current_text: str, instruction: str, adjustment_type: str | None = None) -> AIResponse: ...
```

FastAPI routes inject the correct provider based on environment:

```python
# backend/app/main.py
def get_llm_provider():
    if os.getenv("USE_MOCK_LLM", "true").lower() == "true":
        return MockLLMService()
    return OpenAIService()
```

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/generate` | Generate 3 draft variants from a transcript, channel, tone, and metadata |
| `POST` | `/api/refine` | Refine a draft with an instruction and adjustment type |
| `POST` | `/api/upload` | Upload a `.txt`, `.pdf`, or `.docx` file and extract text |

### Response Model

```python
class AIResponse(BaseModel):
    text: str | None = None          # Used by /api/refine
    drafts: list[str] | None = None  # Used by /api/generate (3 variants)
    key_points: list[str] | None = None  # Extracted key points from the content
    error: str | None = None
```

---

## 🏗 Technology Stack

### Frontend (Client)
* **Build Tool:** Vite (rapid HMR and lightweight bundling)
* **Framework:** React 18 + TypeScript
* **Styling:** Tailwind CSS 3.4 with dark mode support
* **State Management:** React Context with sessionStorage persistence
* **UI Components:** Custom reusable component library (8 base components)

### Backend (API & Orchestration)
* **Framework:** FastAPI (Python) — lightweight, async-native
* **LLM Integration:** OpenAI Python SDK + high-fidelity `MockLLMService`
* **File Extraction:** PyPDF2 (PDF), python-docx (DOCX), native (TXT)
* **Security:** python-dotenv for credential management

---

## 📁 Project Structure

```
comms-ai-prototype/
├── frontend/                          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── StepIndicator.tsx
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   └── index.ts
│   │   │   ├── AppLayout.tsx         # Main layout wrapper
│   │   │   ├── CaptureForm.tsx       # Step 1: Capture
│   │   │   ├── RefinementEditor.tsx  # Step 2: Refine
│   │   │   └── FinalizeView.tsx      # Step 3: Finalize
│   │   ├── constants/
│   │   │   ├── routes.ts            # Route definitions & WorkflowPhase type
│   │   │   └── uiCopy.ts            # All UI strings, options, and limits
│   │   ├── context/
│   │   │   └── DraftContext.tsx      # State management (sessionStorage-backed)
│   │   ├── hooks/
│   │   │   ├── useDraftWorkflowActions.ts  # API call orchestration
│   │   │   └── useWorkflowNavigation.ts    # Route navigation helpers
│   │   ├── lib/
│   │   │   └── api.ts               # API client (fetch-based)
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── CapturePage.tsx
│   │   │   ├── RefinePage.tsx
│   │   │   └── FinalisePage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── DESIGN_SYSTEM.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── COMPONENT_INVENTORY.md
│   ├── tailwind.config.js
│   └── package.json
├── backend/                          # FastAPI app
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI routes & file upload
│   │   ├── models.py                # Pydantic models (GenerateRequest, RefineRequest, AIResponse)
│   │   └── services/
│   │       ├── llm_provider.py      # Abstract provider interface
│   │       ├── openai_service.py    # OpenAI implementation (with key_points extraction)
│   │       └── mock_service.py      # High-fidelity mock (channel/tone templates)
│   ├── requirements.txt
│   └── .env                         # USE_MOCK_LLM=true (default)
├── docs/
│   ├── transcript-converter-prd.md
│   ├── feature_mapping_prototype_strategy.md
│   ├── Product_Architecture_Document.md
│   └── user_research_product_vision.md
├── start.sh                         # Unix startup script
├── start.ps1                        # Windows startup script
└── README.md
```

---

## 🎨 Design System Highlights

### Color Scheme
- **Primary**: Sky Blue (light: `#0284c7`, dark: `#0ea5e9`)
- **Light Mode**: White background, slate-900 text
- **Dark Mode**: Slate-950 background, slate-100 text
- **Status Colors**: Green (success), Red (error), Amber (warning)

### Component Variants
- **Button**: primary, secondary, tertiary, ghost, danger
- **Badge**: success, warning, error, info, primary, neutral
- **Alert**: success, warning, error, info

### Spacing & Typography
- 8px grid system for consistent spacing
- Inter font family for professional appearance
- Responsive typography scales
- Accessible focus rings on all interactive elements

---

## ✅ Quality Assurance

The **Finalize** step runs four automated quality checks before allowing CMS push:

| Check | Passes when… |
|---|---|
| **Tone Match** | Draft text contains keywords matching the selected tone |
| **Length Target** | Character count is between 100–2000 |
| **Keyword Density** | Key points from the transcript appear in the draft (or structural indicators like bullet lists are present) |
| **Metadata Present** | At least one metadata field (title, date, venue, authors) was filled |

### General Quality
- ✅ **TypeScript** — Full type safety, zero compilation errors
- ✅ **Responsive** — Mobile, tablet, desktop layouts
- ✅ **Accessible** — WCAG AA compliance
- ✅ **Dark Mode** — Complete theme coverage
- ✅ **Performance** — Optimized animations, minimal re-renders
- ✅ **Documentation** — Comprehensive guides included

---

## 🌐 Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari 14+, Chrome Android 80+)

---
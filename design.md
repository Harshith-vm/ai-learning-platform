# AI Learning Platform — Design Document

## 1. Project Overview

The **AI Learning Platform** is an intelligent, persona-adaptive educational tool that helps users learn from documents and code. It combines LLM-powered content analysis with an adaptive persona engine that tailors explanations to beginner, student, or senior developer audiences.

The system is composed of three independently deployable components:

| Component | Technology | Purpose |
|---|---|---|
| **Backend API** | Python / FastAPI | REST API, LLM orchestration, auth, persistence |
| **Frontend Web App** | Next.js 14 / TypeScript | Dashboard, document tools, code analysis UI |
| **Chrome Extension** | Vanilla JS (Manifest V3) | In-browser code tool access via extension popup |

---

## 2. Design Goals

1. **Persona-Adaptive Learning** — Every AI response adapts its depth, tone, and vocabulary to the user's persona (beginner / student / senior_dev).
2. **Multi-Modal Content Processing** — Supports raw text input, document upload (PDF, DOCX, TXT), and code analysis.
3. **Measurable Learning Outcomes** — A pre-test → study → post-test pipeline that computes quantitative learning gain.
4. **Full Activity History** — All user interactions are persisted and accessible via the history dashboard.
5. **Pluggable LLM Backend** — Supports switching between Groq (Llama 3.1) and AWS Bedrock (Claude 3 Sonnet) via a single env var.
6. **Extensibility** — Chrome extension extends platform features directly into the browser.

---

## 3. System Architecture

### 3.1 High-Level Architecture

![AI Learning Platform Architecture](architecture_flowchart.png)

The platform follows a **layered architecture**:

```
┌──────────────────────────────────────────────────┐
│              Client Layer                        │
│    Next.js Frontend  │  Chrome Extension         │
├──────────────────────┼───────────────────────────┤
│              API Gateway (FastAPI)                │
│         CORS  │  JWT Auth  │  Exception Handlers  │
├──────────────────────────────────────────────────┤
│              Router Layer                        │
│    Auth Router  │  History Router  │  Main Routes │
├──────────────────────────────────────────────────┤
│              Service Layer (18 services)          │
│  Summary │ Document │ MCQ │ Code │ Learning Gain  │
├──────────────────────────────────────────────────┤
│              Core Layer                          │
│  LLM Router │ Prompt Templates │ Persona Engine   │
├──────────────────────────────────────────────────┤
│              External + Data                     │
│  Groq API │ AWS Bedrock │ SQLite │ In-Memory Store│
└──────────────────────────────────────────────────┘
```

### 3.2 Request Flow

1. Client sends HTTP request with JWT token in `Authorization: Bearer` header
2. CORS middleware validates the origin
3. JWT auth guard decodes token and resolves `User` from the database
4. Router delegates to the appropriate service
5. Service constructs a persona-aware prompt and calls `call_llm()`
6. LLM Router selects provider (Groq or Bedrock) based on `LLM_PROVIDER` env var
7. Response is parsed, persisted to history, and returned to the client

---

## 4. Backend Design

### 4.1 Directory Structure

```
app/
├── main.py              # FastAPI app, all main route definitions
├── database.py          # SQLAlchemy engine, session, Base
├── core/
│   ├── config.py        # Settings singleton (.env loader)
│   ├── llm.py           # LLM provider router (Groq / Bedrock)
│   ├── persona.py       # Persona engine (3 cognitive profiles)
│   └── prompts.py       # Prompt templates for all task types
├── routers/
│   ├── auth_router.py   # /auth/* (register, login, profile)
│   └── history_router.py# /history/* (activity retrieval)
├── services/            # 18 business logic services
│   ├── summary_service.py
│   ├── document_service.py
│   ├── document_summary_service.py
│   ├── key_points_service.py
│   ├── flashcard_service.py
│   ├── mcq_service.py
│   ├── document_mcq_service.py
│   ├── mcq_feedback_service.py
│   ├── mcq_session_service.py
│   ├── learning_gain_service.py
│   ├── code_session_service.py
│   ├── code_generation_service.py
│   ├── code_tools_service.py
│   ├── history_service.py
│   ├── auth_dependency.py
│   ├── jwt_service.py
│   ├── password_service.py
│   └── session_helpers.py
├── models/              # 9 SQLAlchemy ORM models
│   ├── user.py
│   ├── summary_history.py
│   ├── document_summary_history.py
│   ├── mcq_history.py
│   ├── mcq_session_history.py
│   ├── key_points_history.py
│   ├── flashcard_history.py
│   ├── learning_gain_history.py
│   └── code_analysis_history.py
└── schemas/             # 28 Pydantic request/response schemas
```

### 4.2 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ✗ | Register with email, password, persona |
| `POST` | `/auth/login` | ✗ | Login → JWT token |
| `GET` | `/auth/me` | ✓ | Current user profile |
| `GET` | `/auth/profile` | ✓ | Detailed profile with preferences |
| `PUT` | `/auth/profile` | ✓ | Update persona / learning style |
| `POST` | `/generate-summary` | ✓ | Text → structured summary |
| `POST` | `/generate-mcqs` | ✗ | Text → 5 MCQs |
| `POST` | `/concept/explain` | ✗ | Concept → persona-aware explanation |
| `POST` | `/upload-document` | ✗ | PDF/DOCX/TXT → document_id |
| `GET` | `/document/{id}` | ✗ | Retrieve stored document |
| `POST` | `/summarize/{id}` | ✓ | Document → summary (persisted) |
| `GET` | `/summarize-stream/{id}` | ✗ | Document → streaming summary |
| `POST` | `/key-points/{id}` | ✓ | Document → key points |
| `POST` | `/flashcards/{id}` | ✓ | Document → flashcards |
| `POST` | `/mcqs/{id}` | ✗ | Document → MCQs |
| `POST` | `/mcq-feedback/{id}` | ✗ | Single MCQ answer → feedback |
| `POST` | `/mcq-session/{id}` | ✓ | Full MCQ session → score |
| `POST` | `/learning/pre-test/{id}` | ✗ | Generate pre-test |
| `POST` | `/learning/pre-test/submit/{id}` | ✓ | Submit & score pre-test |
| `POST` | `/learning/post-test/{id}` | ✗ | Generate post-test |
| `POST` | `/learning/post-test/submit/{id}` | ✓ | Submit post-test → learning gain |
| `POST` | `/code` | ✗ | Submit code → session_id |
| `POST` | `/code/explain/{id}` | ✓ | Code → explanation |
| `POST` | `/code/improve/{id}` | ✗ | Code → improvement suggestions |
| `POST` | `/code/complexity/{id}` | ✗ | Code → complexity analysis |
| `POST` | `/code/refactor/{id}` | ✗ | Code → refactored version |
| `POST` | `/code/generate` | ✗ | Prompt → generated code |

### 4.3 LLM Provider Abstraction

The `call_llm()` function acts as a router that selects between providers:

```
call_llm(prompt, persona) 
  ├── persona → build_persona_system_prompt()
  ├── LLM_PROVIDER = "groq"    → call_groq()    → Groq API (Llama 3.1-8B)
  └── LLM_PROVIDER = "bedrock" → call_bedrock()  → AWS Bedrock (Claude 3 Sonnet)
```

Both providers support non-streaming (`call_*`) and streaming (`stream_*`) modes.

### 4.4 Persona Engine

Three distinct cognitive profiles drive the AI's behavior:

| Persona | Depth | Tone | Analogies | Complexity Discussion |
|---|---|---|---|---|
| **Beginner** | Low | Supportive, friendly | High (3+ analogies) | Forbidden |
| **Student** | Medium | Academic, educational | Medium | Conceptual only |
| **Senior Dev** | High | Direct, analytical | None | Full Big-O analysis |

Each persona has persona-specific rules that are injected into the LLM's system prompt. The persona affects both the system prompt (via `persona.py`) and the task-level prompt framing (via `prompts.py`).

---

## 5. Frontend Design

### 5.1 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Code Editor**: Monaco Editor
- **Icons**: Lucide React
- **UI Primitives**: Radix UI (Avatar, Dropdown Menu)

### 5.2 Page Structure

```
frontend/app/
├── page.tsx              # Landing / redirect
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── login/                # Login page
├── register/             # Registration with persona selection
├── (dashboard)/          # Dashboard layout group
├── history/              # Activity history
└── profile/              # User profile & settings
```

### 5.3 Component Architecture

```
components/
├── Navbar.tsx            # Navigation bar with auth state
├── ProtectedRoute.tsx    # JWT route guard wrapper
├── upload/               # Document upload & file handling
├── summary/              # Summary display components
├── simplify/             # Text simplification UI
├── mcq/                  # MCQ quiz interface
├── flashcards/           # Flashcard viewer
├── learning-gain/        # Pre/post test & gain display
├── code/                 # Code editor + analysis tools
├── dashboard/            # Dashboard widgets
├── layout/               # Layout components
└── common/               # Shared UI primitives
```

### 5.4 State Management

Three React contexts manage global state:

| Context | Purpose |
|---|---|
| `DocumentContext` | Current document, chunks, analysis results |
| `PersonaContext` | Active persona selection, profile sync |
| `ThemeContext` | Dark/light theme toggle |

### 5.5 API Communication

All API calls go through `lib/api.ts` which:
- Automatically attaches JWT from `localStorage`
- Sets `Content-Type` headers (JSON or FormData)
- Provides typed generic wrappers (`apiRequest<T>`)
- Handles error responses uniformly

---

## 6. Chrome Extension Design

### 6.1 Architecture

| File | Role |
|---|---|
| `manifest.json` | Manifest V3 configuration |
| `background.js` | Service worker for tab management |
| `content.js` | Content script injected into web pages |
| `popup.html/js` | Main extension UI (46KB of functionality) |
| `modules/codeTools.js` | Code analysis tool integration |

### 6.2 Capabilities

- Code explanation, improvement, and complexity analysis
- Code refactoring and generation
- Architecture analysis and quality assessment
- Pull request review
- Code block detection on web pages
- All powered by the same FastAPI backend

---

## 7. Data Design

### 7.1 Database

- **Engine**: SQLite via SQLAlchemy ORM
- **File**: `ai_learning_platform.db` (project root)
- **Session**: `SessionLocal` with auto-close dependency

### 7.2 Models

| Model | Key Fields | Purpose |
|---|---|---|
| `User` | email, password_hash, persona, learning_style, preferred_language | User accounts |
| `SummaryHistory` | user_id, original_text, summary_text | Text summaries |
| `DocumentSummaryHistory` | user_id, document_id, title, summary_text, main_themes | Doc summaries |
| `MCQHistory` | user_id, document_id, test_type, score, total_questions | Pre/post test scores |
| `MCQSessionHistory` | user_id, document_id, total_questions, correct_answers, score_percentage | Full quiz sessions |
| `KeyPointsHistory` | user_id, document_id, key_points (JSON) | Extracted key points |
| `FlashcardHistory` | user_id, document_id, flashcards (JSON) | Generated flashcards |
| `LearningGainHistory` | user_id, document_id, pre_test_score, post_test_score, learning_gain | Learning gain metrics |
| `CodeAnalysisHistory` | user_id, code, language, analysis_type, result | Code analysis results |

### 7.3 In-Memory Store

The `DOCUMENT_STORE` dictionary holds uploaded documents, their text chunks, generated MCQs, and learning session state. This is ephemeral and lost on server restart.

---

## 8. Authentication Design

### 8.1 Flow

```
Register → hash password (bcrypt) → store User → return success
Login    → verify password → create JWT (python-jose) → return token
Request  → extract Bearer token → decode JWT → load User → proceed
```

### 8.2 JWT Token Structure

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "persona": "student",
  "exp": 1709856000
}
```

### 8.3 Auth Dependency

The `get_current_user` dependency:
1. Extracts token from `Authorization: Bearer` header
2. Decodes and validates via `decode_access_token()`
3. Queries `User` by `user_id` from the token payload
4. Returns `User` object or raises `401 Unauthorized`

An optional variant `get_current_user_optional` returns `None` instead of raising.

---

## 9. Key Design Patterns

| Pattern | Where Used |
|---|---|
| **Dependency Injection** | FastAPI `Depends()` for DB sessions and auth |
| **Singleton** | `Settings` instance in `config.py` |
| **Strategy** | LLM provider selection (Groq vs. Bedrock) |
| **Template Method** | Prompt construction per task type and persona |
| **Repository** | History services abstract DB writes |
| **Observer** | React Contexts for state propagation |
| **Facade** | `apiRequest<T>()` wraps all HTTP communication |

---

## 10. Configuration

### 10.1 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✓ | — | Groq API key |
| `HUGGINGFACE_API_KEY` | ✓ | — | HuggingFace API key |
| `LLM_PROVIDER` | ✗ | `groq` | LLM provider: `groq` or `bedrock` |
| `AWS_REGION` | ✗ | `us-east-1` | AWS region for Bedrock |
| `APP_ENV` | ✗ | `development` | `development` / `staging` / `production` |
| `DEBUG` | ✗ | `false` | Debug mode |
| `DATABASE_URL` | ✗ | — | Future: external DB connection |
| `REDIS_URL` | ✗ | — | Future: caching layer |
| `S3_BUCKET_NAME` | ✗ | — | Future: file storage |

### 10.2 File Upload Limits

- Maximum file size: 50 MB
- Supported formats: `.txt`, `.pdf`, `.docx`

---

## 11. Dependencies

### Backend (Python)

| Package | Version | Purpose |
|---|---|---|
| fastapi | 0.109.0 | Web framework |
| uvicorn | 0.27.0 | ASGI server |
| pydantic | 2.5.3 | Data validation |
| httpx | 0.26.0 | Async HTTP client (Groq API) |
| boto3 | — | AWS SDK (Bedrock) |
| SQLAlchemy | — | ORM |
| python-jose | — | JWT tokens |
| passlib[bcrypt] | — | Password hashing |
| PyPDF2 | 3.0.1 | PDF text extraction |
| python-docx | 1.1.0 | DOCX text extraction |

### Frontend (Node.js)

| Package | Version | Purpose |
|---|---|---|
| next | 16.1.6 | React framework |
| react | 18.3.0 | UI library |
| tailwindcss | 3.4.1 | Utility-first CSS |
| framer-motion | 11.0.0 | Animations |
| @monaco-editor/react | 4.7.0 | Code editor |
| lucide-react | 0.344.0 | Icons |
| @radix-ui/* | various | Accessible UI primitives |

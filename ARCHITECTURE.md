# AI Learning Platform — Architecture Flowchart

## High-Level System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer"]
        FE["Next.js Frontend<br/>(TypeScript / Tailwind)"]
        CE["Chrome Extension<br/>(Vanilla JS)"]
    end

    subgraph API["⚡ API Gateway"]
        FA["FastAPI Server<br/>Port 8000"]
    end

    subgraph MIDDLEWARE["🔐 Middleware"]
        CORS["CORS Middleware"]
        JWT["JWT Auth Guard"]
    end

    subgraph ROUTERS["🛣️ Routers"]
        AR["Auth Router<br/>/auth/*"]
        HR["History Router<br/>/history/*"]
        MR["Main Routes<br/>app/main.py"]
    end

    subgraph SERVICES["⚙️ Service Layer"]
        direction TB
        AS["Auth / JWT<br/>Service"]
        SS["Summary<br/>Service"]
        DS["Document<br/>Service"]
        DSS["Doc Summary<br/>Service"]
        KPS["Key Points<br/>Service"]
        FCS["Flashcard<br/>Service"]
        MS["MCQ<br/>Service"]
        DMS["Doc MCQ<br/>Service"]
        MFS["MCQ Feedback<br/>Service"]
        MSS["MCQ Session<br/>Service"]
        LGS["Learning Gain<br/>Service"]
        CSS["Code Session<br/>Service"]
        CGS["Code Gen<br/>Service"]
        CTS["Code Tools<br/>Service"]
        HS["History<br/>Service"]
    end

    subgraph CORE["🧠 Core"]
        LLM["LLM Router<br/>(call_llm / stream_llm)"]
        PROMPTS["Prompt<br/>Templates"]
        PERSONA["Persona<br/>Engine"]
        CONFIG["Config<br/>(.env)"]
    end

    subgraph LLM_PROVIDERS["☁️ LLM Providers"]
        GROQ["Groq API<br/>(Llama 3.1-8B)"]
        BEDROCK["AWS Bedrock<br/>(Claude 3 Sonnet)"]
    end

    subgraph DATA["💾 Data Layer"]
        DB["SQLite Database<br/>(SQLAlchemy ORM)"]
        MEM["In-Memory<br/>Document Store"]
    end

    FE -->|"HTTP / REST"| FA
    CE -->|"HTTP / REST"| FA
    FA --> CORS --> JWT
    JWT --> AR
    JWT --> HR
    JWT --> MR

    AR --> AS
    HR --> HS
    MR --> SS
    MR --> DS
    MR --> DSS
    MR --> KPS
    MR --> FCS
    MR --> MS
    MR --> DMS
    MR --> MFS
    MR --> MSS
    MR --> LGS
    MR --> CSS
    MR --> CGS
    MR --> CTS

    SS --> LLM
    DSS --> LLM
    KPS --> LLM
    FCS --> LLM
    MS --> LLM
    DMS --> LLM
    MFS --> LLM
    LGS --> LLM
    CSS --> LLM
    CGS --> LLM
    CTS --> LLM

    LLM --> PROMPTS
    LLM --> PERSONA
    LLM --> CONFIG
    LLM --> GROQ
    LLM --> BEDROCK

    AS --> DB
    HS --> DB
    MSS --> DB
    DS --> MEM
    DSS --> MEM
```

---

## Frontend Architecture (Next.js)

```mermaid
graph LR
    subgraph PAGES["📄 Pages (App Router)"]
        LP["/ (Landing)"]
        LOGIN["/login"]
        REG["/register"]
        DASH["/(dashboard)"]
        HIST["/history"]
        PROF["/profile"]
    end

    subgraph COMPONENTS["🧩 Components"]
        NAV["Navbar"]
        PR["ProtectedRoute"]
        UP["Upload"]
        SUM["Summary"]
        SIMP["Simplify"]
        MCQ["MCQ"]
        FC["Flashcards"]
        LG["Learning Gain"]
        CODE["Code Analysis"]
        COMMON["Common UI"]
        LAYOUT["Layout"]
        DASHC["Dashboard"]
    end

    subgraph CONTEXTS["🔄 Contexts"]
        DC["DocumentContext"]
        PC["PersonaContext"]
        TC["ThemeContext"]
    end

    subgraph LIB["📚 Lib"]
        API["api.ts<br/>(apiRequest + JWT)"]
        CAPI["codeApi.ts"]
        CONAPI["conceptApi.ts"]
        AUTH["auth.ts"]
    end

    PAGES --> COMPONENTS
    COMPONENTS --> CONTEXTS
    COMPONENTS --> LIB
    LIB -->|"fetch()"| BACKEND["FastAPI Backend"]
```

---

## Chrome Extension Architecture

```mermaid
graph TB
    subgraph EXTENSION["🧩 Chrome Extension"]
        MF["manifest.json<br/>(Manifest V3)"]
        BG["background.js<br/>(Service Worker)"]
        CS["content.js<br/>(Content Script)"]
        POP["popup.html + popup.js<br/>(Extension Popup UI)"]
        MOD["modules/codeTools.js"]
    end

    POP -->|"Uses"| MOD
    POP -->|"API Calls"| BACKEND2["FastAPI Backend"]
    BG -->|"Manages Tabs"| CS
    CS -->|"Injects into"| WEB["Web Pages"]
```

---

## Data Flow: Document Learning Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as FastAPI
    participant SVC as Services
    participant LLM as LLM Provider
    participant DB as Database

    U->>FE: Upload Document
    FE->>API: POST /upload-document
    API->>SVC: extract_text_from_file()
    SVC-->>API: {document_id, chunks}
    API-->>FE: document_id

    U->>FE: Request Summary
    FE->>API: POST /summarize/{doc_id}
    API->>SVC: summarize_document()
    SVC->>LLM: Prompt with chunks
    LLM-->>SVC: Summary text
    SVC-->>API: DocumentSummaryResponse
    API->>DB: Save summary history
    API-->>FE: Summary response

    U->>FE: Generate MCQs
    FE->>API: POST /mcqs/{doc_id}
    API->>SVC: generate_mcqs()
    SVC->>LLM: Prompt with content
    LLM-->>SVC: MCQ JSON
    SVC-->>API: MCQResponse
    API-->>FE: MCQs displayed

    U->>FE: Submit MCQ Session
    FE->>API: POST /mcq-session/{doc_id}
    API->>SVC: evaluate_mcq_session()
    SVC-->>API: Score & results
    API->>DB: Save session history
    API-->>FE: MCQSessionResponse
```

---

## Data Flow: Code Analysis Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant CL as Client (FE / Extension)
    participant API as FastAPI
    participant SVC as Code Services
    participant LLM as LLM Provider
    participant DB as Database

    U->>CL: Paste / Select Code
    CL->>API: POST /code
    API->>SVC: store_code_session()
    SVC-->>API: session_id

    U->>CL: Request Explanation
    CL->>API: POST /code/explain/{session_id}
    API->>SVC: explain_code()
    SVC->>LLM: Code + explain prompt
    LLM-->>SVC: Explanation text
    SVC-->>API: CodeExplanationResponse
    API->>DB: Save code analysis history
    API-->>CL: Explanation displayed

    U->>CL: Request Complexity Analysis
    CL->>API: POST /code/complexity/{session_id}
    API->>SVC: analyze_complexity()
    SVC->>LLM: Code + complexity prompt
    LLM-->>SVC: Complexity result
    API-->>CL: ComplexityResponse
```

---

## Data Flow: Learning Gain Assessment

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as FastAPI
    participant SVC as Learning Gain Service
    participant LLM as LLM Provider
    participant DB as Database

    U->>FE: Start Learning Gain
    FE->>API: POST /learning/pre-test/{doc_id}
    API->>SVC: generate_pre_test()
    SVC->>LLM: Generate pre-test MCQs
    LLM-->>SVC: MCQs
    API-->>FE: Pre-test questions

    U->>FE: Submit Pre-test Answers
    FE->>API: POST /learning/pre-test/submit/{doc_id}
    API->>SVC: submit_pre_test()
    SVC-->>API: Pre-test score
    API->>DB: Save MCQ history (pre_test)
    API-->>FE: Pre-test results

    Note over U,FE: User studies the document

    U->>FE: Start Post-test
    FE->>API: POST /learning/post-test/{doc_id}
    API->>SVC: generate_post_test()
    SVC->>LLM: Generate post-test MCQs
    LLM-->>SVC: MCQs
    API-->>FE: Post-test questions

    U->>FE: Submit Post-test Answers
    FE->>API: POST /learning/post-test/submit/{doc_id}
    API->>SVC: submit_post_test()
    SVC-->>API: Learning gain calculated
    API->>DB: Save learning gain history
    API-->>FE: LearningGainResponse
```

---

## Database Model Relationships

```mermaid
erDiagram
    User ||--o{ SummaryHistory : "has"
    User ||--o{ DocumentSummaryHistory : "has"
    User ||--o{ MCQHistory : "has"
    User ||--o{ MCQSessionHistory : "has"
    User ||--o{ KeyPointsHistory : "has"
    User ||--o{ FlashcardHistory : "has"
    User ||--o{ LearningGainHistory : "has"
    User ||--o{ CodeAnalysisHistory : "has"

    User {
        int id PK
        string email
        string hashed_password
        string persona
        string learning_style
        string preferred_language
    }

    SummaryHistory {
        int id PK
        int user_id FK
        string original_text
        string summary_text
        datetime created_at
    }

    DocumentSummaryHistory {
        int id PK
        int user_id FK
        string document_id
        string title
        string summary_text
        string main_themes
        datetime created_at
    }

    MCQHistory {
        int id PK
        int user_id FK
        string document_id
        string test_type
        int score
        int total_questions
        datetime created_at
    }

    MCQSessionHistory {
        int id PK
        int user_id FK
        string document_id
        int total_questions
        int correct_answers
        float score_percentage
        string detailed_results
        datetime created_at
    }

    KeyPointsHistory {
        int id PK
        int user_id FK
        string document_id
        string key_points
        datetime created_at
    }

    FlashcardHistory {
        int id PK
        int user_id FK
        string document_id
        string flashcards
        datetime created_at
    }

    LearningGainHistory {
        int id PK
        int user_id FK
        string document_id
        float pre_test_score
        float post_test_score
        float learning_gain
        datetime created_at
    }

    CodeAnalysisHistory {
        int id PK
        int user_id FK
        string code
        string language
        string analysis_type
        string result
        datetime created_at
    }
```

---

## Technology Stack Summary

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Chrome Extension** | Vanilla JS, Manifest V3 |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | SQLite (via SQLAlchemy ORM) |
| **Auth** | JWT (python-jose), bcrypt |
| **LLM - Primary** | Groq API (Llama 3.1-8B-Instant) |
| **LLM - Alternate** | AWS Bedrock (Claude 3 Sonnet) |
| **File Processing** | PyPDF2, python-docx |
| **HTTP Client** | httpx (async), boto3 (AWS) |

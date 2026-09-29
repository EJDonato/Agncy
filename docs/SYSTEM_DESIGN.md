# SYSTEM DESIGN: Agncy

**Status:** Approved Architecture Draft  
**Project:** Agncy (Personal Content Agency Workspace)  
**Target:** Local-First Proof of Concept (macOS / Local Web)  
**Last Updated:** September 29, 2026  

---

## 1. Executive Architecture Overview

Agncy is architected as an offline-capable, local-first web application designed for a single creator. The system treats all intelligence (scripting, ideation, captioning) as consumers and contributors of a persistent **Brand Brain**.

### 1.1 High-Level Architecture

```mermaid
flowchart TD
    subgraph UI ["Client Layer (Next.js App Router / React UI)"]
        Dashboard["Dashboard & Stats View"]
        ScriptEditor["Script Editor & Diff Viewer"]
        IdeaBoard["Ideation & Trends Board"]
        CalendarView["Content Calendar"]
        MediaStudio["Subtitle & Video Studio"]
        BrandSettings["Brand Brain Settings & Style Rules"]
    end

    subgraph Server ["Local Application Server (Next.js / Node.js Runtime)"]
        API["Route Handlers & Server Actions"]
        CSVEngine["Meta CSV Import & Normalizer"]
        DiffEngine["Diff & Draft Survival Calculator"]
        StyleEngine["Style Learning Synthesizer"]
        ProcManager["Local Process Coordinator"]
    end

    subgraph Storage ["Local Storage Engine"]
        SQLite[("SQLite Database (WAL Mode)")]
        LocalFS["Local File System (/data/videos, /data/exports)"]
    end

    subgraph Workers ["Local Subprocesses & External APIs"]
        WhisperProc["Local Whisper Engine (whisper.cpp / mlx-whisper)"]
        FFmpegProc["FFmpeg Binary (Hardware Video Toolbox)"]
        LLMGateway["Google Gemini API (Gemini Pro / Flash)"]
        EmbedGateway["Local / API Embedding Model"]
    end

    UI --> API
    API --> CSVEngine
    API --> DiffEngine
    API --> StyleEngine
    API --> ProcManager
    API --> SQLite
    
    CSVEngine --> SQLite
    DiffEngine --> SQLite
    StyleEngine --> LLMGateway
    StyleEngine --> SQLite
    ProcManager --> WhisperProc
    ProcManager --> FFmpegProc
    ProcManager --> LocalFS
    
    API --> EmbedGateway
    EmbedGateway --> SQLite
```

### 1.2 Technology Stack

| Layer | Selected Tech | Rationale |
|---|---|---|
| **Frontend & Backend** | Next.js 15+ (App Router), React 19, Tailwind CSS, shadcn/ui | Unified full-stack local server; fast React Server Components; zero remote hosting requirements. |
| **Local Database** | SQLite 3 via `better-sqlite3` or Drizzle ORM | Zero-latency embedded database; single-file storage with WAL mode for fast concurrent reads/writes. |
| **Vector Search** | `sqlite-vec` or in-memory cosine distance over Float32 BLOBs | Embeddings of past scripts and high-performing posts without heavy external vector DB infrastructure. |
| **AI Inference** | Google Gemini (Gemini 2.5 Pro & Flash via `@google/genai`) | State-of-the-art reasoning, huge 2M token context, high-speed drafting, and generous developer quota. |
| **Transcription** | `whisper.cpp` or `mlx-whisper` (macOS Apple Silicon) | Zero cloud latency/cost; Metal hardware acceleration; offline privacy for raw videos. |
| **Media Processing** | FFmpeg with Apple `videotoolbox` acceleration | High-speed silence detection, aspect ratio cropping, and hardcoded ASS/SRT caption burning. |

---

## 2. Entity-Relationship Data Model (ERD)

The database schema manages the entire feedback loop: brand guidelines, posts, snapshots over time, script iterations, draft diffs, and style rules.

```mermaid
erDiagram
    BRAND_PROFILE ||--o{ STYLE_RULE : defines
    BRAND_PROFILE ||--o{ IDEA : seeds
    BRAND_PROFILE ||--o{ SCRIPT : contextualizes

    IDEA ||--o| SCRIPT : converts_to
    
    SCRIPT ||--o{ SCRIPT_VERSION : contains
    SCRIPT ||--o| SCRIPT_DIFF : evaluates
    SCRIPT ||--o| POST : links_to

    POST ||--o{ POST_METRIC_SNAPSHOT : records
    POST ||--o{ MEDIA_ASSET : references
    
    IMPORT_BATCH ||--o{ POST_METRIC_SNAPSHOT : groups

    BRAND_PROFILE {
        string id PK
        string creator_name
        string niche
        string target_audience
        string tone_of_voice
        string language_mix
        string dos_and_donts
        datetime updated_at
    }

    STYLE_RULE {
        string id PK
        string brand_id FK
        string category
        string rule_text
        string rationale
        string status
        float confidence_score
        datetime approved_at
        datetime created_at
    }

    IDEA {
        string id PK
        string brand_id FK
        string topic
        string angle_hook
        string why_suggested
        string status
        float predicted_fit_score
        datetime created_at
    }

    SCRIPT {
        string id PK
        string brand_id FK
        string idea_id FK
        string title
        string format
        string target_duration_sec
        string status
        datetime created_at
        datetime updated_at
    }

    SCRIPT_VERSION {
        string id PK
        string script_id FK
        int version_number
        string version_type
        text hook_text
        text body_text
        text cta_text
        text full_content
        datetime created_at
    }

    SCRIPT_DIFF {
        string id PK
        string script_id FK
        string draft_version_id FK
        string final_version_id FK
        float survival_percentage
        int draft_token_count
        int final_token_count
        int retained_tokens
        json token_lcs_map
        text edit_summary
        datetime analyzed_at
    }

    POST {
        string id PK
        string external_post_id UK
        string script_id FK
        string page_id
        string page_name
        string post_type
        text raw_title
        text normalized_title
        string permalink
        datetime published_at
        int duration_seconds
        datetime created_at
    }

    IMPORT_BATCH {
        string id PK
        string file_name
        string file_hash
        datetime export_date_start
        datetime export_date_end
        int rows_total
        int rows_imported
        int rows_updated
        datetime imported_at
    }

    POST_METRIC_SNAPSHOT {
        string id PK
        string post_id FK
        string batch_id FK
        int views
        int viewers
        int impressions
        int interactions
        int reactions
        int comments
        int shares
        int saves
        float avg_seconds_viewed
        int total_seconds_viewed
        string distribution_score
        float approximate_earnings_usd
        datetime captured_at
    }

    MEDIA_ASSET {
        string id PK
        string post_id FK
        string file_path
        string mime_type
        int file_size_bytes
        float duration_seconds
        text raw_transcript
        json word_timestamps
        string srt_path
        datetime processed_at
    }
```

### 2.1 Key Database Schemas & Field Definitions

```sql
-- Brand Profile: Singleton record storing active brand identity
CREATE TABLE brand_profiles (
    id TEXT PRIMARY KEY,
    creator_name TEXT NOT NULL,
    niche TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    tone_of_voice TEXT NOT NULL,
    language_mix TEXT NOT NULL DEFAULT 'Taglish (Filipino/English)',
    dos_and_donts TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Style Rules: Extracted from edits, approved by user
CREATE TABLE style_rules (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
    category TEXT CHECK(category IN ('hook', 'pacing', 'vocabulary', 'structure', 'tone')),
    rule_text TEXT NOT NULL,
    rationale TEXT,
    status TEXT CHECK(status IN ('proposed', 'active', 'rejected', 'archived')) DEFAULT 'proposed',
    confidence_score REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME
);

-- Scripts & Versions
CREATE TABLE scripts (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL REFERENCES brand_profiles(id),
    idea_id TEXT REFERENCES ideas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    format TEXT DEFAULT 'Reel',
    target_duration_sec INTEGER DEFAULT 45,
    status TEXT CHECK(status IN ('drafting', 'in_review', 'finalized', 'filmed', 'published')) DEFAULT 'drafting',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE script_versions (
    id TEXT PRIMARY KEY,
    script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_type TEXT CHECK(version_type IN ('ai_initial_draft', 'ai_revision', 'user_edit', 'final_version')),
    hook_text TEXT,
    body_text TEXT,
    cta_text TEXT,
    full_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quantitative survival metric between AI draft and final version
CREATE TABLE script_diffs (
    id TEXT PRIMARY KEY,
    script_id TEXT UNIQUE NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    draft_version_id TEXT NOT NULL REFERENCES script_versions(id),
    final_version_id TEXT NOT NULL REFERENCES script_versions(id),
    survival_percentage REAL NOT NULL,
    draft_token_count INTEGER NOT NULL,
    final_token_count INTEGER NOT NULL,
    retained_tokens INTEGER NOT NULL,
    token_lcs_map JSON, -- serialized array of [token, status: added|deleted|retained]
    edit_summary TEXT,  -- AI explanation of what user adjusted
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Posts & Lifetime Metric Snapshots
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    external_post_id TEXT UNIQUE NOT NULL, -- Meta Post ID
    script_id TEXT REFERENCES scripts(id) ON DELETE SET NULL,
    page_id TEXT NOT NULL,
    page_name TEXT NOT NULL,
    post_type TEXT CHECK(post_type IN ('Reel', 'Photo', 'Content', 'Video')),
    raw_title TEXT,
    normalized_title TEXT, -- Unicode bold stripped for indexing
    permalink TEXT,
    published_at DATETIME NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE import_batches (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_hash TEXT UNIQUE NOT NULL, -- SHA-256 to avoid importing exact same file twice
    export_date_start DATETIME,
    export_date_end DATETIME,
    rows_total INTEGER NOT NULL,
    rows_imported INTEGER NOT NULL,
    rows_updated INTEGER NOT NULL,
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_metric_snapshots (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    batch_id TEXT NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    viewers INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    interactions INTEGER DEFAULT 0,
    reactions INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    avg_seconds_viewed REAL DEFAULT 0.0,
    total_seconds_viewed INTEGER DEFAULT 0,
    distribution_score TEXT,
    approximate_earnings_usd REAL DEFAULT 0.0,
    captured_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Core User Journeys & End-to-End Workflows

### 3.1 Journey A: Meta CSV Ingestion & Intelligence Feeding

**Goal:** Turn static lifetime CSV exports into searchable, time-series performance data linked to scripts.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as User
    participant Web as Agncy UI
    participant Server as Import Controller
    participant Parser as CSV Normalizer
    participant DB as SQLite DB
    participant Matcher as Script Linker

    Creator->>Web: Drag & Drop Meta CSV Export
    Web->>Server: POST /api/analytics/import (FormData)
    Server->>Server: Compute SHA-256 File Hash
    Server->>DB: Check if Hash Exists in import_batches
    alt File Already Imported Exactly
        Server-->>Web: 409 Conflict: "File already imported on [timestamp]"
    else New File
        Server->>Parser: Parse Stream (utf-8-sig / strip BOM)
        loop Each CSV Row
            Parser->>Parser: Normalize Unicode Bold to ASCII
            Parser->>Parser: Parse Date (MM/DD/YYYY HH:MM)
            Parser->>Parser: Clean Distribution (+4x, -0.7x -> Float)
            Parser->>DB: Upsert Post (by external_post_id)
            Parser->>DB: Insert post_metric_snapshots record
        end
        Server->>Matcher: Trigger Suggested Script Matching
        Matcher->>DB: Fuzzy Match Post Title vs. Script Hooks/Titles
        Matcher-->>Server: Proposed Matches with Confidence Scores
        Server-->>Web: Import Summary: {inserted: X, updated: Y, suggestions: Z}
        Creator->>Web: Review & Confirm Script Linkage
        Web->>DB: Update posts.script_id
    end
```

---

### 3.2 Journey B: AI Script Generation $\rightarrow$ Edit $\rightarrow$ Style Learning Loop

**Goal:** The user writes a script with AI. As the user edits the draft, Agncy measures draft survival and refines the style model.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as User
    participant Editor as Script Editor UI
    participant Agent as Script Agent
    participant DB as SQLite DB
    participant Diff as LCS Diff Engine
    participant Learner as Style Extraction Engine

    Creator->>Editor: Select Idea or Enter Topic
    Editor->>Agent: Generate Script (topic, length=45s, format=Reel)
    Agent->>DB: Query Brand Profile + Active Style Rules + Top 3 Script Pairs
    Agent->>Agent: Construct System Prompt with Dynamic Few-Shots
    Agent-->>Editor: Stream AI Draft (Hook, Body, CTA)
    Editor->>DB: Save SCRIPT_VERSION (type: ai_initial_draft)

    Creator->>Editor: Edit script (deletes fluff, adds Taglish punchline, fixes hook)
    Creator->>Editor: Click "Save Final Version"
    Editor->>DB: Save SCRIPT_VERSION (type: final_version)

    Editor->>Diff: Calculate Diff (draft vs final)
    Diff->>Diff: Tokenize texts (Taglish aware)
    Diff->>Diff: Compute Longest Common Subsequence (LCS)
    Diff->>Diff: Calculate Survival % = (Retained Tokens / Initial Draft Tokens)
    Diff->>DB: Store SCRIPT_DIFF record
    Diff-->>Editor: Display: "74% AI Draft Survived"

    opt Trigger Style Synthesis (every 5 scripts or manual click)
        Editor->>Learner: Synthesize Edit Patterns
        Learner->>DB: Fetch last N Script Diffs & Pair Edits
        Learner->>Agent: Analyze Recurring Edits (Prompt LLM with diffs)
        Agent-->>Learner: Proposed Style Rules (e.g. "Keep hook under 7 words", "Avoid academic terms")
        Learner->>DB: Insert style_rules (status: 'proposed')
        Learner-->>Editor: Notify User: "3 new style rules learned from your edits"
        Creator->>Editor: Review, Edit, & Click "Approve Rule"
        Editor->>DB: Update style_rules (status: 'active')
    end
```

---

### 3.3 Journey C: Local Auto-Captioning & Video Export

**Goal:** Transcribe local short-form video in mixed Taglish/English with zero cloud latency and burn styled captions.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as User
    participant Studio as Caption Studio UI
    participant Backend as Node Process Controller
    participant Whisper as Local Whisper (mlx-whisper/whisper.cpp)
    participant FFmpeg as FFmpeg Binary
    participant FS as Local Storage (/data/videos)

    Creator->>Studio: Select Raw .mp4 Video
    Studio->>Backend: Upload/Reference Local File Path
    Backend->>FFmpeg: Extract 16kHz Mono WAV Audio
    FFmpeg-->>FS: Temp Audio File
    
    Backend->>Whisper: Run Transcription with Taglish Initial Prompt
    Note over Whisper: whisper --model medium --language en/tl --initial_prompt "conversational Taglish"
    Whisper-->>Backend: Word-level Timestamps (JSON)
    Backend-->>Studio: Send Transcript & Timestamps
    
    Creator->>Studio: Review captions, correct typos, select Style (e.g., Bold Yellow, 1-word bounce)
    Creator->>Studio: Click "Export Burned Video"
    
    Studio->>Backend: Request Render (subtitles config, font, margins)
    Backend->>Backend: Generate ASS Subtitle File (Advanced SubStation Alpha)
    Backend->>FFmpeg: Render Video with Subtitles Filter
    Note over FFmpeg: ffmpeg -i input.mp4 -vf "ass=subtitles.ass" -c:v h264_videotoolbox -c:a aac output.mp4
    FFmpeg-->>Backend: Render Progress (via stderr parsing: 25%..50%..100%)
    Backend-->>Studio: Real-time Render Progress via SSE
    FFmpeg-->>FS: Write Final Video
    Backend-->>Studio: Ready! Output path & preview
```

---

## 4. Technical Engine Specifications

### 4.1 Meta CSV Parsing & Unicode Normalization Pipeline

The Meta Business Suite CSV export presents specific edge-case challenges handled by the normalization engine:

```mermaid
flowchart LR
    Input["Raw CSV Stream"] --> BOM["Strip UTF-8 BOM (0xEF, 0xBB, 0xBF)"]
    BOM --> HeaderValidation["Header Validation & Schema Mapping"]
    HeaderValidation --> RowParser["Row Parser & Type Coercer"]
    
    subgraph Sanitization ["Per-Row Sanitization"]
        RowParser --> Normalizer["Unicode Bold to ASCII Normalizer"]
        RowParser --> DateParser["Date Coercer ('MM/DD/YYYY HH:MM')"]
        RowParser --> DistParser["Distribution Float Extractor ('+4x' -> 4.0)"]
        RowParser --> NullHandler["Retention Fallback (Null -> 0.0)"]
    end

    Sanitization --> BatchTx["Transactional SQLite Upsert (WAL Mode)"]
```

#### Unicode Bold Normalization Table
Creators frequently use stylized Unicode characters in captions (e.g. mathematical bold / sans-serif: `𝐁𝐮𝐢𝐥𝐝𝐢𝐧𝐠 𝐢𝐧 𝐏𝐮𝐛𝐥𝐢𝐜`). These break SQL `LIKE` queries and full-text search:

```typescript
export function normalizeUnicodeText(text: string): string {
  if (!text) return "";
  // Map mathematical bold & alphanumeric symbols to standard Unicode range
  return text
    .normalize("NFKD")
    .replace(/[\u{1D400}-\u{1D7FF}]/gu, (char) => {
      const codePoint = char.codePointAt(0);
      if (!codePoint) return char;
      // Bold capital A-Z (1D400 - 1D419 -> 0041 - 005A)
      if (codePoint >= 0x1d400 && codePoint <= 0x1d419) {
        return String.fromCodePoint(codePoint - 0x1d400 + 0x41);
      }
      // Bold lower a-z (1D41A - 1D433 -> 0061 - 007A)
      if (codePoint >= 0x1d41a && codePoint <= 0x1d433) {
        return String.fromCodePoint(codePoint - 0x1d41a + 0x61);
      }
      // Bold digits 0-9 (1D7CE - 1D7D7 -> 0030 - 0039)
      if (codePoint >= 0x1d7ce && codePoint <= 0x1d7d7) {
        return String.fromCodePoint(codePoint - 0x1d7ce + 0x30);
      }
      return char;
    })
    .trim();
}
```

---

### 4.2 Script Diffing & Quantitative Survival Metric

Rather than naive character Levenshtein distance (which punishes reordered paragraphs or formatting changes disproportionately), Agncy uses a **Token-level Longest Common Subsequence (LCS)** metric:

$$\text{Draft Survival Rate} = \frac{|\text{Tokens}(\text{AI Draft}) \cap \text{Tokens}(\text{Final Script})|_{\text{LCS}}}{|\text{Tokens}(\text{AI Draft})|} \times 100$$

```mermaid
flowchart TD
    Draft["AI Draft Content"] --> TokenizerA["Taglish Tokenizer (Words, Punctuation, Idioms)"]
    Final["Final User Script"] --> TokenizerB["Taglish Tokenizer (Words, Punctuation, Idioms)"]
    TokenizerA --> Matrix["Dynamic Programming LCS Matrix"]
    TokenizerB --> Matrix
    Matrix --> Alignment["Token Alignment & State Attribution: {RETAINED, INSERTED, DELETED}"]
    Alignment --> SurvivalCalc["Compute Metric: (Retained Tokens / Initial Tokens)"]
    Alignment --> DiffMap["Generate Visual Diff Map for UI Editor"]
```

---

### 4.3 Style Rule Learning Engine & Human-in-the-Loop Safeguards

To prevent AI prompt drift, style rules follow a strict state machine:

```mermaid
stateDiagram-v2
    [*] --> Proposed: Analyzed from >= 5 Script Diffs
    Proposed --> Active: User Reviews & Approves
    Proposed --> Rejected: User Discards
    Active --> Edited: User Modifies Rule Text
    Edited --> Active: Saved
    Active --> Archived: Deprecated or Superseded
    Rejected --> [*]
    Archived --> [*]
```

**Prompt Injection Safeguard:** Only rules with status `active` are injected into the agent system prompt.
The system prompt builder structures context cleanly:
```markdown
# BRAND PROFILE
[Identity, Tone, Language: Taglish]

# VERIFIED STYLE RULES (Approved by Creator)
- Hook: Start directly with a counter-intuitive observation; no greetings.
- Vocabulary: Use conversational Taglish; never use "lahat tayo" or "sa makatuwid".
- Pacing: Target 130-150 words per minute.

# FEW-SHOT EXAMPLES (Top 3 Performing Recent Scripts)
[Example 1: Draft -> Final -> High Retention Result]
[Example 2: ...]
```

---

## 5. Technical Edge Cases & Failure Modes

| Edge Case / Failure | Root Cause | System Mitigation Strategy |
|---|---|---|
| **Meta CSV BOM & Encoding mismatch** | Windows vs. Mac exports prefixing `\uFEFF` | Read stream using `utf-8-sig` decoding buffer. Strip BOM before header validation. |
| **Non-Reel rows missing retention data** | Meta only exports `Average Seconds viewed` and `Seconds viewed` for Reels | Table column handles `NULL` gracefully; calculations for average watch time filter by `post_type = 'Reel'`. |
| **Negative / Symbol distribution values** | Distribution column outputs `-0.7x`, `--`, or empty strings | Custom regex parser: `(--) -> null`, `([+-]?\d*\.?\d+)x -> float`. |
| **Importing cumulative lifetime stats repeatedly** | Meta CSV does not give daily breakdown; each export is lifetime-to-date | Every import generates an `import_batch`. Views and engagement are stored in `post_metric_snapshots`. UI calculates $\Delta$ views between successive snapshots for velocity. |
| **Whisper Taglish Hallucination Loops** | Silent audio segments cause Whisper to repeat phrases or hallucinate subtitle loops | Pass `--no_speech_threshold 0.6` and feed a custom `initial_prompt` containing common Taglish fillers (`"Script: O, kumusta? Ito ang dahilan bakit..."`). |
| **FFmpeg Out-of-Memory / Encoding Crash** | Long 4K video exports consuming high RAM | Enforce proxy rendering / preview generation at 1080p; use Apple Silicon hardware encoder (`h264_videotoolbox` / `hevc_videotoolbox`) with streaming pipes. |
| **Complete Script Rewrite (Survival = 0%)** | User completely discards AI draft and writes from scratch | Handled cleanly: logged as 0% survival. Diff engine tags all draft tokens as `DELETED`. Style engine analyzes whether the topic or tone triggered the complete rewrite. |

---

## 6. Component Directory & File Structure

```
agncy/
├── app/                              # Next.js App Router
│   ├── (workspace)/                  # Main Application Shell
│   │   ├── page.tsx                  # Dashboard & Metric Velocity
│   │   ├── brand/                    # Brand Brain Profile & Style Rules
│   │   ├── scripts/                  # Script Editor, Versioning & Diffs
│   │   ├── ideas/                    # Content Ideation & Trend Matcher
│   │   ├── calendar/                 # Planning Calendar
│   │   ├── studio/                   # Subtitle Studio & Video Exporter
│   │   └── analytics/                # CSV Import & Performance Tables
│   ├── api/                          # Server Endpoints & Background Hooks
│   │   ├── analytics/import/route.ts # CSV Stream Processor
│   │   ├── scripts/diff/route.ts     # LCS Survival Calculator
│   │   ├── studio/transcribe/route.ts# Local Whisper Runner
│   │   └── studio/render/route.ts    # FFmpeg Subtitle Burner
│   └── layout.tsx
├── lib/
│   ├── db/                           # SQLite Schema & Drizzle Client
│   │   ├── schema.ts                 # Full Drizzle / SQLite Tables
│   │   ├── migrations/               # Local SQLite Migrations
│   │   └── index.ts
│   ├── ai/                           # LLM Prompt Construction & Ingestion
│   │   ├── agent.ts                  # Google Gemini API Gateway (@google/genai)
│   │   ├── prompt-builder.ts         # Brand Brain & Style Injection
│   │   └── style-synthesizer.ts      # Edit Analysis & Rule Extraction
│   ├── analytics/
│   │   ├── csv-parser.ts             # BOM & Header Mapping
│   │   └── normalizer.ts             # Unicode Math Bold Stripper
│   ├── diff/
│   │   ├── lcs.ts                    # Token Longest Common Subsequence
│   │   └── tokenizer.ts              # Taglish Word Tokenizer
│   └── media/
│       ├── whisper.ts                # Local Whisper Process Spawn
│       ├── ffmpeg.ts                 # Subtitle Rendering & Trimming
│       └── ass-generator.ts          # Advanced SubStation Alpha Styles
├── data/                             # Local Data Storage (Ignored in Git)
│   ├── agncy.db                      # Primary SQLite Database File
│   ├── uploads/                      # Raw Video Uploads
│   └── exports/                      # Rendered Videos with Burned Captions
├── PRD.md                            # Product Requirements Document
├── SYSTEM_DESIGN.md                  # This System Design Document
└── package.json
```

---

## 7. Phased Implementation Roadmap

* **Phase 1a: Core Data Foundation & Analytics**
  * Scaffold Next.js + SQLite (`better-sqlite3` + Drizzle).
  * Build CSV Importer with BOM stripper and Unicode bold normalization.
  * Implement snapshot storage and post-to-script linking.
* **Phase 1b: Script Studio & Survival Metric**
  * Script editor with AI generation (Brand Brain prompt injection).
  * Multi-version script saving (`ai_initial_draft` vs `final_version`).
  * Token-based LCS diff engine with draft survival score display.
  * Style rule synthesizer and approval UI.
* **Phase 2: Content Ideation Engine**
  * Idea generation filtered against top-performing past posts and brand guidelines.
  * "Convert Idea to Script" 1-click bridge.
* **Phase 3: Local Auto-Caption Studio**
  * Local Whisper integration with Taglish initial prompt.
  * Interactive subtitle timing editor.
  * FFmpeg ASS subtitle burner with hardware acceleration.
* **Phase 4: Planning Calendar & Post Logging**
  * Visual content calendar for scheduled drops and manual result tracking.
* **Phase 5: Lightweight Video Trimmer**
  * Silence removal and basic 9:16 aspect ratio framing.

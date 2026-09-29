# AGENTS.md: Coding Standards & Engineering Directives

**Target Audience:** AI Coding Agents & Pair-Programming Assistants (Antigravity, Cursor, Claude Code)  
**Project:** Agncy (Personal Content Agency Workspace)  
**Stack:** Next.js 15+ (App Router), TypeScript (Strict), SQLite (WAL Mode via Drizzle / `better-sqlite3`), Tailwind CSS, Google Gemini SDK (`@google/genai`), FFmpeg, `mlx-whisper` / `whisper.cpp`.  
**Last Updated:** September 29, 2026  

---

## 1. Prime Directives for the Coding Agent

As the autonomous coding agent on this codebase, you must adhere to the highest standards of software craft. Agncy is a local-first, precision studio application. You are expected to write code that is clean, modular, resilient, and adheres strictly to the architectural specifications.

### The Non-Negotiable Core Rules:
1. **Strict File Size Limits (Max 250–300 LOC):** Never write monster files. Any file exceeding 250 lines must be split into dedicated subcomponents, custom hooks, or helper utilities.
2. **DRY (Don't Repeat Yourself):** Never duplicate utility functions, data transformations, or query logic. Centralize shared behaviors in `/lib`.
3. **Single Responsibility Principle (SRP):** Components only render and capture events. Business logic lives in domain services. Database operations live in the database layer.
4. **Strict TypeScript (Zero `any`):** Never use `any`. Always use explicit interfaces, discriminated unions, and validate all untrusted inputs with **Zod**.
5. **Fail Gracefully & Defensively:** Local processes (FFmpeg, Whisper) and external AI APIs can fail or hang. Always implement timeouts, error boundaries, and user-facing fallbacks.

---

## 2. Code Organization & Modularity Standards

### 2.1 File Length & Decomposition Protocol
* **Hard Ceiling:** **300 Lines of Code (LOC)** per file.
* **Soft Target:** **100–180 LOC** per file.
* If a React component approaches 200 lines:
  * Extract presentational subcomponents into a `_components/` folder co-located with the route.
  * Extract complex state transitions, effects, and calculations into a custom hook in `hooks/`.
  * Extract data formatting and pure functions into a `utils.ts` or `/lib`.

### 2.2 Directory Structure Boundaries
```
agncy/
├── app/                  # Next.js App Router (Routing, Layouts, Server Pages)
│   ├── (workspace)/      # App Shell with persistent sidebar
│   │   ├── scripts/      # Route entrypoints ONLY (keep page.tsx slim!)
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Max 80 lines: loads data, passes to client view
│   │   │   │   ├── _components/      # SplitEditor, DiffViewer, MetricFooter
│   │   │   │   └── _hooks/           # useScriptEditor, useDiffCalculator
├── lib/                  # Pure logic & domain services (NO JSX!)
│   ├── db/               # SQLite connection, Drizzle schema, migrations, queries
│   ├── ai/               # Gemini API client, system prompts, output schemas
│   ├── analytics/        # CSV parser, BOM stripper, Unicode bold normalizer
│   ├── diff/             # Tokenizer, Longest Common Subsequence (LCS) engine
│   └── media/            # Subprocess runners (FFmpeg, Whisper, ASS generator)
├── components/ui/        # Reusable primitive UI widgets (buttons, modals, badges)
└── types/                # Global TypeScript definitions & Zod schemas
```

---

## 3. TypeScript & Type Safety Discipline

* **Strict Mode:** TypeScript `strict: true` is strictly enforced.
* **No `any` Ever:** Use `unknown` with type narrowers, generics, or Zod schemas.
* **Zod for External Boundaries:**
  * Every Meta CSV row must be validated and parsed using a Zod schema.
  * Every structured JSON response from Google Gemini must be validated with Zod before being saved to SQLite.
  * Server Actions must parse their incoming arguments with Zod.

```typescript
// Example: Validating Gemini JSON responses
import { z } from "zod";

export const ScriptDraftSchema = z.object({
  title: z.string().min(1),
  estimated_duration_sec: z.number().int().positive(),
  total_word_count: z.number().int().positive(),
  hook: z.object({
    visual_cue: z.string(),
    spoken_text: z.string(),
    duration_est_sec: z.number(),
  }),
  body_beats: z.array(
    z.object({
      beat_number: z.number(),
      visual_cue: z.string(),
      spoken_text: z.string(),
      pacing: z.enum(["rapid", "deliberate", "punchy"]),
    })
  ),
  cta: z.object({
    visual_cue: z.string(),
    spoken_text: z.string(),
  }),
});

export type ScriptDraft = z.infer<typeof ScriptDraftSchema>;
```

---

## 4. Local Database & SQLite Conventions

1. **WAL Mode Enabled:**
   * Always initialize the SQLite database with Write-Ahead Logging:
     ```typescript
     db.run("PRAGMA journal_mode = WAL;");
     db.run("PRAGMA synchronous = NORMAL;");
     db.run("PRAGMA busy_timeout = 5000;");
     ```
2. **Zero Raw SQL Concatenation:**
   * Never concatenate variables into SQL strings. Always use Drizzle ORM query builders or parameterized placeholders (`?`).
3. **Atomic Transactions:**
   * Whenever updating multiple related tables (e.g. saving a new script version AND computing/saving its diff), wrap the operations in a transaction:
     ```typescript
     await db.transaction(async (tx) => {
       await tx.insert(scriptVersions).values(newVersion);
       await tx.insert(scriptDiffs).values(computedDiff);
     });
     ```
4. **Data Normalization:**
   * Clean captions upon ingestion (strip mathematical bold fonts and UTF-8 BOM) before storing in the database. Never push raw, unsearchable text into primary query fields.

---

## 5. Local Subprocess Safety (FFmpeg & Whisper)

1. **Never Block Node's Event Loop:**
   * Never use `execSync` for video rendering or Whisper transcription.
   * Always use `child_process.spawn` or Node's `Worker Threads`.
2. **Prevent Zombie & Orphaned Processes:**
   * Maintain an active child process registry in `lib/media/process-manager.ts`.
   * Register `process.on('SIGINT')`, `process.on('SIGTERM')`, and `process.on('exit')` cleanup handlers to kill running FFmpeg or Whisper processes when the Next.js server restarts.
3. **Stream Progress via SSE / Server Actions:**
   * Parse `stderr` output from FFmpeg (e.g. `time=00:00:15.20`) to calculate render percentage and stream real-time progress to the UI.
4. **Hardware Acceleration:**
   * Always prefer Apple Silicon hardware acceleration (`-c:v h264_videotoolbox`) on macOS rather than software `libx264`.

---

## 6. React & Next.js App Router Conventions

1. **Server Components First (`RSC`):**
   * Default every component to a Server Component.
   * Only add `'use client'` when state (`useState`, `useReducer`), effects, browser event listeners, or interactive UI elements (e.g. text editors, drag-and-drop zones) are required.
2. **Skinny Server Pages:**
   * Route `page.tsx` files should rarely exceed 80 lines. Their role is solely to authenticate/validate params, fetch data, and pass props to the view.
3. **Design System Adherence:**
   * Follow the color and typography tokens defined in [BRAND.md](file:///Users/eltonjames/Desktop/Personal%20Apps/Agncy/BRAND.md).
   * Background: Deep obsidian (`bg-[#090A0F]`), cards: raised surface (`bg-[#14171F]`), borders: subtle border (`border-[#262B36]`), accent: amber (`text-[#F59E0B]`), success: emerald (`text-[#10B981]`).
   * Scripts and diffs must always use monospaced fonts (`font-mono` / Geist Mono / JetBrains Mono).
4. **Optimistic Updates:**
   * For frequent user actions (approving style rules, editing script lines, toggling calendar dates), update the local UI state optimistically before waiting for the roundtrip.

---

## 7. AI & Google Gemini Integration Rules

1. **SDK Standard:**
   * Always use `@google/genai` (the official unified Google Gen AI SDK).
2. **Model Division:**
   * Use **Gemini Flash** (`gemini-1.5-flash` or `gemini-2.5-flash`) for rapid sub-second tasks: diff analysis, fuzzy CSV post matching, transcript optimization, and search-grounded trend detection.
   * Use **Gemini Pro** (`gemini-1.5-pro` or `gemini-2.5-pro`) for high-reasoning tasks: script drafting with few-shot context and weekly style rule synthesis.
3. **Dynamic Few-Shot Budgeting:**
   * Never inject unlimited past scripts into prompts. Limit few-shots to the top 2–3 most relevant pairs to protect prompt clarity and reduce token latency.
4. **Structured JSON Mode:**
   * Always configure `responseMimeType: "application/json"` and pass `responseSchema` for any agent task that returns structured data.

---

## 8. Agent Pre-Commit & Verification Checklist

Before reporting any feature or task as complete, verify:
- [ ] **LOC Check:** Are all new and modified files under the 300 LOC ceiling?
- [ ] **Modularity:** Has repeated logic been extracted to `/lib`?
- [ ] **Type Check:** Does `tsc --noEmit` run with 0 errors?
- [ ] **Lint & Build:** Does the Next.js build compile cleanly?
- [ ] **Design Match:** Are styling, colors, and typography aligned with [BRAND.md](file:///Users/eltonjames/Desktop/Personal%20Apps/Agncy/BRAND.md)?
- [ ] **Error Handling:** Are there user-facing error states for missing files, corrupt CSV rows, or Gemini API errors?

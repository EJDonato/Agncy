# PRD: Agncy

**Status:** Living implementation PRD v1.1

**Owner:** Sole creator / operator
**Last updated:** October 4, 2026

---

## 1. Product Direction

**Agncy** is a local-first personal content agency workspace for one creator. It organizes the work of a small in-house agency around seven roles: Creative Director, Brand Strategist, Script Writer, Content Strategist, Video Editor, Performance Analyst, and Content Planner.

The product's core bet is now simpler and clearer than the original proof of concept: write directly with a Script Writer that uses the creator's latest finalized scripts as style references, accepts natural-language revision prompts, and improves its future drafts from the creator's finished work. The creator sees one working script at a time—not parallel AI and edited views or a draft-survival comparison.

The app remains single-user, single-brand, and local-first. SQLite holds persistent working data; Gemini is used only for the AI writing operations.

### What changed from the initial PRD

- **Removed from the active script experience:** draft-survival percentages, side-by-side AI-versus-user comparison, and a visible diff workflow.
- **Adopted:** up to three recent finalized scripts are used as few-shot writing references for the next draft.
- **Adopted:** each script has a prompt-to-revise interaction. Revisions are saved as versions, but there is not yet a separate persistent chat/session transcript per script.
- **Adopted:** the workspace is presented as a role-based agency cockpit with persona art and short in-context role responses.
- **Changed:** Analytics is a visual, searchable post library with compact Facebook previews rather than a dense table.
- **Clarified:** Ideation, media processing, and calendar scheduling are still early surfaces; they are not yet autonomous research, caption-rendering, or date-based scheduling systems.

---

## 2. Problem Statement

Running a personal content brand means continually switching between ideation, writing, editing, publishing planning, and performance review—while repeating the same voice, audience, and past-performance context. Generic AI can create a first pass, but it does not naturally learn the creator's pacing, wording, structure, or final editorial choices.

Agncy should make the next script start closer to the creator's real writing style, let the creator revise it in plain language, and keep post performance visible beside the content it came from.

---

## 3. Goals

1. **Reduce rewriting over time.** New drafts should increasingly resemble the structure, wording, and rhythm of recently finalized scripts.
2. **Keep the writing loop direct.** A creator should be able to create, prompt-revise, edit, and save one script in one focused surface.
3. **Make imported post data useful.** Posts, performance snapshots, embeds, and linked source scripts should be easy to review together.
4. **Make the workspace pleasant to revisit weekly.** The role-based interface should make each tool's purpose immediately clear without adding operational clutter.
5. **Validate cheaply.** Keep the app local, single-user, and manual-upload first before considering social APIs, accounts, or multi-brand support.

---

## 4. Non-Goals (Current v1)

| Non-goal | Reason |
|---|---|
| Direct publishing or social scheduling APIs | Content is uploaded manually; platform integrations are not needed to validate the writing loop. |
| Accounts, billing, teams, or multi-brand support | The product is a personal workspace for one creator. |
| Persistent AI chat transcripts per script | Versions and revisions are saved, but a separate conversational memory layer is not yet needed. |
| Automatic fine-tuning of a custom model | Style adaptation uses recent finalized scripts and reviewable style rules. |
| Autonomous trend/competitor research | The current Idea Hub is a manual and curated seed backlog. |
| Full video timeline editing | Media is currently a configuration surface, not a timeline editor. |
| Mobile app | The product is a responsive local web app. |

---

## 5. Target User

One creator operating one personal brand, primarily making short-form Filipino/English content about civic technology, grassroots community work, and public-interest technology. The exact niche, audience, and language mix remain editable in Brand Strategist.

---

## 6. Current Product Surface

| Role / route | Current capability | Status |
|---|---|---|
| Creative Director (`/`) | Dashboard with writing-reference, performance, rules, and post summaries plus a quick route into script creation | Shipped |
| Brand Strategist (`/brand`) | Persistent creator profile and manually managed, reviewable style rules | Shipped |
| Script Writer (`/scripts`, `/scripts/[id]`) | Gemini draft creation, one editable script, direct revision prompts, version history, finalization, and three recent finalized scripts as style examples | Shipped |
| Content Strategist (`/ideas`) | Curated and manually saved topic seeds that can open the Script Writer with a topic | Shipped, intentionally lightweight |
| Video Editor (`/studio`) | Local file selection and caption-style configuration interface | UI shell only |
| Performance Analyst (`/analytics`) | Meta CSV import, deduplication, snapshots, searchable visual post library, Facebook previews, and manual script linking | Shipped |
| Content Planner (`/calendar`) | Filming queue, script status summary, and recent published-post timeline | Shipped as a queue, not a date calendar |

### Shared interface direction

- The sidebar uses role names rather than generic module names.
- Each desktop role has a persona illustration in the sidebar. Persona speech bubbles are dismissible and may surface short contextual replies.
- Route changes use loading feedback and prefetching; Analytics post loading is optimized to avoid per-post database query loops.
- The interface must remain usable when persona bubbles are dismissed and must not hide primary controls.

---

## 7. Functional Requirements

### 7.1 Brand Strategist / Brand Brain

| ID | Requirement | Status |
|---|---|---|
| B1 | Create and edit creator identity, niche, audience, tone, language mix, and writing guardrails | Shipped |
| B2 | Store posts, scripts, versions, rules, ideas, and analytics snapshots in local SQLite | Shipped |
| B3 | Create, edit, approve, or reject reviewable style rules | Shipped |
| B4 | Inject active profile and style rules into script generation and revision prompts | Shipped |
| B5 | Automatically synthesize new proposed style rules from saved scripts | Planned |
| B6 | Import historical scripts from pasted text or files | Planned |
| B7 | Embedding/vector retrieval for relevant scripts or posts | Future |

**Important behavior:** Active style rules are used immediately. Automatic style-rule synthesis is not implemented yet; the current learning loop is the three most recently finalized scripts supplied as examples during generation.

### 7.2 Script Writer

| ID | Requirement | Status |
|---|---|---|
| S1 | Generate a short-form script from a topic, profile, active rules, and up to three recent finalized scripts | Shipped |
| S2 | Persist an initial AI draft and render it in one editable, readable script surface | Shipped |
| S3 | Prompt-revise the current script in natural language without collapsing its hook/body/visual-cue/CTA structure | Shipped |
| S4 | Save revisions as versions and save a finalized version | Shipped |
| S5 | Use finalized scripts as future style examples, emphasizing structure, rhythm, transitions, vocabulary, and language mix | Shipped |
| S6 | Support Reel, Short, and TikTok format choices with duration targets | Shipped |
| S7 | Generate or revise one named section independently | Planned |
| S8 | Keep a separate, persistent conversational session/transcript for each script | Future |
| S9 | Link a finalized script to a published post | Shipped manually through Analytics |

**Acceptance criteria:**

- Given a saved Brand Strategist profile and at least one finalized script, a new draft uses the current profile, active rules, and up to three recent final scripts as writing references.
- Given a revision prompt, the returned script remains structured with a hook, body beats, visual cues, pacing, and CTA rather than becoming one paragraph.
- Given a saved final script, it becomes eligible as a writing reference for later drafts.

**Model policy:** Initial drafting tries Gemini 3.1 Pro Preview first, with configured Flash fallbacks. Revision prioritizes Gemini 3.5 Flash and falls back across configured Flash models. Revision calls use a 90-second timeout and return a user-facing busy/error state.

### 7.3 Content Strategist / Idea Hub

| ID | Requirement | Status |
|---|---|---|
| I1 | Capture a topic seed and hook angle manually | Shipped |
| I2 | Maintain a small curated starter set of relevant ideas | Shipped |
| I3 | Send a saved or curated idea to Script Writer in one click | Shipped |
| I4 | Agent research using web search, trend signals, competitors, and performance ranking | Planned |
| I5 | Save, use, dismiss, and rank ideas based on fit and past performance | Partial / planned |

### 7.4 Video Editor / Captions & Media

| ID | Requirement | Status |
|---|---|---|
| C1 | Select a local `.mp4` or `.mov` file | Shipped UI |
| C2 | Pick a caption style preset | Shipped UI |
| C3 | Run Whisper transcription locally | Planned |
| C4 | Edit a timestamped transcript | Planned |
| C5 | Burn edited captions into a video with FFmpeg / VideoToolbox | Planned |
| C6 | Export `.srt` subtitles | Planned |
| V1 | Trim, silence removal, or aspect-ratio crop | Future |

The app must not represent media processing as complete until transcription and rendering are wired to the local process layer with progress and failure handling.

### 7.5 Content Planner

| ID | Requirement | Status |
|---|---|---|
| K1 | Show finalized scripts ready to film | Shipped |
| K2 | Show active drafting work and recent published posts | Shipped |
| K3 | Place scripts or ideas on dates in a calendar grid | Planned |
| K4 | Mark an item as posted and manually log results | Planned |
| K5 | Suggest times or send reminders | Future |

### 7.6 Performance Analyst / Meta CSV

The importer is designed for Meta Business Suite lifetime-summary exports. Post ID is the durable external key. An identical file hash is skipped; a newer export updates its post record and adds a new lifetime snapshot.

| ID | Requirement | Status |
|---|---|---|
| A1 | Drag-and-drop or select a Meta CSV | Shipped |
| A2 | Deduplicate exact files by hash and posts by Meta Post ID | Shipped |
| A3 | Store a snapshot for every non-duplicate import | Shipped |
| A4 | Strip UTF-8 BOM and normalize mathematical Unicode bold for searchable text | Shipped |
| A5 | Gracefully handle missing Reel-only retention data | Shipped |
| A6 | Search, filter, and sort a compact visual post library | Shipped |
| A7 | Render a lazy Facebook plugin preview from a public permalink, with an original-post fallback | Shipped |
| A8 | Manually link a post to its source script and show snapshot history | Shipped |
| A9 | Suggest links by publish date or content matching | Planned |
| A10 | Header mapping and explicit warning for future Meta export changes | Partial / planned |

**Known data constraints:** Current exports contain lifetime-to-date values, not daily observations. Retention fields are populated for Reels and can be empty for Photo or Content posts. Public Facebook content may refuse or fail to embed when private, removed, or restricted.

---

## 8. Technical and Data Constraints

- Single user, single brand, local SQLite database in WAL mode.
- Next.js App Router with TypeScript, strict validation at server and Gemini boundaries, and `@google/genai` for Gemini access.
- No social posting connection and no live social analytics sync in current scope.
- Gemini operations require an API key and internet access. Local media processing will require installed Whisper/FFmpeg once implemented.
- Gemini outputs for scripts are requested as structured JSON and validated before being persisted.
- Recent finalized-script examples are capped at three to protect prompt clarity and latency.
- Existing persona illustrations are stored in `public/assets` using lowercase kebab-case filenames.

---

## 9. Success Metrics

The original visible “draft survival” metric is no longer a product metric. Measure the outcome directly instead.

| Metric | How to measure | Proposed signal |
|---|---|---|
| Draft usefulness | Creator's subjective rating after generation or number of revision prompts before finalization | Fewer prompts and less manual rewriting over time |
| Style reference usefulness | Compare structure and wording of new drafts with the creator's saved final scripts | Drafts increasingly feel recognizably creator-authored |
| Script completion | Scripts finalized per week | At least one useful finalized script in regular use weeks |
| Analytics import reliability | Valid rows imported with no duplicate posts | 100% for known valid exports |
| Script-to-post connection | Percentage of published posts manually linked to a script | Increasing over time; target 80% once workflow is habitual |
| Weekly use | Weeks with a script, idea, import, or planner action | At least 6 of 8 validation weeks |

Media-processing speed, caption-edit effort, idea acceptance, and posting-time recommendations become measurable only after those respective features are implemented.

---

## 10. Delivery Roadmap

| Stage | Scope | Current state |
|---|---|---|
| 1 | Brand profile, style rules, local scripts, and CSV import | Shipped |
| 2 | Prompt-driven Script Writer with recent-finalized-script learning | Shipped |
| 3 | Visual post library, embeds, manual post-to-script linking, snapshot review | Shipped |
| 4 | Manual/curated idea backlog and filming queue | Shipped as lightweight versions |
| 5 | Automatic style-rule proposals and performance-informed idea research | Next product capability |
| 6 | Working local Whisper + FFmpeg caption pipeline | Next production capability |
| 7 | Date-based calendar, manual post logging, and schedule suggestions | Later |
| 8 | Live analytics APIs, direct publishing, accounts, and multi-brand support | Only after validation |

---

## 11. Risks and Open Questions

| Item | Current response |
|---|---|
| Style references learn the wrong behavior | Keep the few-shot window small and let the creator control active style rules. Add automatic proposals only with explicit review. |
| Too little performance data causes weak recommendations | Keep analytics descriptive until there is more history and linked scripts. |
| Gemini availability or latency | Use model fallback order, a revision timeout, and user-facing retry states. |
| Facebook embeds fail | Preserve the original permalink fallback; treat embeds as enhancement, not data source. |
| Persona UI becomes distracting | Keep it sidebar-bound, show only the upper figure, and make speech bubbles dismissible. |
| Media scope expands prematurely | Do not call media editing complete until local transcription and rendering work end to end. |
| Brand profile is inaccurate | Keep niche, audience, voice, guardrails, and language mix editable in Brand Strategist. |

### Decisions needed before the next major phase

1. What manual criteria should trigger an automatic style-rule proposal?
2. Which external research sources are appropriate for the future Idea Hub?
3. Which local Whisper runtime should be standardized for the creator's machine?
4. Should the future calendar manage dates only, or also support reminder notifications?

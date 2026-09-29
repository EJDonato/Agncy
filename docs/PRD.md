# PRD: Agncy

**Status:** Draft v1 (proof of concept)
**Owner:** You (sole user)
**Last updated:** September 29, 2026

---

## 1. Summary

**Agncy** is a local-first, single-user workspace that works like an in-house agency for one personal brand. It combines an AI script writer, a caption generator, a content idea researcher, a posting calendar, and a lightweight video editor. All of them share a **Brand Brain**: a persistent store of who you are, what you post, how your posts performed, and how you edit scripts.

The point is that the agents don't start from zero. They know your voice, your niche and your results, and the script writer improves as you edit its drafts.

This is a proof of concept for personal use. Turning it into a product for other creators is a decision to make **after** the concept is validated (see Section 11).

---

## 2. Problem Statement

Running a personal brand's content means switching between many tools (ideation, scripting, editing, captioning, scheduling, analytics) and repeating the same context in every one. Generic AI tools don't know your voice or your results, so their scripts need heavy rewriting and their ideas aren't tailored to you. The cost is time per video and inconsistent posting.

Evidence so far: a real Meta Business Suite export (Jul 31 to Sep 29, 2026, 19 posts) shows widely varying performance between posts. The clearest example is one Reel with 15.8K views but 3.2 seconds average watch time, next to a Reel with 6.4K views, 131 interactions and 11.2 seconds average watch time. Nothing currently connects those results back to the scripts and hooks that produced them.

---

## 3. Goals

1. **Cut script editing effort over time.** The share of an AI draft that survives into your final version should rise as the style profile improves.
2. **Speed up the idea-to-finished-video workflow**, especially script and captioning.
3. **Make performance data useful.** Every imported post is linked to the script that produced it, so the idea generator can favor what has worked.
4. **Be something you reach for weekly** without forcing yourself.
5. **Validate the concept cheaply** with a local, single-user build before investing in accounts, billing or multi-brand support.

---

## 4. Non-Goals (v1)

| Non-goal | Why it's out |
|---|---|
| Direct posting or scheduling to social platforms | You upload manually. Platform posting APIs need app approval and add restrictions. Not needed to prove the concept. |
| Live social API analytics sync (Facebook Graph API, etc.) | CSV import from Meta Business Suite covers analytics for now (see Section 8). API sync is a possible later upgrade. |
| Accounts, login, billing, teams | One user, one brand, runs locally. |
| Multi-brand or multi-tenant support | Decide only after validation. |
| Full timeline video editor | Hardest module by far. v1 is a lightweight, single-flow editor. |
| Mobile app | Local web app only. |
| Fine-tuning a custom model | Style learning uses prompt-time examples and a style profile instead. |

---

## 5. Target User

**One user: you.** A solo creator who scripts, films, edits and posts their own short-form videos and manually uploads them.

From the analytics export, the Page appears to post civic and community content in Filipino/English (Reels, photos and text posts). **This is an assumption. Confirm or correct it in the Brand Brain profile** (see Open Questions).

---

## 6. User Stories

**Brand Brain**
- As a creator, I want to record who I am, my niche, audience, tone, and do's and don'ts once, so that every agent uses the same context.
- As a creator, I want to import my past posts and scripts, so that the agents know what I've already made.

**Script writer**
- As a creator, I want AI to draft a script from a topic or idea using my voice, so that I don't start from a blank page.
- As a creator, I want to edit the draft directly and save my final version, so that I keep full control.
- As a creator, I want the writer to learn from my edits, so that drafts need fewer changes over time.
- As a creator, I want to see what patterns it learned about my style and be able to correct them, so that it doesn't learn the wrong thing.

**Idea generator**
- As a creator, I want an agent that researches my niche and trends and proposes ideas ranked by fit with what has performed well for me, so that I always have something worth making.
- As a creator, I want to send an idea to the script writer in one click, so that ideation flows into scripting.

**Auto captions**
- As a creator, I want to upload a video and get a transcript, so that I don't caption by hand.
- As a creator, I want to fix transcript errors and pick a caption style, so that the burned-in captions look right.
- As a creator, I want to export the video with captions burned in, so that I can upload it directly.

**Content calendar**
- As a creator, I want to place ideas and scripts on dates and get suggestions on when to post, so that I post consistently.
- As a creator, I want to mark a post as posted and log its results, so that the Brand Brain keeps learning.

**Video editor**
- As a creator, I want to trim, remove silences, crop to different aspect ratios and add captions in one flow, so that basic edits don't need a separate app.

**Analytics import**
- As a creator, I want to drop in my Meta Business Suite CSV and have my posts and stats appear, so that performance data feeds the Brand Brain without manual entry.

---

## 7. Product Modules and Requirements

Priority key: **P0** = required for v1 to be worth using, **P1** = fast follow, **P2** = future, design so it isn't blocked.

### 7.1 Brand Brain (shared foundation)

Central store read and written by every module.

**Holds**
- Profile: identity, niche, audience, tone, do's and don'ts, language mix (e.g., Filipino/English)
- Post history with performance data
- Script history: original AI draft, your final edited version, and the diff between them
- Style profile: a plain-language summary of how you like scripts written, refreshed from your edits
- Ideas backlog and calendar entries

| # | Requirement | Priority |
|---|---|---|
| B1 | Profile page to create and edit brand context; injected into every agent prompt | P0 |
| B2 | Store posts, scripts, drafts and edits in a local database (SQLite) | P0 |
| B3 | Style profile is viewable and editable by the user | P0 |
| B4 | Embeddings table for retrieving relevant past posts and scripts | P1 |
| B5 | Import past scripts from pasted text or files | P1 |

**Acceptance criteria (B1):** Given a saved profile, when any agent runs, then its prompt includes the current profile and style profile. Editing the profile changes the next run without restarting the app.

### 7.2 Script Writer (core bet)

| # | Requirement | Priority |
|---|---|---|
| S1 | Generate a script draft from a topic or idea, using the profile, style profile and a few of your best past draft/final pairs as examples | P0 |
| S2 | Full in-app editor to change the draft freely | P0 |
| S3 | On save, store the AI draft and the final version together and compute how much of the draft survived | P0 |
| S4 | Periodically summarize patterns in your edits (e.g., "shortens intros", "prefers casual hooks") into the style profile, with user review before it's applied | P0 |
| S5 | Script formats for short-form video (hook, body, call to action), with length targets | P1 |
| S6 | Regenerate a single section without rewriting the whole script | P1 |
| S7 | Link a script to the post it became (see 7.6) | P0 |

**Acceptance criteria (S3):** Given a generated draft that I edit and save, then the app stores both versions and shows a "draft survival" percentage for that script.

**Acceptance criteria (S4):** Given at least N saved draft/final pairs (N configurable, default 5), when I trigger a style refresh, then I see proposed style rules and can accept, edit or reject each before they're used.

### 7.3 Content Idea Generator

| # | Requirement | Priority |
|---|---|---|
| I1 | Agent with web search scans trends, competitors and the niche and proposes ideas | P0 |
| I2 | Ideas are ranked using fit with the profile and past top-performing posts | P0 |
| I3 | "Send to script writer" button on each idea | P0 |
| I4 | Each idea shows a short reason for why it was suggested | P1 |
| I5 | Mark ideas as saved, used or dismissed so dismissed topics don't return | P1 |

### 7.4 Auto Captions

| # | Requirement | Priority |
|---|---|---|
| C1 | Upload a video and transcribe locally (Whisper or similar) | P0 |
| C2 | Editable transcript with timestamps | P0 |
| C3 | Choose from several caption styles | P0 |
| C4 | Export the video with captions burned in (FFmpeg or Remotion) | P0 |
| C5 | Support Filipino/English mixed-language speech; measure accuracy on your own videos | P0 |
| C6 | Export subtitles as .srt | P1 |

**Acceptance criteria (C1, C4):** Given an uploaded video, when transcription finishes, then I can edit the text; when I export, then the output video has the edited captions burned in.

### 7.5 Content Calendar (replaces the "posting manager")

Since there is no social platform connection, this is a planner, not a scheduler.

| # | Requirement | Priority |
|---|---|---|
| K1 | Calendar view where ideas and scripts can be placed on dates | P0 |
| K2 | Suggest posting times from general best practices at first, then from your own logged results | P1 |
| K3 | Mark items as posted | P0 |
| K4 | Log results by hand (views, likes, etc.) as a fallback to CSV import | P1 |
| K5 | Reminders for planned posts | P2 |

### 7.6 Analytics Import (from Meta Business Suite CSV)

Replaces API sync for v1. Based on an actual export received: `Jul-31-2026_Sep-29-2026_Content_Publish_time_Summary_<id>.csv` (19 rows, 23 columns).

**Known file format**
- Encoding: UTF-8 **with BOM**; read as `utf-8-sig`.
- Columns: Post ID, Page ID, Page name, Title, Duration (sec), Publish time, Permalink, Post type, Data comment, Date, Comments, Distribution, Approximate earnings (USD), Stars (USD), Impressions, Interactions, Reactions, Saves, Shares, Viewers, Views, Average Seconds viewed, Seconds viewed.
- Post types seen: Reel, Photo, Content.
- The `Date` column reads "Lifetime", so every row is a lifetime-to-date total, not a daily value.
- Average Seconds viewed and Seconds viewed are populated only for Reels (empty for the other posts in this file).
- Titles (captions) contain Unicode "bold" letters (e.g., 𝐁𝐮𝐢𝐥𝐝𝐢𝐧𝐠), which hurt search and matching.
- Publish time format: `MM/DD/YYYY HH:MM`.
- Distribution values like `-0.7x`, `+4x`, or `--`.

| # | Requirement | Priority |
|---|---|---|
| A1 | Import the CSV by drag and drop or file picker | P0 |
| A2 | Use Post ID as the unique key so re-importing updates existing posts instead of duplicating | P0 |
| A3 | Store a **snapshot per import** (with the export date) so growth over time can be seen, since data is lifetime totals | P0 |
| A4 | Normalize Unicode bold text in captions to plain text for search and matching, while keeping the original for display | P0 |
| A5 | Handle empty retention fields gracefully for non-Reel posts | P0 |
| A6 | Show a posts table with sortable stats | P0 |
| A7 | Link each imported post to the script that produced it (dropdown, with a suggested match by publish date) | P0 |
| A8 | Report rows added, updated and skipped after each import | P1 |
| A9 | Tolerate column changes in future exports (map by header name, warn on missing columns) | P1 |

**Acceptance criteria (A2):** Given I import the same file twice, then the post count doesn't change and no duplicates appear.

**Acceptance criteria (A3):** Given I import an older export and then a newer one, then a post's view count shows both snapshots and their dates.

### 7.7 Lightweight Video Editor

| # | Requirement | Priority |
|---|---|---|
| V1 | Trim and cut clips | P1 |
| V2 | Remove silences automatically | P1 |
| V3 | Aspect ratio crop (9:16, 1:1, 16:9) | P1 |
| V4 | Captions applied in the same flow (uses 7.4) | P1 |
| V5 | Full multi-track timeline editor | P2 |

Not required for v1 validation. It is built last.

### 7.8 Live API Analytics Sync (deferred)

Not in v1. Recorded here so the design doesn't block it.

- Facebook Graph API can return video analytics for a **Facebook Page** (not personal profiles).
- Requires a Page access token from someone with the ANALYZE task on the Page, with `read_insights` and `pages_read_engagement` permissions. A personal-use app in development mode on your own Page may avoid app review; verify against current Meta docs.
- Page Insights only works on Pages with 100 or more likes.
- In June 2026 Meta retired legacy reach and impression metrics; the replacements are the Media Views and Media Viewers metrics (e.g., `post_total_media_view_unique`, `post_media_view`). Older tutorials use retired metrics.
- Meta's docs state interactions on Reels are not included in the Page Insights endpoint, so Reels coverage must be checked before relying on it.
- Most metrics refresh once every 24 hours, data goes back two years, and queries are limited to 90 days at a time.
- Design implication: keep the importer behind a common "analytics source" interface so a CSV source and an API source can write the same tables.

---

## 8. Constraints

**Product and scope**
- Single user, single brand, no login.
- No connection to social platforms; the user uploads content manually.
- Analytics enter through CSV import (or manual entry), not live API.

**Technical**
- Local-first: runs on your machine; the database is a local file.
- Suggested stack: Next.js (local web app), SQLite (embeddings in a table or a vector extension), Google Gemini API (Gemini Pro/Flash) for agents, Whisper running locally for transcription, FFmpeg (or Remotion) for rendering.
- The Gemini API requires internet and an API key; everything else should work offline where possible.
- Video processing speed depends on local hardware.

**Data**
- Analytics data is lifetime totals per export, so history requires storing snapshots.
- Retention metrics (average seconds viewed) exist only for Reels in the current export format.
- The sample is small (19 posts, 5 Reels), so early performance conclusions are weak. The idea generator's "fit with top performers" needs more history to be meaningful.

**Quality**
- Style learning must be reviewable. The user approves or edits learned style rules; the system must not silently drift.

---

## 9. Success Metrics

Define baselines before you start building so validation isn't guesswork. Targets below are proposals to adjust, not measured benchmarks.

### Leading indicators (first 2 to 4 weeks of use)
| Metric | How to measure | Proposed target |
|---|---|---|
| **Draft survival rate** | Text similarity between AI draft and final script (e.g., 1 minus normalized edit distance), per script | Trend upward; average of scripts 11 to 15 is at least 15 percentage points above scripts 1 to 5 |
| **Time from idea to finished, captioned video** | Manual timer or timestamps in the app, compared with your current workflow baseline | At least 30% faster than baseline |
| **Caption edit effort** | Number of transcript corrections per minute of video | Decreasing over time; under about 5 per minute for your usual speech |
| **Import success** | Rows parsed correctly, no duplicates | 100% of rows in a valid Meta export |

### Lagging indicators (8 to 12 weeks)
| Metric | How to measure | Proposed target |
|---|---|---|
| **Weekly usage** | Weeks in which you create at least one script or captioned video in the app | At least 6 of 8 weeks, without forcing it |
| **Posting consistency** | Posts per week vs. your prior rate | Equal or higher than before |
| **Idea acceptance rate** | Ideas saved or used divided by ideas suggested | At least 25% |
| **Performance link** | Share of posts linked to their scripts | At least 80% |

### Validation decision

The concept counts as validated if, after about 8 weeks:
1. Draft survival has clearly improved,
2. The idea-to-finished-video workflow is meaningfully faster, and
3. You use it weekly on your own.

If the script writer and captions alone save real time, the concept is validated and the remaining modules are polish. If not, revisit the style learning approach before building more.

---

## 10. Phasing and Timeline

No hard deadlines. Suggested order, each phase usable on its own:

| Phase | Scope | Notes |
|---|---|---|
| **1a** | Brand Brain profile + CSV importer + posts table | Smallest useful slice; proves the data model with your real export |
| **1b** | Script writer with edit-learning loop and draft-survival tracking | The core bet |
| **2** | Content idea generator | Needs web search and enough post history |
| **3** | Auto captions | Very doable and independent. Can be moved earlier if you want a quick win |
| **4** | Content calendar + manual results logging | |
| **5** | Lightweight video editor | Hardest; built last |
| **Later** | Live API sync, then multi-brand/accounts if productizing | Only after validation |

---

## 11. After Validation (product path)

If validated, decide separately whether to:
- Add accounts, billing and multi-brand support
- Add live analytics via Meta's API and other platform APIs
- Consider platform posting APIs (require app approval and have restrictions)

None of these are in scope for the proof of concept.

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Style learning picks up wrong patterns | Show learned rules and require approval before use |
| Small analytics history gives misleading "top performer" signals | Show sample sizes; weight recommendations lightly until more data exists |
| Whisper accuracy on mixed Filipino/English speech | Test on your own videos early; keep the transcript fully editable |
| Video editor scope creep | Keep v1 to trim, silence removal, crop and captions |
| Meta export format changes | Map columns by header name and warn on missing ones |
| Meta API metric deprecations | Deferred; design an "analytics source" interface so the source can change |

---

## 13. Open Questions

| Question | Owner | Blocking? |
|---|---|---|
| What is your exact niche and audience? (The export suggests civic/community content in Filipino/English. Confirm.) | You | Yes, for the Brand Brain profile |
| Which platforms do you post on besides Facebook (TikTok, Reels on Instagram, YouTube Shorts)? | You | No, but it shapes script formats |
| Do you have existing scripts to import, and where are they? | You | No |
| Do you post mostly Reels or regular Page videos? (Affects how useful retention data is.) | You | No |
| What is your current time from idea to finished video? (Needed as the baseline.) | You | Before measuring success |
| Should captions be burned in only, or also exported as .srt? | You | No |
| Which machine will this run on (for Whisper and FFmpeg performance)? | You | No |

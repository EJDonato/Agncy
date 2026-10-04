import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";

export const brandProfiles = sqliteTable("brand_profiles", {
  id: text("id").primaryKey(),
  creatorName: text("creator_name").notNull(),
  niche: text("niche").notNull(),
  targetAudience: text("target_audience").notNull(),
  toneOfVoice: text("tone_of_voice").notNull(),
  languageMix: text("language_mix").notNull().default("Taglish (Filipino/English)"),
  dosAndDonts: text("dos_and_donts"),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const styleRules = sqliteTable("style_rules", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brandProfiles.id, { onDelete: "cascade" }),
  category: text("category", { enum: ["hook", "pacing", "vocabulary", "structure", "tone"] }).notNull(),
  ruleText: text("rule_text").notNull(),
  rationale: text("rationale"),
  status: text("status", { enum: ["proposed", "active", "rejected", "archived"] }).notNull().default("proposed"),
  confidenceScore: real("confidence_score").default(1.0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  approvedAt: text("approved_at"),
});

export const ideas = sqliteTable("ideas", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brandProfiles.id),
  topic: text("topic").notNull(),
  angleHook: text("angle_hook").notNull(),
  whySuggested: text("why_suggested").notNull(),
  status: text("status", { enum: ["suggested", "saved", "converted", "dismissed"] }).notNull().default("suggested"),
  predictedFitScore: real("predicted_fit_score").default(0.8),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const contextSignals = sqliteTable("context_signals", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brandProfiles.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  normalizedSubject: text("normalized_subject").notNull(),
  status: text("status", { enum: ["active", "ended", "evergreen", "recurring_closed", "unclear"] }).notNull(),
  evidenceSummary: text("evidence_summary").notNull(),
  sourceUrl: text("source_url"),
  checkedAt: text("checked_at").notNull(),
  expiresAt: text("expires_at").notNull(),
}, (table) => [
  uniqueIndex("context_signals_brand_subject_idx").on(table.brandId, table.normalizedSubject),
]);

export const performanceAnalysisJobs = sqliteTable("performance_analysis_jobs", {
  id: text("id").primaryKey(),
  status: text("status", { enum: ["queued", "running", "completed", "failed"] }).notNull(),
  analysisJson: text("analysis_json"),
  contextJson: text("context_json"),
  errorMessage: text("error_message"),
  createdAt: text("created_at").notNull(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});

export const scripts = sqliteTable("scripts", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brandProfiles.id),
  ideaId: text("idea_id").references(() => ideas.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  format: text("format").default("Reel"),
  targetDurationSec: integer("target_duration_sec").default(45),
  status: text("status", { enum: ["drafting", "in_review", "finalized", "filmed", "published"] }).notNull().default("drafting"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const scriptVersions = sqliteTable("script_versions", {
  id: text("id").primaryKey(),
  scriptId: text("script_id").notNull().references(() => scripts.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  versionType: text("version_type", { enum: ["ai_initial_draft", "ai_revision", "user_edit", "final_version"] }).notNull(),
  hookText: text("hook_text"),
  bodyText: text("body_text"),
  ctaText: text("cta_text"),
  fullContent: text("full_content").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const scriptDiffs = sqliteTable("script_diffs", {
  id: text("id").primaryKey(),
  scriptId: text("script_id").notNull().unique().references(() => scripts.id, { onDelete: "cascade" }),
  draftVersionId: text("draft_version_id").notNull().references(() => scriptVersions.id),
  finalVersionId: text("final_version_id").notNull().references(() => scriptVersions.id),
  survivalPercentage: real("survival_percentage").notNull(),
  draftTokenCount: integer("draft_token_count").notNull(),
  finalTokenCount: integer("final_token_count").notNull(),
  retainedTokens: integer("retained_tokens").notNull(),
  tokenLcsMap: text("token_lcs_map"),
  editSummary: text("edit_summary"),
  analyzedAt: text("analyzed_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  externalPostId: text("external_post_id").notNull().unique(),
  scriptId: text("script_id").references(() => scripts.id, { onDelete: "set null" }),
  pageId: text("page_id").notNull(),
  pageName: text("page_name").notNull(),
  postType: text("post_type", { enum: ["Reel", "Photo", "Content", "Video"] }),
  rawTitle: text("raw_title"),
  normalizedTitle: text("normalized_title"),
  permalink: text("permalink"),
  publishedAt: text("published_at").notNull(),
  durationSeconds: integer("duration_seconds").default(0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const importBatches = sqliteTable("import_batches", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileHash: text("file_hash").notNull().unique(),
  exportDateStart: text("export_date_start"),
  exportDateEnd: text("export_date_end"),
  rowsTotal: integer("rows_total").notNull(),
  rowsImported: integer("rows_imported").notNull(),
  rowsUpdated: integer("rows_updated").notNull(),
  importedAt: text("imported_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const postMetricSnapshots = sqliteTable("post_metric_snapshots", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  batchId: text("batch_id").notNull().references(() => importBatches.id, { onDelete: "cascade" }),
  views: integer("views").default(0),
  viewers: integer("viewers").default(0),
  impressions: integer("impressions").default(0),
  interactions: integer("interactions").default(0),
  reactions: integer("reactions").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  avgSecondsViewed: real("avg_seconds_viewed").default(0.0),
  totalSecondsViewed: integer("total_seconds_viewed").default(0),
  distributionScore: text("distribution_score"),
  approximateEarningsUsd: real("approximate_earnings_usd").default(0.0),
  capturedAt: text("captured_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  postId: text("post_id").references(() => posts.id, { onDelete: "set null" }),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  durationSeconds: real("duration_seconds").default(0.0),
  rawTranscript: text("raw_transcript"),
  wordTimestamps: text("word_timestamps"),
  srtPath: text("srt_path"),
  processedAt: text("processed_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const contentSchedules = sqliteTable("content_schedules", {
  id: text("id").primaryKey(),
  scriptId: text("script_id").references(() => scripts.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  scheduledDate: text("scheduled_date").notNull(), // ISO YYYY-MM-DD
  scheduledTime: text("scheduled_time").default("19:00"),
  format: text("format").default("Reel"),
  status: text("status", { enum: ["planned", "filmed", "published"] }).notNull().default("planned"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

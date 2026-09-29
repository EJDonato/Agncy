import { parse } from "csv-parse/sync";
import { z } from "zod";
import crypto from "node:crypto";
import { normalizeUnicodeText, stripBOM } from "./normalizer";

// Zod Schema to strictly validate raw Meta CSV rows
export const RawMetaRowSchema = z.record(z.string());

export interface ParsedMetaPost {
  externalPostId: string;
  pageId: string;
  pageName: string;
  postType: "Reel" | "Photo" | "Content" | "Video";
  rawTitle: string;
  normalizedTitle: string;
  permalink: string;
  publishedAt: string;
  durationSeconds: number;
  // Snapshot metrics
  views: number;
  viewers: number;
  impressions: number;
  interactions: number;
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  avgSecondsViewed: number;
  totalSecondsViewed: number;
  distributionScore: string;
  approximateEarningsUsd: number;
}

export interface ParseResult {
  fileHash: string;
  posts: ParsedMetaPost[];
  exportDateStart?: string;
  exportDateEnd?: string;
}

function parseNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (!val || typeof val !== "string") return 0;
  const cleaned = val.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parsePostType(val: string | undefined): "Reel" | "Photo" | "Content" | "Video" {
  if (!val) return "Content";
  const clean = val.trim().toLowerCase();
  if (clean === "reel") return "Reel";
  if (clean === "photo") return "Photo";
  if (clean === "video") return "Video";
  return "Content";
}

function parseDateToISO(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString();
  // Typical Meta format: MM/DD/YYYY HH:MM (e.g. 09/27/2026 18:30)
  const parts = dateStr.trim().split(" ");
  if (parts.length >= 2) {
    const [month, day, year] = parts[0].split("/");
    const [hours, minutes] = parts[1].split(":");
    if (month && day && year && hours && minutes) {
      const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes)));
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date().toISOString() : fallback.toISOString();
}

export function parseMetaCsv(csvBuffer: Buffer | string): ParseResult {
  const content = typeof csvBuffer === "string" ? csvBuffer : csvBuffer.toString("utf8");
  const cleanContent = stripBOM(content);

  const fileHash = crypto.createHash("sha256").update(cleanContent).digest("hex");

  const rawRecords = parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const posts: ParsedMetaPost[] = [];

  for (const raw of rawRecords) {
    const validated = RawMetaRowSchema.parse(raw);
    const postId = validated["Post ID"]?.trim();
    if (!postId) continue;

    const rawTitle = validated["Title"] || "";
    const normalizedTitle = normalizeUnicodeText(rawTitle);

    posts.push({
      externalPostId: postId,
      pageId: validated["Page ID"] || "",
      pageName: validated["Page name"] || "",
      postType: parsePostType(validated["Post type"]),
      rawTitle,
      normalizedTitle,
      permalink: validated["Permalink"] || "",
      publishedAt: parseDateToISO(validated["Publish time"]),
      durationSeconds: Math.round(parseNumber(validated["Duration (sec)"])),
      views: Math.round(parseNumber(validated["Views"])),
      viewers: Math.round(parseNumber(validated["Viewers"])),
      impressions: Math.round(parseNumber(validated["Impressions"])),
      interactions: Math.round(parseNumber(validated["Interactions"])),
      reactions: Math.round(parseNumber(validated["Reactions"])),
      comments: Math.round(parseNumber(validated["Comments"])),
      shares: Math.round(parseNumber(validated["Shares"])),
      saves: Math.round(parseNumber(validated["Saves"])),
      avgSecondsViewed: parseNumber(validated["Average Seconds viewed"]),
      totalSecondsViewed: Math.round(parseNumber(validated["Seconds viewed"])),
      distributionScore: validated["Distribution"] || "--",
      approximateEarningsUsd: parseNumber(validated["Approximate earnings (USD)"]),
    });
  }

  return {
    fileHash,
    posts,
  };
}

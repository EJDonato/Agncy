import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH || "./data/agncy.db";
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

// Prime Directives: WAL mode and performance pragmas
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("foreign_keys = ON");

// Operational job state must exist before route modules query it. The project
// currently bootstraps its local SQLite schema without a runtime migration runner.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS performance_analysis_jobs (
    id TEXT PRIMARY KEY NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    analysis_json TEXT,
    context_json TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS performance_analysis_jobs_created_at_idx
    ON performance_analysis_jobs (created_at DESC);
  CREATE TABLE IF NOT EXISTS sera_chat_turns (
    id TEXT PRIMARY KEY NOT NULL,
    script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    assistant_message TEXT,
    action TEXT CHECK (action IN ('discuss', 'revise')),
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    revision_version_id TEXT REFERENCES script_versions(id) ON DELETE SET NULL,
    error_message TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS sera_chat_turns_script_created_idx
    ON sera_chat_turns (script_id, created_at);
`);

export const db = drizzle(sqlite, { schema });
export { sqlite };

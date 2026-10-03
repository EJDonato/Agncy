import assert from "node:assert/strict";
import test from "node:test";
import { parseMetaCsv } from "../lib/analytics/csv-parser";

const csv = `\uFEFFPost ID,Page ID,Page name,Title,Duration (sec),Publish time,Permalink,Post type,Views,Average Seconds viewed
post-1,page-1,Agncy,𝐁𝐮𝐢𝐥𝐝 local tools,45,09/27/2026 18:30,https://example.com,Reel,"1,250",11.2
post-2,page-1,Agncy,Photo update,,09/28/2026 10:00,https://example.com/2,Photo,200,
`;

test("parses Meta rows, BOM, metrics, and Unicode bold text", () => {
  const result = parseMetaCsv(csv);
  assert.equal(result.posts.length, 2);
  assert.equal(result.posts[0].views, 1250);
  assert.equal(result.posts[0].normalizedTitle, "Build local tools");
  assert.equal(result.posts[1].avgSecondsViewed, 0);
});

test("produces stable hashes for identical exports", () => {
  assert.equal(parseMetaCsv(csv).fileHash, parseMetaCsv(csv).fileHash);
});

import assert from "node:assert/strict";
import test from "node:test";
import { computeScriptDiff } from "../lib/diff/lcs";

test("computes retained words case-insensitively", () => {
  const result = computeScriptDiff("Hello civic builders", "hello local civic builders");
  assert.equal(result.draftWordCount, 3);
  assert.equal(result.finalWordCount, 4);
  assert.equal(result.retainedWordCount, 3);
  assert.equal(result.survivalPercentage, 100);
});

test("marks an empty draft as zero survival", () => {
  const result = computeScriptDiff("", "Bagong script");
  assert.equal(result.survivalPercentage, 0);
  assert.equal(result.finalWordCount, 2);
});

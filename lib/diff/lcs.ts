import { tokenize, type Token } from "./tokenizer";

export type TokenStatus = "retained" | "deleted" | "added";

export interface AnnotatedToken {
  text: string;
  isWord: boolean;
  status: TokenStatus;
}

export interface DiffResult {
  survivalPercentage: number;
  draftWordCount: number;
  finalWordCount: number;
  retainedWordCount: number;
  annotatedDraft: AnnotatedToken[];
  annotatedFinal: AnnotatedToken[];
}

/**
 * Computes Token-level Longest Common Subsequence (LCS)
 * between the initial AI draft and the user's final edited script.
 */
export function computeScriptDiff(draftText: string, finalText: string): DiffResult {
  const draftTokens = tokenize(draftText);
  const finalTokens = tokenize(finalText);

  // Normalize comparison by lowercase for words, exact match for punctuation
  const normalize = (t: Token) => (t.isWord ? t.text.toLowerCase() : t.text.trim());

  const m = draftTokens.length;
  const n = finalTokens.length;

  if (m === 0) {
    return {
      survivalPercentage: 0,
      draftWordCount: 0,
      finalWordCount: finalTokens.filter((t) => t.isWord).length,
      retainedWordCount: 0,
      annotatedDraft: [],
      annotatedFinal: finalTokens.map((t) => ({ ...t, status: "added" })),
    };
  }

  // Dynamic programming LCS table
  // Space optimization: rows of size n + 1
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalize(draftTokens[i - 1]) === normalize(finalTokens[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to annotate draft and final tokens
  let i = m;
  let j = n;

  const draftStatuses: TokenStatus[] = new Array(m).fill("deleted");
  const finalStatuses: TokenStatus[] = new Array(n).fill("added");

  while (i > 0 && j > 0) {
    if (normalize(draftTokens[i - 1]) === normalize(finalTokens[j - 1])) {
      draftStatuses[i - 1] = "retained";
      finalStatuses[j - 1] = "retained";
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  const annotatedDraft: AnnotatedToken[] = draftTokens.map((t, idx) => ({
    ...t,
    status: draftStatuses[idx],
  }));

  const annotatedFinal: AnnotatedToken[] = finalTokens.map((t, idx) => ({
    ...t,
    status: finalStatuses[idx],
  }));

  const draftWords = draftTokens.filter((t) => t.isWord);
  const finalWords = finalTokens.filter((t) => t.isWord);
  const retainedWords = annotatedDraft.filter((t) => t.isWord && t.status === "retained");

  const draftWordCount = draftWords.length;
  const finalWordCount = finalWords.length;
  const retainedWordCount = retainedWords.length;

  const survivalPercentage =
    draftWordCount > 0
      ? Math.min(100, Math.max(0, Math.round((retainedWordCount / draftWordCount) * 100)))
      : 0;

  return {
    survivalPercentage,
    draftWordCount,
    finalWordCount,
    retainedWordCount,
    annotatedDraft,
    annotatedFinal,
  };
}

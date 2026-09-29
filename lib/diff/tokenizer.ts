/**
 * Tokenizer for script texts.
 * Splits text into word and punctuation tokens while preserving case and meaning.
 * Taglish-friendly: preserves apostrophes, hyphens, and mixed alphanumeric words.
 */

export interface Token {
  text: string;
  isWord: boolean;
}

export function tokenize(content: string): Token[] {
  if (!content) return [];

  // Match words (including contractions and hyphenated Taglish like nag-post, i-check)
  // or standalone punctuation marks.
  const regex = /([a-zA-Z0-9\u00C0-\u024F]+(?:['\-_][a-zA-Z0-9\u00C0-\u024F]+)*|[.,!?;:()""''`\n]+|\s+)/gu;
  const matches = content.match(regex) || [];

  const tokens: Token[] = [];

  for (const match of matches) {
    const isWord = /^[a-zA-Z0-9\u00C0-\u024F]/.test(match);
    tokens.push({
      text: match,
      isWord,
    });
  }

  return tokens;
}

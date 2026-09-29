/**
 * Normalizes stylized Unicode alphanumeric characters (e.g. mathematical bold/sans-serif)
 * commonly used in Meta captions (e.g. 𝐁𝐮𝐢𝐥𝐝𝐢𝐧𝐠 𝐢𝐧 𝐏𝐮𝐛𝐥𝐢𝐜) into standard plain text.
 */
export function normalizeUnicodeText(text: string | null | undefined): string {
  if (!text) return "";

  return text
    .normalize("NFKD")
    .replace(/[\u{1D400}-\u{1D7FF}]/gu, (char) => {
      const codePoint = char.codePointAt(0);
      if (!codePoint) return char;

      // Bold capital A-Z (1D400 - 1D419 -> 0041 - 005A)
      if (codePoint >= 0x1d400 && codePoint <= 0x1d419) {
        return String.fromCodePoint(codePoint - 0x1d400 + 0x41);
      }
      // Bold lower a-z (1D41A - 1D433 -> 0061 - 007A)
      if (codePoint >= 0x1d41a && codePoint <= 0x1d433) {
        return String.fromCodePoint(codePoint - 0x1d41a + 0x61);
      }
      // Bold digits 0-9 (1D7CE - 1D7D7 -> 0030 - 0039)
      if (codePoint >= 0x1d7ce && codePoint <= 0x1d7d7) {
        return String.fromCodePoint(codePoint - 0x1d7ce + 0x30);
      }
      return char;
    })
    .trim();
}

/**
 * Strips UTF-8 Byte Order Mark (BOM: \uFEFF) from imported CSV raw strings.
 */
export function stripBOM(content: string): string {
  if (content.charCodeAt(0) === 0xfeff) {
    return content.slice(1);
  }
  return content;
}

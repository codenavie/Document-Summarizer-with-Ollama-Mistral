const { CHUNK_SIZE } = require('../config');

function buildSummaryPrompt(text) {
  return `Summarize the following document clearly and concisely.
- Provide key points
- Provide a short overall summary
- Keep it structured with bullet points

DOCUMENT:
${text}`;
}

function chunkText(text, chunkSize = CHUNK_SIZE) {
  const cleaned = text.replace(/\r/g, '').trim();
  if (!cleaned) return [];

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = Math.min(start + chunkSize, cleaned.length);

    if (end < cleaned.length) {
      const minSplit = start + Math.floor(chunkSize * 0.6);
      const paragraphBreak = cleaned.lastIndexOf('\n\n', end);
      const lineBreak = cleaned.lastIndexOf('\n', end);
      const spaceBreak = cleaned.lastIndexOf(' ', end);
      const candidates = [paragraphBreak, lineBreak, spaceBreak].filter((pos) => pos > minSplit);
      if (candidates.length > 0) {
        end = Math.max(...candidates);
      }
    }

    const chunk = cleaned.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    start = end;
    while (start < cleaned.length && /\s/.test(cleaned[start])) {
      start += 1;
    }
  }

  return chunks;
}

module.exports = {
  buildSummaryPrompt,
  chunkText,
};

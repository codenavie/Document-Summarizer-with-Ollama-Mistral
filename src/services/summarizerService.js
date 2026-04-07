const { AppError } = require('../errors');
const { CHUNK_SIZE } = require('../config');
const { buildSummaryPrompt, chunkText } = require('../utils/textUtils');
const { callOllama } = require('./ollamaService');

async function summarizeTextWithChunking(fullText) {
  const chunks = chunkText(fullText, CHUNK_SIZE);
  if (chunks.length === 0) {
    throw new AppError('Empty file content after extraction.', 400);
  }

  const chunkSummaries = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const chunkSummary = await callOllama(buildSummaryPrompt(chunks[i]));
    chunkSummaries.push(`Chunk ${i + 1} Summary:\n${chunkSummary}`);
  }

  if (chunkSummaries.length === 1) {
    return chunkSummaries[0].replace(/^Chunk 1 Summary:\n/, '').trim();
  }

  const mergedInput = chunkSummaries.join('\n\n');
  return callOllama(buildSummaryPrompt(mergedInput));
}

module.exports = {
  summarizeTextWithChunking,
};

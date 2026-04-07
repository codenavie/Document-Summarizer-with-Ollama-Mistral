const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

const OLLAMA_TIMEOUT_MS = 120000;
const CHUNK_SIZE = 4000;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const SUMMARY_DIR = path.join(__dirname, '..', 'summaries');
const ALLOWED_EXTENSIONS = new Set(['.pdf']);

module.exports = {
  PORT,
  OLLAMA_URL,
  OLLAMA_MODEL,
  OLLAMA_TIMEOUT_MS,
  CHUNK_SIZE,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
  SUMMARY_DIR,
  ALLOWED_EXTENSIONS,
};

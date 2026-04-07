const { AppError } = require('../errors');
const { OLLAMA_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT_MS } = require('../config');

async function callOllama(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await response.json();
    } catch (_jsonError) {
      // Keep `data` null and use default errors below.
    }

    if (!response.ok) {
      throw new AppError(data?.error || 'Failed to call Ollama API.', response.status || 500);
    }

    const summaryText = data?.response?.trim();
    if (!summaryText) {
      throw new AppError('Received empty response from Ollama.', 502);
    }

    return summaryText;
  } catch (error) {
    const networkCode = error?.cause?.code || error?.code;
    const isOllamaOffline =
      error.name === 'AbortError' ||
      networkCode === 'ECONNREFUSED' ||
      networkCode === 'ENOTFOUND';

    if (isOllamaOffline) {
      throw new AppError('Ollama is not running or unreachable at http://localhost:11434.', 503);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(error.message || 'Failed to call Ollama API.', 500);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  callOllama,
};

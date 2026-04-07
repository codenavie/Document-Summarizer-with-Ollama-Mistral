const fs = require('fs');
const path = require('path');

function sanitizeFilename(name) {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
}

function ensureDirectories(...directories) {
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function getExtension(filename) {
  return path.extname(filename).toLowerCase();
}

function buildSummaryFilename(originalName) {
  const safeBaseName = sanitizeFilename(path.parse(originalName).name) || 'document';
  return `${safeBaseName}_summary.txt`;
}

module.exports = {
  sanitizeFilename,
  ensureDirectories,
  getExtension,
  buildSummaryFilename,
};

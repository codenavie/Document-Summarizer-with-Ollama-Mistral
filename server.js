const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PORT, MAX_UPLOAD_BYTES, SUMMARY_DIR, ALLOWED_EXTENSIONS, UPLOAD_DIR } = require('./src/config');
const { AppError } = require('./src/errors');
const { ensureDirectories, getExtension, buildSummaryFilename } = require('./src/utils/fileUtils');
const { uploadSingleAsync } = require('./src/middleware/uploadMiddleware');
const { extractTextFromPdf } = require('./src/services/pdfService');
const { summarizeTextWithChunking } = require('./src/services/summarizerService');

const app = express();

ensureDirectories(UPLOAD_DIR, SUMMARY_DIR);

app.get('/', (_req, res) => {
  res.json({
    message: 'Document Summarizer API is running. Use POST /summarize with form-data key "file" (PDF only).',
  });
});

app.post('/summarize', async (req, res, next) => {
  try {
    await uploadSingleAsync(req, res);

    if (!req.file) {
      throw new AppError('No file uploaded. Use form-data key "file".', 400);
    }

    const originalName = req.file.originalname;
    const ext = getExtension(originalName);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new AppError('Unsupported file type. Allowed: PDF only.', 400);
    }

    const extractedText = await extractTextFromPdf(req.file.path);
    if (!extractedText || extractedText.trim().length === 0) {
      throw new AppError('The uploaded file is empty or has no extractable text.', 400);
    }

    const finalSummary = await summarizeTextWithChunking(extractedText);
    const summaryFileName = buildSummaryFilename(originalName);
    const summaryFilePath = path.join(SUMMARY_DIR, summaryFileName);
    await fs.promises.writeFile(summaryFilePath, finalSummary, 'utf8');

    res.json({
      filename: summaryFileName,
      summary: finalSummary,
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File too large. Max allowed is ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.` });
    }
    return res.status(400).json({ error: err.message || 'Upload failed.' });
  }

  const statusCode = err?.statusCode || 500;
  return res.status(statusCode).json({ error: err?.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Upload endpoint: POST /summarize (form-data key: file, PDF only)');
});

const fs = require('fs');
const pdfParseModule = require('pdf-parse');
const { AppError } = require('../errors');

async function parsePdfText(fileBuffer) {
  if (typeof pdfParseModule === 'function') {
    const parsed = await pdfParseModule(fileBuffer);
    return parsed?.text || '';
  }

  if (typeof pdfParseModule?.PDFParse === 'function') {
    const parser = new pdfParseModule.PDFParse({ data: fileBuffer });
    try {
      const result = await parser.getText();
      return result?.text || '';
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    }
  }

  throw new AppError('Unsupported pdf-parse version. Install a supported version of pdf-parse.', 500);
}

async function extractTextFromPdf(filePath) {
  const fileBuffer = await fs.promises.readFile(filePath);
  return parsePdfText(fileBuffer);
}

module.exports = {
  extractTextFromPdf,
};

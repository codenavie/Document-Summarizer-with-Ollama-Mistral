# Document Summarizer (Node.js + Ollama Mistral)

Local API that accepts a PDF upload, extracts text, summarizes it with Ollama (`mistral`), saves the summary as a text file, and returns the summary in JSON.

## Features

- Optional Vue UI (light/dark mode) for browser-based upload and results
- Upload PDF via API (`POST /summarize`)
- Extract text from PDF using `pdf-parse`
- Summarize with local Ollama API (`http://localhost:11434`)
- Chunk large documents (~4000 chars/chunk) for stable summarization
- Merge chunk summaries into one final summary
- Save output file as `<original_name>_summary.txt` in `summaries/`
- Return summary in API response

## Tech Stack

- Node.js
- Express
- Multer
- pdf-parse
- Native `fetch` (no axios)
- Ollama with `mistral`

## Project Structure

```text
Document Summarizer/
  server.js
  public/
  src/
  package.json
  uploads/
  summaries/
  .gitignore
  README.md
```

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- Ollama installed and running
- `mistral` model pulled locally

## Setup

1. Install dependencies:

```bash
npm install
```

2. Pull Ollama model:

```bash
ollama pull mistral
```

3. Start the server:

```bash
node server.js
```

Server runs at:

```text
http://localhost:3000
```

## Optional UI

The project includes an optional Vue frontend served by Express.

- Open `http://localhost:3000` to use the UI.
- Use `http://localhost:3000/api/health` for API health check.
- The API endpoint remains `POST /summarize`.

## API Usage

### Health Check

```http
GET /api/health
```

### Summarize PDF

```http
POST /summarize
Content-Type: multipart/form-data
file: <pdf file>
```

PowerShell / Windows example:

```powershell
curl.exe -X POST http://localhost:3000/summarize -F "file=@uploads/OJT.pdf"
```

Example JSON response:

```json
{
  "filename": "OJT_summary.txt",
  "summary": "- Key point 1...\n- Key point 2...\n\nOverall summary: ..."
}
```

## Output Files

- Uploaded PDFs are stored in `uploads/`
- Generated summaries are stored in `summaries/`

Example output file:

```text
summaries/OJT_summary.txt
```

## Error Handling

API returns clear errors for:

- Unsupported file type (PDF only)
- Missing upload (`file` field not sent)
- Empty or non-extractable PDF text
- Ollama not running / unreachable
- Ollama API failures

## Notes for Team Testing

If others want to test locally:

1. Clone repo
2. Run `npm install`
3. Run `ollama pull mistral`
4. Start server with `node server.js`
5. Send a PDF to `POST /summarize`

## Deployment Notes

This app requires local Ollama runtime, so use a VM/server where Ollama can run (not typical serverless).

Recommended:

- Ubuntu server or local machine host
- PM2 for process management
- Nginx reverse proxy + HTTPS

## Troubleshooting

1. `{"error":"Ollama is not running..."}`
- Start Ollama and confirm `http://localhost:11434` is reachable.

2. `{"error":"pdfParse is not a function"}`
- Already handled in this project with compatibility logic for `pdf-parse` v1 and v2.

3. Upload works but summary is weak
- Increase chunk quality by improving source PDF text (scanned PDFs may need OCR first).

## Scripts

From `package.json`:

```bash
npm start
```

Equivalent to:

```bash
node server.js
```

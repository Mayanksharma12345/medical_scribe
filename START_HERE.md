# Medical Scribe AI - Quick Start Guide

## Step 1: Choose Your AI Provider

You can use either **OpenAI API** (recommended, simpler) or **Azure OpenAI**.

### Option A: OpenAI API (Recommended)

1. Get API key from https://platform.openai.com/api-keys
2. Edit `.env` file:
   \`\`\`bash
   USE_OPENAI=true
   OPENAI_API_KEY=sk-your-actual-key-here
   \`\`\`

### Option B: Azure OpenAI

1. Keep `.env` as is with Azure credentials
2. Make sure `USE_OPENAI=false`

## Step 2: Start the Backend

\`\`\`bash
# Install dependencies
pip install -r requirements.txt

# Start Python backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

Backend will run at: http://localhost:8000

## Step 3: Start the Frontend

\`\`\`bash
# In a new terminal
npm install
npm run dev
\`\`\`

Frontend will run at: http://localhost:3000

## Step 4: Test the App

1. Go to http://localhost:3000/encounters/new
2. Record or upload audio
3. Click "Transcribe Audio"
4. Fill in encounter details
5. Click "Save & Generate SOAP Note"
6. Success dialog will show with "View SOAP Notes" button
7. View full SOAP with ICD-10 and CPT codes!

## Features Working

✅ Real-time Medical Transcription (Whisper API)
✅ SOAP Note Generation (GPT-4)  
✅ ICD-10 Code Suggestions (AI-powered)
✅ CPT Procedure Codes (AI-powered)
✅ Success dialog with direct link to view saved notes

## Troubleshooting

**Backend not starting?**
\`\`\`bash
# Check if port 8000 is in use
lsof -ti:8000 | xargs kill -9

# Restart
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

**"Failed to fetch" errors?**
- Make sure backend is running on port 8000
- Check `.env` has valid API key
- Verify `USE_OPENAI=true` if using OpenAI

**No SOAP notes showing?**
- Click "Save & Generate SOAP Note" button
- Wait for success dialog
- Click "View SOAP Notes" button in dialog
- Or go to "Encounters" page and click any encounter card

## Cost Estimates (OpenAI)

- **Transcription**: $0.006/minute
- **SOAP Generation**: ~$0.10/encounter
- **Total per encounter**: ~$0.15-0.25

Very affordable for small practices!

# OpenAI API Setup Guide

## Quick Setup (5 minutes)

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### 2. Configure Environment Variables

Open `.env` file and add your API key:

\`\`\`bash
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4
OPENAI_WHISPER_MODEL=whisper-1
\`\`\`

### 3. Start the Application

\`\`\`bash
# Start backend
docker-compose up

# Or manually:
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

### 4. Test the API

\`\`\`bash
# Health check
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs
\`\`\`

## Cost Estimates

### Whisper (Transcription)
- **$0.006 per minute** of audio
- 10-minute encounter = $0.06

### GPT-4 (SOAP Generation)
- **$0.03 per 1K input tokens**
- **$0.06 per 1K output tokens**
- Average SOAP generation = $0.05-0.15

### Monthly Costs (estimates)
- **10 encounters/day**: ~$30-50/month
- **50 encounters/day**: ~$150-250/month
- **100 encounters/day**: ~$300-500/month

## Features Working

 1. **Real-time Medical Transcription**
   - Converts audio to text with medical terminology
   - Uses OpenAI Whisper API

 2. **SOAP Note Generation**
   - Automatic structured clinical notes
   - Subjective, Objective, Assessment, Plan sections

 3. **ICD-10 Code Suggestions**
   - AI-powered diagnosis codes
   - CPT procedure codes

## Troubleshooting

### Backend won't start
\`\`\`bash
# Check Python backend is running
ps aux | grep uvicorn

# Restart if needed
pkill -f uvicorn
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

### "Failed to fetch" errors
- Backend must be running on port 8000
- Frontend must be running on port 3000
- Check `.env` has valid `OPENAI_API_KEY`

### Invalid API key
- Verify key starts with `sk-`
- Check key is active at https://platform.openai.com/api-keys
- Ensure you have credits/billing set up

## Success Checklist

 - [ ] OpenAI API key added to `.env`
 - [ ] Backend running on http://localhost:8000
 - [ ] Frontend running on http://localhost:3000
 - [ ] Can record/upload audio
 - [ ] Transcription works (returns text)
 - [ ] SOAP generation works (shows dialog)
 - [ ] Can view encounters with ICD codes

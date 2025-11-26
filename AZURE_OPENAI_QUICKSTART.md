# Azure OpenAI Quick Start Guide

## Step 1: Get Your Azure OpenAI Credentials

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource
3. Click on **"Keys and Endpoint"** in the left menu
4. Copy these 3 values:
   - **Endpoint** (e.g., `https://your-resource-name.openai.azure.com/`)
   - **Key 1** or **Key 2** (either works)
   - **Deployment names** for your models (GPT-4 and Whisper)

## Step 2: Update Your .env File

Open `.env` and replace these values:

\`\`\`bash
# Replace with YOUR actual Azure OpenAI values
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=abc123your-actual-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_WHISPER_DEPLOYMENT_NAME=whisper
\`\`\`

## Step 3: Generate a Secret Key

Run this command to generate a secure SECRET_KEY:

\`\`\`bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
\`\`\`

Copy the output and replace `your-secret-key-here-change-in-production-min-32-chars` in your `.env` file.

## Step 4: Start the Application

### Terminal 1 - Backend (Python)
\`\`\`bash
cd C:\Users\Mayank\Desktop\New folder (2)\medicalscribeaimain
venv\Scripts\activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

### Terminal 2 - Frontend (Next.js)
\`\`\`bash
cd C:\Users\Mayank\Desktop\New folder (2)\medicalscribeaimain
npm run dev
\`\`\`

## Step 5: Test the Application

1. Open browser: `http://localhost:3000/encounters/new`
2. Record or upload audio
3. Click **"Transcribe Audio"** (uses Azure Whisper)
4. Click **"Save & Generate SOAP Note"** (uses Azure GPT-4)
5. Success dialog appears with **"View SOAP Notes"** button
6. Click to see full encounter with ICD-10 codes

## Troubleshooting

### Backend won't start?
- Check that SECRET_KEY is set (at least 32 characters)
- Verify Azure OpenAI credentials are correct
- Make sure `venv` is activated

### Frontend shows 404 errors?
- Ensure backend is running on port 8000
- Check CORS_ORIGINS includes `http://localhost:3000`

### No SOAP notes generated?
- Verify AZURE_OPENAI_DEPLOYMENT_NAME matches your actual deployment
- Check Azure OpenAI quota/billing is active
- Look at backend console for error messages

## Cost Optimization

With Azure OpenAI on Pay-As-You-Go:
- **Whisper transcription**: ~$0.006 per minute of audio
- **GPT-4 SOAP generation**: ~$0.03-0.10 per encounter

**Estimated monthly cost for 100 encounters/month**: $5-15

Much cheaper than full HIPAA-compliant infrastructure!

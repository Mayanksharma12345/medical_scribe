# Minimum Azure Setup Guide - Medical Scribe AI

## Overview
This app uses **ONLY Azure OpenAI** to minimize costs. All other services use free alternatives.

### Cost Breakdown (Monthly)
- **Azure OpenAI**: $10-50 (depends on usage)
- **Database**: $0 (SQLite locally, PostgreSQL optional)
- **Storage**: $0 (local filesystem)
- **Total**: $10-50/month MVP

## What You Need

### 1. Azure OpenAI (5 minutes)

**Step 1: Create Azure Account**
\`\`\`
https://azure.microsoft.com/free/ (free $200 credit)
\`\`\`

**Step 2: Create OpenAI Resource**
\`\`\`
Azure Portal → Create Resource → OpenAI
- Region: East US (cheapest)
- Tier: Standard
- Name: medical-scribe-openai
\`\`\`

**Step 3: Create Deployments**
Create two deployments in your OpenAI resource:

**Deployment 1: GPT-4 (for medical analysis)**
- Deployment name: `gpt-4`
- Model: `gpt-4` (or `gpt-4-turbo` for cheaper)
- Instance count: 1
- Capacity: 5 TPM (Tokens Per Minute)

**Deployment 2: Whisper (for transcription)**
- Deployment name: `whisper`
- Model: `whisper`
- Instance count: 1
- Capacity: 1

**Step 4: Get Your Credentials**
\`\`\`
Azure Portal → OpenAI Resource → Keys and Endpoint
Copy:
- Endpoint: https://your-resource.openai.azure.com/
- Key: [Your API Key]
\`\`\`

**Step 5: Update .env**
\`\`\`
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_WHISPER_DEPLOYMENT_NAME=whisper
\`\`\`

### 2. Everything Else (Already Set Up - No Cost)

**Database**: SQLite (local file)
- No setup needed
- Automatically created on first run
- Scale to PostgreSQL when needed

**Storage**: Local filesystem
- Audio files stored in `./data/recordings`
- Transcripts in `./data/uploads`
- Free unlimited storage

**Encryption**: Disabled for MVP
- Enable only if handling real PHI (Personal Health Information)
- Cost: ~$20/month for Key Vault

**Monitoring**: Disabled for MVP
- Use Application Insights only when in production
- Cost: ~$5/month

**Audit Logs**: Disabled for MVP
- Only needed if HIPAA compliance required
- Enable when rolling out to real users

## Quick Start

1. **Set up Azure OpenAI** (follow steps above)

2. **Update .env file**
\`\`\`bash
AZURE_OPENAI_ENDPOINT=your-endpoint
AZURE_OPENAI_API_KEY=your-key
\`\`\`

3. **Run the app**
\`\`\`bash
docker-compose up
# Frontend: http://localhost:3000
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
\`\`\`

## Scaling Up (When Ready)

When you need to add features:

| Feature | Service | Cost | When |
|---------|---------|------|------|
| User Authentication | Azure AD B2C | $0-5/mo | After MVP |
| Production Database | Azure PostgreSQL | $20-50/mo | After MVP |
| File Storage | Azure Blob Storage | $1-5/mo | High volume |
| Encryption | Azure Key Vault | $0.6/mo | PHI handling |
| Monitoring | Application Insights | $5/mo | Production |
| Audit Logs | Azure Monitor | $5-10/mo | Compliance |

## Monthly Cost Estimation

### Minimum Setup (MVP)
- Azure OpenAI GPT-4: $15-30
- Azure OpenAI Whisper: $5-10
- **Total: $20-40/month**

### Small Production
- Azure OpenAI: $30-50
- PostgreSQL (flexible server): $20
- **Total: $50-70/month**

### Medium Production (+ compliance)
- Azure OpenAI: $50-100
- PostgreSQL: $50
- Encryption (Key Vault): $1
- Monitoring (App Insights): $10
- **Total: $110-160/month**

## FAQ

**Q: Do I need Azure Storage Account?**
A: No. Local filesystem is free and sufficient for MVP. Add later if needed.

**Q: Do I need Key Vault for encryption?**
A: No. Disabled for MVP. Enable only when handling real patient data.

**Q: Can I use OpenAI instead of Azure OpenAI?**
A: Yes, modify `config.py` to use OpenAI API (same cost ~$50/mo for GPT-4).

**Q: How do I monitor costs?**
A: Azure Portal → Cost Management → Set budget alerts at $50/month

**Q: Can I use free Azure tier?**
A: Yes! $200 free credit for first 30 days + always-free services.

## Support

- Azure OpenAI Docs: https://learn.microsoft.com/azure/ai-services/openai/
- Pricing Calculator: https://azure.microsoft.com/pricing/calculator/
- Free Trial: https://azure.microsoft.com/free/

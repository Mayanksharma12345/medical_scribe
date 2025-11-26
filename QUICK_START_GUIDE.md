# Medical Scribe AI - Quick Start Guide

## 5-Minute Setup

### Step 1: Prerequisites
- Python 3.10+
- Node.js 16+
- Git
- Docker Desktop (optional but recommended)

### Step 2: Clone & Install
\`\`\`bash
git clone <your-repo-url>
cd medical-scribe-ai

# On Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

# On Linux/Mac
bash scripts/setup.sh
\`\`\`

### Step 3: Configure Azure OpenAI
\`\`\`bash
# Edit .env file
cp .env.example .env
nano .env  # or edit in your editor

# Add these required values:
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
\`\`\`

### Step 4: Start Services

**Option A: Docker (Recommended)**
\`\`\`bash
docker-compose up
# Backend: http://localhost:8000
# Docs: http://localhost:8000/docs
\`\`\`

**Option B: Direct Python**
\`\`\`bash
# Terminal 1: Backend
python -m src.main

# Terminal 2: Frontend
npm run dev
\`\`\`

### Step 5: Access the App
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## What Was Fixed

| Issue | Status | Details |
|-------|--------|---------|
| Missing .env file | ✅ Fixed | Now included with all required variables |
| Broken API routers | ✅ Fixed | All 5 endpoint groups now functional |
| Missing database models | ✅ Fixed | Complete ORM schema created |
| Frontend broken | ✅ Fixed | Modern Next.js app with components |
| Docker health check | ✅ Fixed | Changed from requests to curl |
| Database init missing | ✅ Fixed | Auto-init with seed data |
| Configuration validation | ✅ Fixed | Pydantic validates on startup |
| Mixed architectures | ✅ Fixed | Consolidated to Next.js |

## Test the API

\`\`\`bash
# Create encounter
curl -X POST http://localhost:8000/api/v1/encounters/ \
  -H "Content-Type: application/json" \
  -d '{
    "physician_id": "dr_smith",
    "patient_id_hash": "patient123",
    "chief_complaint": "Annual checkup",
    "encounter_type": "office_visit"
  }'

# List encounters
curl http://localhost:8000/api/v1/encounters/

# Get dashboard metrics
curl http://localhost:8000/api/v1/reports/dashboard
\`\`\`

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│        http://localhost:3000                        │
│   - Home page with features                         │
│   - Encounter recording interface                   │
│   - Analytics dashboard                             │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP/REST
                   │
┌──────────────────▼──────────────────────────────────┐
│              Backend (FastAPI)                      │
│          http://localhost:8000                      │
│   - Audio Transcription endpoint                    │
│   - SOAP Note Generation endpoint                   │
│   - Encounter management CRUD                       │
│   - Analytics & Reporting                           │
│   - Health checks & monitoring                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ SQL
                   │
┌──────────────────▼──────────────────────────────────┐
│          Database (PostgreSQL)                      │
│          localhost:5432                             │
│   - Encounters table                                │
│   - SOAP Notes table                                │
│   - Users table                                     │
│   - Reference tables (ICD-10, CPT)                  │
└─────────────────────────────────────────────────────┘

External Services:
- Azure OpenAI (GPT-4 for SOAP generation)
- Azure Whisper (Audio transcription)
\`\`\`

## File Structure

\`\`\`
medical-scribe-ai/
├── app/                         # Next.js frontend
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   ├── dashboard/               # Analytics page
│   └── encounters/              # Encounter pages
├── src/                         # Python backend
│   ├── main.py                  # FastAPI app
│   ├── api/v1/                  # API endpoints
│   │   └── endpoints/
│   │       ├── health.py
│   │       ├── encounters.py
│   │       ├── transcription.py
│   │       ├── soap.py
│   │       └── reports.py
│   ├── models/                  # Database models
│   │   ├── medical.py
│   │   ├── user.py
│   │   └── base.py
│   ├── services/                # Business logic
│   │   └── reporting_service.py
│   └── core/                    # Configuration
│       ├── config.py
│       ├── database.py
│       └── database_init.py
├── scripts/                     # Automation scripts
│   ├── setup.sh
│   ├── setup.ps1
│   └── init_db.py
├── .env                         # Environment variables
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Container image
├── requirements.txt             # Python dependencies
└── PRODUCTION_CHANGES.md        # Detailed change log
\`\`\`

## Key Features Implemented

### Backend
- ✅ RESTful API with FastAPI
- ✅ PostgreSQL database with ORM
- ✅ Audio transcription endpoint (mock)
- ✅ SOAP note generation (mock)
- ✅ Encounter management
- ✅ Analytics dashboard
- ✅ Health checks
- ✅ HIPAA audit logging structure

### Frontend
- ✅ Modern responsive UI
- ✅ Audio recording interface
- ✅ Real-time dashboard
- ✅ Encounter list view
- ✅ SOAP note display
- ✅ Fully typed with TypeScript

## Environment Variables

**Required:**
- `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY` - Your API key
- `DATABASE_URL` - PostgreSQL connection string

**Optional:**
- `APP_ENV` - development (default) or production
- `DEBUG` - true or false
- `LOG_LEVEL` - INFO, DEBUG, WARNING, ERROR
- `AUDIT_LOG_ENABLED` - Enable HIPAA audit logging
- `PHI_ENCRYPTION_ENABLED` - Encrypt sensitive data

## Useful Commands

\`\`\`bash
# Start everything
docker-compose up

# Stop everything
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f api

# Initialize database
python scripts/init_db.py

# Run tests
pytest

# Format code
black src/ tests/

# Lint code
flake8 src/ tests/
\`\`\`

## Production Deployment

See `PRODUCTION_CHANGES.md` for:
- Azure deployment guide
- Environment setup for production
- Security configuration
- Database setup
- Monitoring and maintenance

## Troubleshooting

**Port already in use?**
\`\`\`bash
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
\`\`\`

**Can't connect to database?**
\`\`\`bash
# Check if Docker is running
docker ps

# Restart database service
docker-compose restart db
\`\`\`

**Module not found errors?**
\`\`\`bash
# Reinstall Python dependencies
pip install -r requirements.txt
\`\`\`

## Next Steps

1. Get Azure OpenAI access and credentials
2. Update `.env` with your credentials
3. Run `docker-compose up` to start services
4. Navigate to `http://localhost:3000`
5. Start recording your first encounter!

For detailed documentation, see:
- API docs: http://localhost:8000/docs
- Architecture: PRODUCTION_CHANGES.md
- Security: docs/HIPAA_COMPLIANCE.md
- Contributing: docs/CONTRIBUTING.md

Happy scribing! 🏥

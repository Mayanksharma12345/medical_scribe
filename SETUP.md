# Medical Scribe AI - Setup Guide

Complete setup guide for deploying the HIPAA-compliant medical scribe solution.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Azure Environment Setup](#azure-environment-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Prerequisites

### Required Software

- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/downloads)
- **Azure CLI** - [Download](https://docs.microsoft.com/cli/azure/install-azure-cli)
- **Terraform** (for infrastructure) - [Download](https://www.terraform.io/downloads)

### Azure Resources

You'll need an Azure subscription with the following services:
- Azure OpenAI Service
- Azure Key Vault
- Azure Storage Account
- Azure Database for PostgreSQL
- Azure App Service

## Local Development Setup

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/medical-scribe-ai.git
cd medical-scribe-ai
\`\`\`

### 2. Create Virtual Environment

**Windows:**
\`\`\`powershell
python -m venv venv
.\venv\Scripts\activate
\`\`\`

**Linux/Mac:**
\`\`\`bash
python -m venv venv
source venv/bin/activate
\`\`\`

### 3. Install Dependencies

\`\`\`bash
pip install --upgrade pip
pip install -r requirements.txt
\`\`\`

### 4. Configure Environment Variables

\`\`\`bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# On Windows: notepad .env
# On Linux/Mac: nano .env
\`\`\`

**Minimum required variables for local development:**
\`\`\`env
# Application
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-here

# Azure OpenAI (required)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Database (uses Docker Compose)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medicalscribe
\`\`\`

### 5. Start Local Services

\`\`\`bash
# Start PostgreSQL database
docker-compose up -d db

# Wait for database to be ready
# Check with: docker-compose ps
\`\`\`

### 6. Run the Application

\`\`\`bash
# Run directly with Python
python -m src.main

# OR run with Docker Compose (full stack)
docker-compose up
\`\`\`

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

## Azure Environment Setup

### 1. Login to Azure

\`\`\`bash
az login
\`\`\`

### 2. Set Azure Subscription

\`\`\`bash
# List subscriptions
az account list --output table

# Set active subscription
az account set --subscription "Your Subscription Name"
\`\`\`

### 3. Create Azure OpenAI Resource

\`\`\`bash
# Create resource group
az group create \
  --name medical-scribe-rg \
  --location eastus

# Create Azure OpenAI resource
az cognitiveservices account create \
  --name medical-scribe-openai \
  --resource-group medical-scribe-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus

# Deploy GPT-4 model
az cognitiveservices account deployment create \
  --name medical-scribe-openai \
  --resource-group medical-scribe-rg \
  --deployment-name gpt-4 \
  --model-name gpt-4 \
  --model-version "0613" \
  --model-format OpenAI \
  --scale-settings-scale-type "Standard"
\`\`\`

### 4. Deploy Infrastructure with Terraform

\`\`\`bash
cd infrastructure

# Initialize Terraform
terraform init

# Review the plan
terraform plan -var="environment=dev"

# Apply infrastructure
terraform apply -var="environment=dev"

# Note the output values (Key Vault URL, Storage Account, etc.)
\`\`\`

### 5. Configure Azure Key Vault

\`\`\`bash
# Get Key Vault name from Terraform output
KEY_VAULT_NAME=$(terraform output -raw key_vault_name)

# Generate and store encryption key
python -c "from security.encryption import generate_encryption_key; print(generate_encryption_key())" | \
  az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name medical-scribe-encryption-key \
    --value -

# Store other secrets
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name secret-key \
  --value "$(openssl rand -base64 32)"
\`\`\`

## Configuration

### Environment-Specific Settings

#### Development
\`\`\`env
APP_ENV=development
DEBUG=true
AUDIT_LOG_ENABLED=false  # Optional: use local logs only
\`\`\`

#### Production
\`\`\`env
APP_ENV=production
DEBUG=false
AUDIT_LOG_ENABLED=true
PHI_ENCRYPTION_ENABLED=true
AZURE_KEY_VAULT_URL=https://your-keyvault.vault.azure.net/
AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccount
\`\`\`

### Security Configuration

1. **Generate Secret Key**
   \`\`\`bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   \`\`\`

2. **Configure MFA** (Production)
   - Enable Azure AD multi-factor authentication
   - Configure in Azure Portal

3. **Set Up Network Security**
   - Configure Virtual Network in Azure
   - Set up Private Endpoints
   - Configure firewall rules

## Running the Application

### Local Development

\`\`\`bash
# With auto-reload for development
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# OR use the provided script
python -m src.main
\`\`\`

### With Docker

\`\`\`bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
\`\`\`

### Production (Azure)

The application will be automatically deployed via GitHub Actions CI/CD pipeline when pushing to `main` branch.

## Testing

### Run All Tests

\`\`\`bash
pytest
\`\`\`

### Run with Coverage

\`\`\`bash
pytest --cov=src --cov=security --cov-report=html
# Open htmlcov/index.html to view coverage report
\`\`\`

### Run Specific Test Categories

\`\`\`bash
# Compliance tests only
pytest -m compliance

# Integration tests only
pytest -m integration

# Skip slow tests
pytest -m "not slow"
\`\`\`

### Code Quality Checks

\`\`\`bash
# Format code
black src/ tests/ security/

# Lint
flake8 src/ tests/ security/ --max-line-length=100

# Type checking
mypy src/ --ignore-missing-imports

# Security scanning
bandit -r src/ security/
\`\`\`

## Deployment

### Manual Deployment to Azure

\`\`\`bash
# Login to Azure
az login

# Build Docker image
docker build -t medical-scribe-ai:latest .

# Tag for Azure Container Registry
docker tag medical-scribe-ai:latest yourregistry.azurecr.io/medical-scribe-ai:latest

# Push to registry
az acr login --name yourregistry
docker push yourregistry.azurecr.io/medical-scribe-ai:latest

# Deploy to App Service
az webapp config container set \
  --name medical-scribe-ai-app \
  --resource-group medical-scribe-rg \
  --docker-custom-image-name yourregistry.azurecr.io/medical-scribe-ai:latest
\`\`\`

### CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:

1. Runs tests and quality checks
2. Builds Docker image
3. Deploys to Azure (on push to `main`)

**Setup GitHub Secrets:**
\`\`\`bash
# Create service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "medical-scribe-github" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/medical-scribe-rg \
  --sdk-auth

# Add the output JSON as AZURE_CREDENTIALS secret in GitHub
\`\`\`

## Verification

### Health Check

\`\`\`bash
curl http://localhost:8000/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "healthy",
  "service": "medical-scribe-ai",
  "version": "0.1.0"
}
\`\`\`

### API Documentation

Visit: http://localhost:8000/docs

### Test Encryption

\`\`\`python
from security.encryption import PHIEncryption

encryption = PHIEncryption()
encrypted = encryption.encrypt("Test PHI data")
decrypted = encryption.decrypt(encrypted)
assert decrypted == "Test PHI data"
\`\`\`

## Troubleshooting

### Common Issues

**Database Connection Failed**
\`\`\`bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
\`\`\`

**Azure OpenAI Connection Failed**
- Verify API key is correct
- Check endpoint URL format
- Ensure deployment name matches model name
- Check Azure OpenAI quota and limits

**Import Errors**
\`\`\`bash
# Ensure you're in the project root
cd medical-scribe-ai

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
\`\`\`

**Port Already in Use**
\`\`\`bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000

# Linux/Mac:
lsof -ti:8000 | xargs kill
\`\`\`

## Next Steps

1. **Configure Authentication**: Set up Azure AD or OAuth2
2. **Add Medical NLP Models**: Install spaCy and MedCAT models
3. **Implement API Endpoints**: Add transcription and SOAP note generation
4. **Set Up Monitoring**: Configure Application Insights alerts
5. **Review Compliance**: Complete HIPAA compliance checklist

## Support

- **Documentation**: See `docs/` directory
- **Issues**: Open a GitHub issue
- **Security**: Email security@yourdomain.com
- **Contributing**: See `docs/CONTRIBUTING.md`

---

**Need help?** Check the [main README](README.md) or open an issue on GitHub.

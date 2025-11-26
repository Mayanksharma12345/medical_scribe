# Medical Scribe AI - Quick Start Script
# This script helps you set up the development environment

Write-Host "🏥 Medical Scribe AI - Quick Start" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.10+" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Check Docker (optional)
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
    $hasDocker = $true
} catch {
    Write-Host "⚠ Docker not found (optional for development)" -ForegroundColor Yellow
    $hasDocker = $false
}

Write-Host ""
Write-Host "Choose setup option:" -ForegroundColor Cyan
Write-Host "1. Quick Demo (Backend only, SQLite database)"
Write-Host "2. Full Development (Backend + Frontend + PostgreSQL)"
Write-Host "3. Docker Development (Everything in containers)"
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Setting up Quick Demo..." -ForegroundColor Cyan
        
        # Create virtual environment
        Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
        python -m venv venv
        
        # Activate virtual environment
        Write-Host "Activating virtual environment..." -ForegroundColor Yellow
        & .\venv\Scripts\Activate.ps1
        
        # Install dependencies
        Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
        pip install --upgrade pip
        pip install -r requirements.txt
        
        # Create .env file
        if (-not (Test-Path ".env")) {
            Write-Host "Creating .env file..." -ForegroundColor Yellow
            Copy-Item ".env.example" ".env"
            
            Write-Host ""
            Write-Host "⚠️  IMPORTANT: Edit .env file with your Azure OpenAI credentials" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Required settings:" -ForegroundColor Cyan
            Write-Host "  AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/"
            Write-Host "  AZURE_OPENAI_API_KEY=your-api-key-here"
            Write-Host "  SECRET_KEY=any-random-string-for-development"
            Write-Host ""
            
            $continue = Read-Host "Press Enter when you've updated .env (or Ctrl+C to exit)"
        }
        
        # Run backend
        Write-Host ""
        Write-Host "Starting backend server..." -ForegroundColor Green
        Write-Host "Access API at: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "API Docs at: http://localhost:8000/docs" -ForegroundColor Cyan
        Write-Host ""
        python -m src.main
    }
    
    "2" {
        Write-Host ""
        Write-Host "Setting up Full Development Environment..." -ForegroundColor Cyan
        
        # Backend setup
        Write-Host ""
        Write-Host "1/3 Setting up Backend..." -ForegroundColor Yellow
        python -m venv venv
        & .\venv\Scripts\Activate.ps1
        pip install --upgrade pip
        pip install -r requirements.txt
        
        # Frontend setup
        Write-Host ""
        Write-Host "2/3 Setting up Frontend..." -ForegroundColor Yellow
        Set-Location frontend
        npm install
        Set-Location ..
        
        # Database setup
        Write-Host ""
        Write-Host "3/3 Setting up Database..." -ForegroundColor Yellow
        Write-Host "Starting PostgreSQL with Docker..." -ForegroundColor Yellow
        docker-compose up -d db
        
        # Create .env
        if (-not (Test-Path ".env")) {
            Copy-Item ".env.example" ".env"
            Write-Host ""
            Write-Host "⚠️  Edit .env file with your settings" -ForegroundColor Yellow
            notepad .env
        }
        
        Write-Host ""
        Write-Host "Setup complete! 🎉" -ForegroundColor Green
        Write-Host ""
        Write-Host "To start development:" -ForegroundColor Cyan
        Write-Host "  Terminal 1: python -m src.main          (Backend on :8000)"
        Write-Host "  Terminal 2: cd frontend && npm start    (Frontend on :3000)"
        Write-Host ""
    }
    
    "3" {
        if (-not $hasDocker) {
            Write-Host "Docker is required for this option" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        Write-Host "Starting Docker Development Environment..." -ForegroundColor Cyan
        
        # Create .env
        if (-not (Test-Path ".env")) {
            Copy-Item ".env.example" ".env"
            Write-Host "⚠️  Edit .env file with your Azure OpenAI credentials" -ForegroundColor Yellow
            notepad .env
        }
        
        # Start docker-compose
        Write-Host "Starting all services..." -ForegroundColor Yellow
        docker-compose up --build
    }
    
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

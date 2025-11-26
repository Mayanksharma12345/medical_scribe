# Contributing to Medical Scribe AI

Thank you for your interest in contributing to Medical Scribe AI! This document provides guidelines and instructions for contributing to this HIPAA-compliant medical scribe solution.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Docker and Docker Compose
- Git
- Azure account (for full deployment testing)

### Development Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/medical-scribe-ai.git
   cd medical-scribe-ai
   \`\`\`

2. **Create virtual environment**
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

5. **Run with Docker Compose**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency production fixes

### Making Changes

1. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation

3. **Test your changes**
   \`\`\`bash
   # Run all tests
   pytest
   
   # Run with coverage
   pytest --cov=src --cov-report=html
   
   # Run compliance tests
   pytest -m compliance
   \`\`\`

4. **Code quality checks**
   \`\`\`bash
   # Format code
   black src/ tests/ security/
   
   # Lint
   flake8 src/ tests/ security/
   
   # Type checking
   mypy src/
   \`\`\`

5. **Commit your changes**
   \`\`\`bash
   git add .
   git commit -m "feat: description of your feature"
   \`\`\`

   **Commit Message Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Test additions/changes
   - `refactor:` Code refactoring
   - `security:` Security improvements
   - `compliance:` HIPAA/HITRUST compliance updates

6. **Push and create Pull Request**
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

## Security and Compliance Guidelines

### Critical Rules for PHI Handling

⚠️ **NEVER commit PHI or sensitive data to the repository**

1. **Encryption**
   - All PHI must be encrypted at rest (AES-256-GCM)
   - Use the `PHIEncryption` class for all PHI encryption
   - Store encryption keys in Azure Key Vault only

2. **Logging**
   - NEVER log PHI in plain text
   - Use hashed identifiers for correlation
   - Log all PHI access with audit events

3. **Testing**
   - Use synthetic/fake data only
   - Never use real patient data in tests
   - Mark compliance tests with `@pytest.mark.compliance`

4. **API Design**
   - Never include PHI in URLs or query parameters
   - Use POST with encrypted payloads
   - Implement proper authentication and authorization

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] No PHI in logs
- [ ] All PHI is encrypted
- [ ] Audit logging added for PHI access
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] No security vulnerabilities
- [ ] Compliance requirements met

## Testing Guidelines

### Test Structure

\`\`\`
tests/
├── test_encryption.py      # Encryption tests
├── test_audit.py            # Audit logging tests
├── test_api.py              # API endpoint tests
├── compliance/              # HIPAA compliance tests
└── integration/             # Integration tests
\`\`\`

### Writing Tests

\`\`\`python
import pytest

class TestMyFeature:
    def test_basic_functionality(self):
        """Test basic feature behavior"""
        # Arrange
        data = setup_test_data()
        
        # Act
        result = my_feature(data)
        
        # Assert
        assert result.is_valid()

@pytest.mark.compliance
def test_phi_encryption():
    """Test that PHI is always encrypted"""
    # Compliance-specific test
    pass
\`\`\`

### Running Tests

\`\`\`bash
# All tests
pytest

# Specific test file
pytest tests/test_encryption.py

# Specific test
pytest tests/test_encryption.py::TestPHIEncryption::test_encrypt_decrypt

# Compliance tests only
pytest -m compliance

# With coverage
pytest --cov=src --cov-report=html
\`\`\`

## Documentation

### Code Documentation

- Use docstrings for all functions, classes, and modules
- Follow Google-style docstring format
- Include type hints

\`\`\`python
def encrypt_phi(data: str, patient_id: str) -> str:
    """
    Encrypt Protected Health Information.
    
    Args:
        data: PHI data to encrypt
        patient_id: Patient identifier for AAD
        
    Returns:
        str: Encrypted data (base64-encoded)
        
    Raises:
        EncryptionError: If encryption fails
    """
    pass
\`\`\`

### Updating Documentation

- Update README.md for major features
- Update API documentation in docstrings
- Update HIPAA/HITRUST compliance docs if applicable
- Add examples to docs/ directory

## Pull Request Process

1. **Before Creating PR**
   - Ensure all tests pass
   - Run code quality checks
   - Update documentation
   - Rebase on latest `develop`

2. **PR Description Template**
   \`\`\`markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   - [ ] Security/Compliance update
   
   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Compliance tests added/updated
   - [ ] Manual testing performed
   
   ## Compliance Impact
   - [ ] No PHI handling changes
   - [ ] New PHI handling (encryption verified)
   - [ ] Audit logging updated
   - [ ] Security controls updated
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No merge conflicts
   \`\`\`

3. **Review Process**
   - At least one approval required
   - All CI checks must pass
   - Security review for PHI-related changes
   - Compliance review for HIPAA-related changes

## Security Vulnerability Reporting

**DO NOT open public issues for security vulnerabilities**

Report security issues privately to: security@yourdomain.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open a GitHub Issue
- **Feature Requests**: Open a GitHub Issue with `enhancement` label
- **Security Issues**: Email security@yourdomain.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Medical Scribe AI! 🏥

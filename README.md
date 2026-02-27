# AI Learning Platform - Backend Configuration

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy the example environment file and update with your actual values:

```bash
copy .env.example .env
```

Edit `.env` and replace placeholder values with your actual API keys and configuration.

### 3. Required Environment Variables

- `GROQ_API_KEY` - Your Groq API key (required)
- `HUGGINGFACE_API_KEY` - Your HuggingFace API key (required)
- `AWS_REGION` - AWS region (default: us-east-1)
- `APP_ENV` - Application environment: development/staging/production
- `DEBUG` - Debug mode: true/false

## Usage

### Import Settings

```python
from app.core.config import settings

# Access configuration
api_key = settings.GROQ_API_KEY
region = settings.AWS_REGION
is_debug = settings.DEBUG
```

### Environment Checks

```python
if settings.is_production():
    # Production logic
    pass

if settings.is_development():
    # Development logic
    pass
```

## Adding New Configuration

To add new environment variables:

1. Add to `.env` and `.env.example`
2. Add property to `Settings` class in `app/core/config.py`
3. Use `_get_required_env()` for required variables
4. Use `os.getenv()` with defaults for optional variables

## Security Notes

- Never commit `.env` file to version control
- `.env` is already in `.gitignore`
- Use `.env.example` as a template for team members
- Rotate API keys regularly in production

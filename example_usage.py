"""
Example usage of the centralized configuration system.

This demonstrates how to use the settings object throughout your application.
"""

from app.core.config import settings


def example_api_service():
    """Example: Using API keys in a service."""
    api_key = settings.GROQ_API_KEY
    # Use the API key for your service
    return f"Using GROQ API with region: {settings.AWS_REGION}"


def example_conditional_logic():
    """Example: Conditional logic based on environment."""
    if settings.is_production():
        # Production-specific logic
        return "Running in production mode"
    elif settings.is_development():
        # Development-specific logic
        return "Running in development mode with DEBUG=" + str(settings.DEBUG)


def example_optional_config():
    """Example: Using optional configuration."""
    if settings.DATABASE_URL:
        # Database is configured
        return f"Connecting to database: {settings.DATABASE_URL}"
    else:
        return "No database configured"


if __name__ == "__main__":
    # Access configuration values
    print(f"App Environment: {settings.APP_ENV}")
    print(f"Debug Mode: {settings.DEBUG}")
    print(f"AWS Region: {settings.AWS_REGION}")
    print(f"Is Production: {settings.is_production()}")
    
    # Run examples
    print("\n" + example_api_service())
    print(example_conditional_logic())
    print(example_optional_config())

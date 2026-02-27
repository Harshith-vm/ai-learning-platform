import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """
    Centralized configuration management for the AI Learning Platform.
    
    This class loads and validates all environment variables required by the application.
    It provides a single source of truth for configuration across the entire project.
    """
    
    def __init__(self):
        # Critical API Keys (Required)
        self.GROQ_API_KEY: str = self._get_required_env("GROQ_API_KEY")
        self.HUGGINGFACE_API_KEY: str = self._get_required_env("HUGGINGFACE_API_KEY")
        
        # AWS Configuration
        self.AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
        
        # Application Environment
        self.APP_ENV: str = os.getenv("APP_ENV", "development")
        self.DEBUG: bool = self._parse_bool(os.getenv("DEBUG", "false"))
        
        # Future Configuration (Optional)
        self.DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
        self.REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
        self.S3_BUCKET_NAME: Optional[str] = os.getenv("S3_BUCKET_NAME")
        
        # File Upload Configuration
        self.MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
        
        self.LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")
        # Validate environment
        self._validate_environment()
    
    @staticmethod
    def _get_required_env(key: str) -> str:
        """
        Retrieve a required environment variable.
        
        Args:
            key: The environment variable name
            
        Returns:
            The environment variable value
            
        Raises:
            ValueError: If the environment variable is not set or is empty
        """
        value = os.getenv(key)
        if not value:
            raise ValueError(
                f"Missing required environment variable: {key}. "
                f"Please set it in your .env file or environment."
            )
        return value
    
    @staticmethod
    def _parse_bool(value: str) -> bool:
        """
        Parse a string value into a boolean.
        
        Args:
            value: String representation of boolean
            
        Returns:
            Boolean value
        """
        return value.lower() in ("true", "1", "yes", "on")
    
    def _validate_environment(self) -> None:
        """
        Validate the application environment configuration.
        
        Raises:
            ValueError: If APP_ENV is not a valid environment
        """
        valid_environments = {"development", "staging", "production"}
        if self.APP_ENV not in valid_environments:
            raise ValueError(
                f"Invalid APP_ENV: {self.APP_ENV}. "
                f"Must be one of: {', '.join(valid_environments)}"
            )
    
    def is_production(self) -> bool:
        """Check if the application is running in production mode."""
        return self.APP_ENV == "production"
    
    def is_development(self) -> bool:
        """Check if the application is running in development mode."""
        return self.APP_ENV == "development"


# Singleton instance - import this in other modules
settings = Settings()

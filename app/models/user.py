"""
User model for authentication and user management.
"""
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class User(Base):
    """
    User model for storing user account information.
    
    Attributes:
        id: Primary key
        email: Unique email address
        password_hash: Hashed password (never store plain text)
        persona: User persona type (beginner, student, senior_dev)
        learning_style: User's preferred learning style (general, visual, hands-on, etc.)
        preferred_language: User's preferred programming language (python, javascript, etc.)
        created_at: Timestamp of account creation
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    persona = Column(String, default="student")
    learning_style = Column(String, default="general")
    preferred_language = Column(String, default="python")
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, persona={self.persona}, learning_style={self.learning_style})>"

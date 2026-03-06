"""
Flashcard History model for storing user-generated flashcards.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class FlashcardHistory(Base):
    """
    Model for storing flashcard generation history per user.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        document_id: The document ID from which flashcards were generated
        flashcards: JSON string of generated flashcards
        created_at: Timestamp of generation
    """
    __tablename__ = "flashcard_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String, nullable=False, index=True)
    flashcards = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<FlashcardHistory(id={self.id}, user_id={self.user_id}, document_id={self.document_id})>"

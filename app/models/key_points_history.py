"""
Key Points History model for storing user-generated key points.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class KeyPointsHistory(Base):
    """
    Model for storing key points extraction history per user.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        document_id: The document ID from which key points were extracted
        key_points: JSON string of extracted key points
        created_at: Timestamp of extraction
    """
    __tablename__ = "key_points_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String, nullable=False, index=True)
    key_points = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<KeyPointsHistory(id={self.id}, user_id={self.user_id}, document_id={self.document_id})>"

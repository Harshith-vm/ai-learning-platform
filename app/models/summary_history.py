"""
Summary History model for storing user-generated summaries.
Task 72: Save summaries per user
"""
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from datetime import datetime
import pytz
from app.database import Base

# IST timezone
IST = pytz.timezone("Asia/Kolkata")


class SummaryHistory(Base):
    """
    Model for storing summary generation history per user.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        original_text: The original text that was summarized
        summary_text: The generated summary text
        created_at: Timestamp of summary generation (IST)
    """
    __tablename__ = "summary_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    original_text = Column(Text, nullable=False)
    summary_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(IST), nullable=False)

    def __repr__(self):
        return f"<SummaryHistory(id={self.id}, user_id={self.user_id}, created_at={self.created_at})>"

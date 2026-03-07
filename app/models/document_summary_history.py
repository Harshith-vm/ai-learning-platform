"""
Document Summary History model for storing user-generated document summaries.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
import pytz
from app.database import Base

# IST timezone
IST = pytz.timezone("Asia/Kolkata")


class DocumentSummaryHistory(Base):
    """
    Model for storing document summary generation history per user.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        document_id: The document ID that was summarized
        title: Generated summary title
        summary_text: The generated summary text
        main_themes: JSON string of main themes
        created_at: Timestamp of summary generation (IST)
    """
    __tablename__ = "document_summary_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    summary_text = Column(Text, nullable=False)
    main_themes = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=lambda: datetime.now(IST), nullable=False)

    def __repr__(self):
        return f"<DocumentSummaryHistory(id={self.id}, user_id={self.user_id}, document_id={self.document_id})>"

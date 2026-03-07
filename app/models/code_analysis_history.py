"""
Code Analysis History model for storing user code analysis results.
Task 74: Save code analyses per user
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
import pytz
from app.database import Base

# IST timezone
IST = pytz.timezone("Asia/Kolkata")


class CodeAnalysisHistory(Base):
    """
    Model for storing code analysis results per user.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        analysis_type: Type of analysis (explain_code, refactor_code, improve_code, etc.)
        input_code: The original code that was analyzed
        result_output: The analysis result (JSON string or text)
        language: Programming language (optional)
        session_id: Code session identifier (optional)
        created_at: Timestamp of analysis (IST)
    """
    __tablename__ = "code_analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    analysis_type = Column(String, nullable=False, index=True)
    input_code = Column(Text, nullable=False)
    result_output = Column(Text, nullable=False)
    language = Column(String, nullable=True)
    session_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(IST), nullable=False)

    def __repr__(self):
        return f"<CodeAnalysisHistory(id={self.id}, user_id={self.user_id}, analysis_type={self.analysis_type})>"

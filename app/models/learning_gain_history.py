"""
Learning Gain History model for storing user learning progress.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
import pytz
from app.database import Base

# IST timezone
IST = pytz.timezone("Asia/Kolkata")


class LearningGainHistory(Base):
    """
    Model for storing learning gain results per user.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        document_id: The document ID for the learning gain test
        pre_test_score: Pre-test score percentage
        post_test_score: Post-test score percentage
        learning_gain: Calculated learning gain percentage
        created_at: Timestamp of post-test completion (IST)
    """
    __tablename__ = "learning_gain_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String, nullable=False, index=True)
    pre_test_score = Column(Float, nullable=False)
    post_test_score = Column(Float, nullable=False)
    learning_gain = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(IST), nullable=False)

    def __repr__(self):
        return f"<LearningGainHistory(id={self.id}, user_id={self.user_id}, learning_gain={self.learning_gain}%)>"

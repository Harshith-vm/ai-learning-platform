"""
Database migration script for all history tables
Creates tables for document summaries, key points, flashcards, and learning gain history
"""
from app.database import engine, Base
from app.models.document_summary_history import DocumentSummaryHistory
from app.models.key_points_history import KeyPointsHistory
from app.models.flashcard_history import FlashcardHistory
from app.models.learning_gain_history import LearningGainHistory
from app.models.user import User

def migrate_database():
    """
    Create or update database tables with all history models.
    This will create the following tables if they don't exist:
    - document_summary_history
    - key_points_history
    - flashcard_history
    - learning_gain_history
    """
    print("Starting database migration for history tables...")
    print("Creating history tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✓ Database migration completed successfully!")
        print("\nNew tables created:")
        print("  - document_summary_history")
        print("    Columns: id, user_id, document_id, title, summary_text, main_themes, created_at")
        print("\n  - key_points_history")
        print("    Columns: id, user_id, document_id, key_points, created_at")
        print("\n  - flashcard_history")
        print("    Columns: id, user_id, document_id, flashcards, created_at")
        print("\n  - learning_gain_history")
        print("    Columns: id, user_id, document_id, pre_test_score, post_test_score, learning_gain, created_at")
        print("\nAll content generation will now be saved to the database and linked to users.")
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_database()

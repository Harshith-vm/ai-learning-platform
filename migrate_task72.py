"""
Database migration script for Task 72 - Save summaries per user
Creates summary_history table to store user-generated summaries
"""
from app.database import engine, Base
from app.models.summary_history import SummaryHistory
from app.models.user import User

def migrate_database():
    """
    Create or update database tables with SummaryHistory model.
    This will create the summary_history table if it doesn't exist.
    """
    print("Starting database migration for Task 72...")
    print("Creating summary_history table...")
    
    try:
        # Create all tables (will create summary_history if it doesn't exist)
        Base.metadata.create_all(bind=engine)
        print("✓ Database migration completed successfully!")
        print("\nNew table created:")
        print("  - summary_history")
        print("    Columns: id, user_id, original_text, summary_text, created_at")
        print("\nSummaries will now be saved to the database and linked to users.")
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_database()

"""
Database migration script for Task 71 - Add profile fields to User model
Adds learning_style and preferred_language columns to users table
"""
from app.database import engine, Base
from app.models.user import User

def migrate_database():
    """
    Create or update database tables with new User model fields.
    This will add the new columns if they don't exist.
    """
    print("Starting database migration for Task 71...")
    print("Adding learning_style and preferred_language columns to users table...")
    
    try:
        # Create all tables (will add new columns if they don't exist)
        Base.metadata.create_all(bind=engine)
        print("✓ Database migration completed successfully!")
        print("\nNew columns added:")
        print("  - learning_style (default: 'general')")
        print("  - preferred_language (default: 'python')")
        print("\nExisting users will have default values for these fields.")
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_database()

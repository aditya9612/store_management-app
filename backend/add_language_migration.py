#!/usr/bin/env python3
"""
Database migration script to add preferred_language column to owners table.
Run this script to make the necessary database changes.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import os

def run_migration():
    """Run the database migration using SQLAlchemy."""
    try:
        # Get database URL from environment or use default
        database_url = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/store_apps_db")

        print(f"Connecting to database: {database_url.replace('root:root@', 'root:***@')}")

        # Create engine
        engine = create_engine(database_url)

        with engine.connect() as connection:
            print("✅ Connected to database successfully!")

            # Check if preferred_language column already exists
            print("🔄 Checking if preferred_language column exists...")
            result = connection.execute(text("SHOW COLUMNS FROM owners LIKE 'preferred_language'"))
            column_exists = result.fetchone()

            if not column_exists:
                # Add preferred_language column
                print("🔄 Adding preferred_language column to owners table...")
                connection.execute(text("ALTER TABLE owners ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en' NULL;"))
                print("✅ preferred_language column added")
            else:
                print("✅ preferred_language column already exists")

            # Commit all changes
            connection.commit()
            print("\n🎉 Database migration completed successfully!")
            print("\nThe following changes were made:")
            print("• owners.preferred_language column verified/added (for language preferences)")

    except SQLAlchemyError as e:
        print(f"❌ Database error: {e}")
        print("\nPlease make sure:")
        print("1. MySQL server is running")
        print("2. Database 'store_apps_db' exists")
        print("3. User credentials are correct")
        print("4. The database user has ALTER TABLE permissions")

    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    print("🔧 Running database migration for language preferences...")
    run_migration()


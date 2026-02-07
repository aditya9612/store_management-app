#!/usr/bin/env python3
"""
Database migration script to update order_items table for manual products support.
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

            # Step 1: Make product_id nullable
            print("🔄 Making product_id column nullable...")
            connection.execute(text('ALTER TABLE order_items MODIFY COLUMN product_id INT NULL;'))
            print("✅ product_id column is now nullable")

            # Step 2: Add name column
            print("🔄 Adding name column...")
            connection.execute(text('ALTER TABLE order_items ADD COLUMN name VARCHAR(255) NULL;'))
            print("✅ name column added")

            # Step 3: Add description column
            print("🔄 Adding description column...")
            connection.execute(text('ALTER TABLE order_items ADD COLUMN description VARCHAR(500) NULL;'))
            print("✅ description column added")

            # Step 4: Check if discount column exists in orders table
            print("🔄 Checking orders table for discount column...")
            result = connection.execute(text("SHOW COLUMNS FROM orders LIKE 'discount'"))
            column_exists = result.fetchone()

            if not column_exists:
                print("🔄 Adding discount column to orders table...")
                connection.execute(text('ALTER TABLE orders ADD COLUMN discount FLOAT DEFAULT 0.0;'))
                print("✅ discount column added to orders table")
            else:
                print("✅ discount column already exists in orders table")

            # Commit all changes
            connection.commit()
            print("\n🎉 Database migration completed successfully!")
            print("\nThe following changes were made:")
            print("• order_items.product_id is now nullable (for manual products)")
            print("• order_items.name column added (for manual product names)")
            print("• order_items.description column added (for manual product descriptions)")
            print("• orders.discount column verified/added (for order-level discounts)")

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
    print("🔧 Running database migration for manual products support...")
    run_migration()

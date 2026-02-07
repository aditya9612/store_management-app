#!/usr/bin/env python3
"""
Simple database migration script using the same setup as FastAPI app.
Run: python simple_migration.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/store_apps_db")
print(f"Using database: {DATABASE_URL}")

try:
    # Create engine (same as FastAPI app)
    engine = create_engine(DATABASE_URL)

    with engine.connect() as connection:
        print("✅ Connected to database successfully!")

        # Check if order_items table exists
        result = connection.execute(text("SHOW TABLES LIKE 'order_items'"))
        if not result.fetchone():
            print("❌ order_items table doesn't exist!")
            print("Please run the initial database setup first.")
            sys.exit(1)

        # Make product_id nullable
        print("🔄 Making product_id nullable...")
        connection.execute(text("ALTER TABLE order_items MODIFY COLUMN product_id INT NULL"))
        print("✅ product_id is now nullable")

        # Add name column if it doesn't exist
        result = connection.execute(text("SHOW COLUMNS FROM order_items LIKE 'name'"))
        if not result.fetchone():
            connection.execute(text("ALTER TABLE order_items ADD COLUMN name VARCHAR(255) NULL"))
            print("✅ name column added")
        else:
            print("✅ name column already exists")

        # Add description column if it doesn't exist
        result = connection.execute(text("SHOW COLUMNS FROM order_items LIKE 'description'"))
        if not result.fetchone():
            connection.execute(text("ALTER TABLE order_items ADD COLUMN description VARCHAR(500) NULL"))
            print("✅ description column added")
        else:
            print("✅ description column already exists")

        # Check orders table for discount column
        result = connection.execute(text("SHOW COLUMNS FROM orders LIKE 'discount'"))
        if not result.fetchone():
            connection.execute(text("ALTER TABLE orders ADD COLUMN discount FLOAT DEFAULT 0.0"))
            print("✅ discount column added to orders table")
        else:
            print("✅ discount column already exists in orders table")

        # Commit changes
        connection.commit()
        print("\n🎉 Migration completed successfully!")
        print("\nYou can now create orders with both catalog and manual products!")

except Exception as e:
    print(f"❌ Error: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure MySQL server is running")
    print("2. Check if database 'store_apps_db' exists")
    print("3. Verify the database credentials in .env file")
    print("4. Try running: mysql -u root -p store_apps_db < manual_migration.sql")

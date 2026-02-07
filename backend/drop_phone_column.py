"""
Migration script to drop the redundant phone column from admins table
"""
from sqlalchemy import text
from app.database import SessionLocal

def drop_phone_column():
    """Drop the phone column from admins table"""
    db = SessionLocal()
    
    try:
        print("🔧 Dropping phone column from admins table...")
        
        # Check if column exists first
        result = db.execute(text("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'admins' 
            AND COLUMN_NAME = 'phone'
        """))
        
        if result.fetchone():
            # Drop the phone column
            db.execute(text("ALTER TABLE admins DROP COLUMN phone"))
            db.commit()
            print("✅ Phone column dropped successfully!")
            print("   Now using 'mobile' as the only phone number field.")
        else:
            print("ℹ️  Phone column doesn't exist. No action needed.")
        
    except Exception as e:
        print(f"❌ Error dropping phone column: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 Starting phone column removal migration...\n")
    drop_phone_column()
    print("\n✅ Migration completed!\n")

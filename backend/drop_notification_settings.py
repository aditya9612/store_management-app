"""
Migration script to drop the notification_settings table
"""
from sqlalchemy import text
from app.database import SessionLocal

def drop_notification_settings_table():
    """Drop the notification_settings table"""
    db = SessionLocal()
    
    try:
        print("🔧 Dropping notification_settings table...")
        
        # Check if table exists first
        result = db.execute(text("""
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'notification_settings'
        """))
        
        if result.fetchone():
            # Drop the notification_settings table
            db.execute(text("DROP TABLE notification_settings"))
            db.commit()
            print("✅ notification_settings table dropped successfully!")
        else:
            print("ℹ️  notification_settings table doesn't exist. No action needed.")
        
    except Exception as e:
        print(f"❌ Error dropping notification_settings table: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 Starting notification_settings table removal migration...\n")
    drop_notification_settings_table()
    print("\n✅ Migration completed!\n")

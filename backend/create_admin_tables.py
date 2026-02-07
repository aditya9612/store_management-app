"""
Migration script to create admin and settings tables
"""
from app.database import engine
from app.models import Base, Admin, CompanySettings, NotificationSettings
import bcrypt

def create_tables():
    """Create all tables including new admin tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

def create_default_admin():
    """Create default admin user"""
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(Admin).first()
        if existing_admin:
            print("ℹ️  Admin user already exists")
            return
        
        # Create default admin
        password = "admin123"
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        admin = Admin(
            name="Administrator",
            email="admin@company.com",
            mobile="1234567890",
            password_hash=password_hash,
            phone="",
            address="",
            role="Super Admin"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Default admin created successfully!")
        print(f"   Email: admin@company.com")
        print(f"   Mobile: 1234567890")
        print(f"   Password: admin123")
        
        return admin
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

def create_default_settings(admin_id):
    """Create default company and notification settings"""
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Check if company settings exist
        existing_settings = db.query(CompanySettings).first()
        if not existing_settings:
            settings = CompanySettings(
                company_name="Shekru Labs India",
                company_email="contact@shekrulabs.com",
                company_phone="",
                company_address="",
                timezone="Asia/Kolkata",
                currency="INR",
                language="en"
            )
            db.add(settings)
            db.commit()
            print("✅ Default company settings created!")
        else:
            print("ℹ️  Company settings already exist")
        
        # Check if notification settings exist
        existing_notif = db.query(NotificationSettings).filter(
            NotificationSettings.admin_id == admin_id
        ).first()
        
        if not existing_notif:
            notif_settings = NotificationSettings(
                admin_id=admin_id,
                email_notifications=1,
                sms_notifications=0,
                owner_status_changes=1,
                shop_status_changes=1,
                system_alerts=1
            )
            db.add(notif_settings)
            db.commit()
            print("✅ Default notification settings created!")
        else:
            print("ℹ️  Notification settings already exist")
            
    except Exception as e:
        print(f"❌ Error creating settings: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 Starting admin tables migration...\n")
    
    # Step 1: Create tables
    create_tables()
    
    # Step 2: Create default admin
    admin = create_default_admin()
    
    # Step 3: Create default settings
    if admin:
        create_default_settings(admin.id)
    
    print("\n✅ Migration completed successfully!\n")

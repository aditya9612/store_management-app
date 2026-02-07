"""
Fix admin tables schema by dropping and recreating them
"""
from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models import Admin, CompanySettings
import bcrypt

def drop_and_recreate_tables():
    """Drop and recreate admin tables with correct schema"""
    db = SessionLocal()
    
    try:
        print("🗑️  Dropping existing admin tables...")
        
        # Drop tables in correct order (child tables first)
        tables_to_drop = [
            'company_settings',
            'admins'
        ]
        
        for table in tables_to_drop:
            try:
                db.execute(text(f"DROP TABLE IF EXISTS {table}"))
                print(f"   ✓ Dropped {table}")
            except Exception as e:
                print(f"   ⚠️  Could not drop {table}: {e}")
        
        db.commit()
        print("✅ Tables dropped successfully!")
        
        # Recreate tables with correct schema
        print("\n🔨 Creating tables with correct schema...")
        
        # Create admins table
        db.execute(text("""
            CREATE TABLE admins (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                mobile VARCHAR(15) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                address VARCHAR(255),
                `role` VARCHAR(50) DEFAULT 'Super Admin',
                otp_code VARCHAR(6),
                otp_expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """))
        print("   ✓ Created admins table")
        
        # Create company_settings table
        db.execute(text("""
            CREATE TABLE company_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                company_name VARCHAR(200) NOT NULL DEFAULT 'Company Inc.',
                company_email VARCHAR(100) NOT NULL,
                company_phone VARCHAR(15),
                company_address VARCHAR(500),
                timezone VARCHAR(50) DEFAULT 'UTC',
                currency VARCHAR(10) DEFAULT 'USD',
                language VARCHAR(10) DEFAULT 'en',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """))
        print("   ✓ Created company_settings table")
        
        db.commit()
        print("✅ All tables created successfully!\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

def create_default_data():
    """Create default admin and settings"""
    db = SessionLocal()
    
    try:
        # Create default admin
        password = "admin123"
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        admin = Admin(
            name="Administrator",
            email="admin@company.com",
            mobile="1234567890",
            password_hash=password_hash,
            address="",
            role="Super Admin"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Default admin created!")
        print(f"   Email: admin@company.com")
        print(f"   Mobile: 1234567890")
        print(f"   Password: admin123\n")
        
        # Create company settings
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
        print("✅ Default company settings created!\n")
        
    except Exception as e:
        print(f"❌ Error creating default data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 Fixing admin tables schema...\n")
    drop_and_recreate_tables()
    create_default_data()
    print("✅ Schema fix completed successfully!\n")

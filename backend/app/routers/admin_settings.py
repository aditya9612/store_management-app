from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime
import bcrypt

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/admin", tags=["Admin Settings"])


# Helper function to get or create default admin
def get_or_create_admin(db: Session):
    """Get existing admin or create default one"""
    admin = db.query(models.Admin).first()
    if not admin:
        # Create default admin
        default_password = "admin123"
        password_hash = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin = models.Admin(
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
    return admin


# Helper function to get or create company settings
def get_or_create_company_settings(db: Session):
    """Get existing company settings or create default ones"""
    settings = db.query(models.CompanySettings).first()
    if not settings:
        # Create default settings
        settings = models.CompanySettings(
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
        db.refresh(settings)
    return settings




# ==================== Admin Profile Endpoints ====================

@router.get("/profile", response_model=schemas.AdminResponse)
def get_admin_profile(db: Session = Depends(get_db)):
    """Get admin profile information"""
    try:
        admin = get_or_create_admin(db)
        return admin
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch admin profile: {str(e)}")


@router.put("/profile", response_model=schemas.AdminResponse)
def update_admin_profile(
    profile_data: schemas.AdminProfileUpdate,
    db: Session = Depends(get_db)
):
    """Update admin profile information"""
    try:
        admin = get_or_create_admin(db)
        
        # Update only provided fields
        if profile_data.name is not None:
            admin.name = profile_data.name
        if profile_data.email is not None:
            # Check if email is already taken by another admin
            existing = db.query(models.Admin).filter(
                models.Admin.email == profile_data.email,
                models.Admin.id != admin.id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")
            admin.email = profile_data.email
        if profile_data.mobile is not None:
            # Check if mobile is already taken by another admin
            existing = db.query(models.Admin).filter(
                models.Admin.mobile == profile_data.mobile,
                models.Admin.id != admin.id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Mobile already in use")
            admin.mobile = profile_data.mobile
        if profile_data.address is not None:
            admin.address = profile_data.address
        
        admin.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(admin)
        
        return admin
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update admin profile: {str(e)}")


# ==================== Company Settings Endpoints ====================

@router.get("/settings/company", response_model=schemas.CompanySettingsResponse)
def get_company_settings(db: Session = Depends(get_db)):
    """Get company settings"""
    try:
        settings = get_or_create_company_settings(db)
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch company settings: {str(e)}")


@router.put("/settings/company", response_model=schemas.CompanySettingsResponse)
def update_company_settings(
    settings_data: schemas.CompanySettingsUpdate,
    db: Session = Depends(get_db)
):
    """Update company settings"""
    try:
        settings = get_or_create_company_settings(db)
        
        # Update only provided fields
        if settings_data.company_name is not None:
            settings.company_name = settings_data.company_name
        if settings_data.company_email is not None:
            settings.company_email = settings_data.company_email
        if settings_data.company_phone is not None:
            settings.company_phone = settings_data.company_phone
        if settings_data.company_address is not None:
            settings.company_address = settings_data.company_address
        if settings_data.timezone is not None:
            settings.timezone = settings_data.timezone
        if settings_data.currency is not None:
            settings.currency = settings_data.currency
        if settings_data.language is not None:
            settings.language = settings_data.language
        
        settings.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(settings)
        
        return settings
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update company settings: {str(e)}")


# ==================== Password Change Endpoint ====================

@router.post("/change-password")
def change_admin_password(
    password_data: schemas.PasswordChange,
    db: Session = Depends(get_db)
):
    """Change admin password"""
    try:
        # Validate passwords match
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(status_code=400, detail="New password and confirm password do not match")
        
        # Validate password length
        if len(password_data.new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
        admin = get_or_create_admin(db)
        
        # Verify current password
        if not bcrypt.checkpw(password_data.current_password.encode('utf-8'), admin.password_hash.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        # Hash and update new password
        new_password_hash = bcrypt.hashpw(password_data.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin.password_hash = new_password_hash
        admin.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to change password: {str(e)}")


# ==================== Data Export Endpoints ====================

@router.get("/export/{data_type}")
def export_data(data_type: str, db: Session = Depends(get_db)):
    """Export system data (placeholder for now)"""
    try:
        # This is a placeholder - in production, you'd generate actual export files
        valid_types = ["owners", "shops", "customers", "orders", "products"]
        
        if data_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid data type. Must be one of: {', '.join(valid_types)}")
        
        return {
            "success": True,
            "message": f"Export of {data_type} data initiated",
            "data_type": data_type,
            "note": "This is a placeholder endpoint. Implement actual export logic as needed."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")

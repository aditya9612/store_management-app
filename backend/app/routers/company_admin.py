from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Owner
from ..schemas import Owner as OwnerSchema, OwnerCreate

router = APIRouter(
    prefix="/company-admin",
    tags=["company-admin"],
)

# For now, we'll use a simple authentication check
# In a real application, you would implement proper authentication
ADMIN_EMAIL = "admin@company.com"
ADMIN_PASSWORD = "admin123"

@router.post("/login")
def admin_login(email: str, password: str):
    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        return {"access_token": "admin-token", "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@router.get("/owners", response_model=List[OwnerSchema])
def get_all_owners(db: Session = Depends(get_db)):
    owners = db.query(Owner).all()
    return owners

@router.post("/owners", response_model=OwnerSchema, status_code=status.HTTP_201_CREATED)
def create_owner(owner: OwnerCreate, db: Session = Depends(get_db)):
    # Check if owner with this email or mobile already exists
    existing_owner = db.query(Owner).filter(
        (Owner.email == owner.email) | (Owner.mobile == owner.mobile)
    ).first()
    
    if existing_owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner with this email or mobile already exists"
        )
    
    # Create password hash (in a real app, use proper hashing)
    password_hash = owner.password + "_hashed"  # Placeholder for real hashing
    
    # Create new owner
    db_owner = Owner(
        name=owner.name,
        email=owner.email,
        mobile=owner.mobile,
        shop_name=owner.shop_name,
        address=owner.address,
        password_hash=password_hash
    )
    
    db.add(db_owner)
    db.commit()
    db.refresh(db_owner)
    return db_owner
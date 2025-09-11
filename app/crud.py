from sqlalchemy.orm import Session
from . import models, schemas, auth

# Owner
def create_owner(db: Session, owner: schemas.OwnerCreate):
    hashed_pw = auth.get_password_hash(owner.password)
    db_owner = models.Owner(
       name=owner.name,
        email=owner.email,
        mobile=owner.mobile,
        password_hash=hashed_pw,
        shop_name=owner.shop_name,
        address=owner.address
    )
    db.add(db_owner)
    db.commit()
    db.refresh(db_owner)
    return db_owner

def authenticate_owner(db: Session, mobile: str, password: str):
    owner = db.query(models.Owner).filter(models.Owner.mobile == mobile).first()
    if not owner or not auth.verify_password(password, owner.password_hash):
        return None
    return owner


# Customers
def create_customer(db: Session, customer: schemas.CustomerCreate, owner_id: int):
    db_customer = models.Customer(**customer.dict(), owner_id=owner_id)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customers_by_owner(db: Session, owner_id: int):
    return db.query(models.Customer).filter(models.Customer.owner_id == owner_id).all()

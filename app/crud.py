from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app import models, schemas
from sqlalchemy.orm import joinedload


# ---------------- Owner ----------------
def create_owner(db: Session, owner: schemas.OwnerCreate):
    db_owner = models.Owner(
        name=owner.name,
        email=owner.email,
        mobile=owner.mobile,
        shop_name=owner.shop_name,
        address=owner.address,
        password_hash=""  
    )
    db.add(db_owner)
    db.commit()
    db.refresh(db_owner)
    return db_owner


def get_owner_by_mobile(db: Session, mobile: str):
    return db.query(models.Owner).filter(models.Owner.mobile == mobile).first()

# ---------------- Store ------------------------
def create_store(db: Session, store: schemas.StoreCreate):
    # Check if owner exists
    owner = db.query(models.Owner).filter(models.Owner.id == store.owner_id).first()
    if not owner:
        raise ValueError(f"Owner with id {store.owner_id} not found")
    
    # Create new store
    db_store = models.Store(
        name=store.name,
        location=store.location,
        owner_id=store.owner_id
    )
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store


def get_stores_by_owner(db: Session, owner_id: int):
    return db.query(models.Store).filter(models.Store.owner_id == owner_id).all()




# ---------------- StoreMan --------------------
def create_storeman(db: Session, storeman: schemas.StoreManCreate):
    db_storeman = models.StoreMan(**storeman.dict())
    db.add(db_storeman)
    db.commit()
    db.refresh(db_storeman)
    return db_storeman


def get_storeman_by_mobile(db: Session, mobile: str):
    return db.query(models.StoreMan).filter(models.StoreMan.mobile == mobile).first()


# ---------------- Customer ------------------------
def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_customers_by_store(db: Session, store_id: int):
    return db.query(models.Customer).filter(models.Customer.store_id == store_id).all()

# ---------------- Products ----------------
def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session):
    return db.query(models.Product).all()


# ---------------- Orders ----------------
def create_order(db: Session, order_data: schemas.OrderCreate):
    db_order = models.Order(
        store_id=order_data.store_id,
        customer_id=order_data.customer_id,
        status="Pending",
    )
    db.add(db_order)
    db.flush()  

    total = 0.0
    for item in order_data.items:
        subtotal = item.quantity * item.price
        total += subtotal
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price,
        )
        db.add(db_item)

    db_order.total = total
    db.commit()
    db.refresh(db_order)
    return db_order


def get_order(db: Session, order_id: int):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product)  # ✅ product load
        )
        .filter(models.Order.id == order_id)
        .first()
    )

def get_orders_by_customer(db: Session, customer_id: int):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .filter(models.Order.customer_id == customer_id)
        .all()
    )


def get_orders_by_store(db: Session, store_id: int):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .filter(models.Order.store_id == store_id)
        .all()
    )


# ---------------- OTP Helpers ----------------
def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP."""
    return "".join([str(random.randint(0, 9)) for _ in range(length)])


def set_otp_for_user(user, otp: str, ttl_minutes: int = 5):
    """Set OTP for either Owner or StoreMan."""
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)


def verify_otp_for_user(user, otp: str) -> bool:
    """Check if OTP is valid for a user (Owner or StoreMan)."""
    if not user or not user.otp_code or not user.otp_expires_at:
        return False
    if datetime.utcnow() > user.otp_expires_at:
        return False
    if user.otp_code != otp:
        return False
    # OTP valid → clear it
    user.otp_code = None
    user.otp_expires_at = None
    return True
# ---------------- Owner Update/Delete ----------------
def update_owner(db: Session, owner_id: int, owner_update: schemas.OwnerBase):
    db_owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
    if not db_owner:
        return None
    for key, value in owner_update.dict(exclude_unset=True).items():
        setattr(db_owner, key, value)
    db.commit()
    db.refresh(db_owner)
    return db_owner

def delete_owner(db: Session, owner_id: int):
    db_owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
    if not db_owner:
        return None
    db.delete(db_owner)
    db.commit()
    return db_owner


# ---------------- Store Update/Delete ----------------
def update_store(db: Session, store_id: int, store_update: schemas.StoreBase):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        return None
    for key, value in store_update.dict(exclude_unset=True).items():
        setattr(db_store, key, value)
    db.commit()
    db.refresh(db_store)
    return db_store

def delete_store(db: Session, store_id: int):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        return None
    db.delete(db_store)
    db.commit()
    return db_store

# ---------------- Customer ------------------------
def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_customers_by_store(db: Session, store_id: int):
    return db.query(models.Customer).filter(models.Customer.store_id == store_id).all()


def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()


def update_customer(db: Session, customer_id: int, updates: dict):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    for key, value in updates.items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer

# ---------------- Inquiry ----------------
def create_inquiry(db: Session, inquiry: schemas.InquiryCreate):
    db_inquiry = models.Inquiry(**inquiry.dict())
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    return db_inquiry

def get_inquiries_by_store(db: Session, store_id: int):
    return db.query(models.Inquiry).filter(models.Inquiry.store_id == store_id).all()

def get_inquiries_by_customer(db: Session, customer_id: int):
    return db.query(models.Inquiry).filter(models.Inquiry.customer_id == customer_id).all()

def update_inquiry_status(db: Session, inquiry_id: int, status: str):
    inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
    if inquiry:
        inquiry.status = status
        db.commit()
        db.refresh(inquiry)
    return inquiry

# ---------------- Offer ----------------
def create_offer(db: Session, offer: schemas.OfferCreate):
    db_offer = models.Offer(**offer.dict())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

def get_offers_by_store(db: Session, store_id: int):
    return db.query(models.Offer).filter(models.Offer.store_id == store_id).all()

def get_all_offers(db: Session):
    return db.query(models.Offer).all()


# ---------------- Auth Helpers ----------------
def get_owner_by_id(db: Session, owner_id: int):
    """Fetch an owner by ID"""
    return db.query(models.Owner).filter(models.Owner.id == owner_id).first()

def get_storeman_by_id(db: Session, storeman_id: int):
    """Fetch a storeman by ID"""
    return db.query(models.StoreMan).filter(models.StoreMan.id == storeman_id).first()


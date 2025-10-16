from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
import random

from app import models, schemas


# ---------------- Owner ----------------
def create_owner(db: Session, owner: schemas.OwnerCreate):
    import hashlib
    password_hash = hashlib.sha256(owner.password.encode()).hexdigest()
    db_owner = models.Owner(
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


def get_owner_by_mobile(db: Session, mobile: str):
    return db.query(models.Owner).filter(models.Owner.mobile == mobile).first()

def get_owners(db: Session):
    return db.query(models.Owner).all()

def update_owner(db: Session, owner_id: int, owner: schemas.OwnerUpdate):
    db_owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
    if db_owner:
        update_data = owner.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key == 'password' and value:
                # Hash the password before storing
                import hashlib
                setattr(db_owner, 'password_hash', hashlib.sha256(value.encode()).hexdigest())
            else:
                setattr(db_owner, key, value)
        db.commit()
        db.refresh(db_owner)
    return db_owner

def delete_owner(db: Session, owner_id: int):
    db_owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
    if db_owner:
        # First, get all stores owned by this owner
        stores = db.query(models.Store).filter(models.Store.owner_id == owner_id).all()

        # For each store, delete all associated data in correct order
        for store in stores:
            # Delete all products for this store first
            db.query(models.Product).filter(models.Product.store_id == store.id).delete(synchronize_session=False)

            # Delete all order items first (they reference orders)
            db.query(models.OrderItem).filter(models.OrderItem.order_id.in_(
                db.query(models.Order.id).filter(models.Order.store_id == store.id)
            )).delete(synchronize_session=False)

            # Delete all orders for this store
            db.query(models.Order).filter(models.Order.store_id == store.id).delete(synchronize_session=False)

            # Delete all customers for this store (now that orders are gone)
            db.query(models.Customer).filter(models.Customer.store_id == store.id).delete(synchronize_session=False)

            # Delete all offers for this store
            db.query(models.Offer).filter(models.Offer.store_id == store.id).delete(synchronize_session=False)

        # Delete all stores (this will cascade delete storeman, etc.)
        db.query(models.Store).filter(models.Store.owner_id == owner_id).delete(synchronize_session=False)

        # Finally, delete the owner
        db.delete(db_owner)
        db.commit()
    return db_owner

# ---------------- Store ----------------
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
    return db.query(models.Store).options(joinedload(models.Store.storeman)).filter(models.Store.owner_id == owner_id).all()



def update_store(db: Session, store_id: int, store: schemas.StoreCreate):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if db_store:
        db_store.name = store.name
        db_store.location = store.location
        db_store.owner_id = store.owner_id

        db.commit()
        db.refresh(db_store)
    return db_store

def delete_store(db: Session, store_id: int):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if db_store:
        # Delete all products for this store first
        db.query(models.Product).filter(models.Product.store_id == store_id).delete(synchronize_session=False)

        # Delete all order items first (they reference orders)
        db.query(models.OrderItem).filter(models.OrderItem.order_id.in_(
            db.query(models.Order.id).filter(models.Order.store_id == store_id)
        )).delete(synchronize_session=False)

        # Delete all orders for this store
        db.query(models.Order).filter(models.Order.store_id == store_id).delete(synchronize_session=False)

        # Delete all customers for this store (now that orders are gone)
        db.query(models.Customer).filter(models.Customer.store_id == store_id).delete(synchronize_session=False)

        # Delete all offers for this store
        db.query(models.Offer).filter(models.Offer.store_id == store_id).delete(synchronize_session=False)

        # Then delete the store (this will cascade delete storeman, etc.)
        db.delete(db_store)
        db.commit()
    return db_store


# ---------------- StoreMan ----------------
def create_storeman(db: Session, storeman: schemas.StoreManCreate):
    db_storeman = models.StoreMan(
        name=storeman.name,
        mobile=storeman.mobile,
        store_id=storeman.store_id
    )
    db.add(db_storeman)
    db.commit()
    db.refresh(db_storeman)
    return db_storeman


def get_storeman_by_mobile(db: Session, mobile: str):
    return db.query(models.StoreMan).filter(models.StoreMan.mobile == mobile).first()


def get_storeman_by_store(db: Session, store_id: int):
    return db.query(models.StoreMan).filter(models.StoreMan.store_id == store_id).first()


def delete_storeman(db: Session, store_id: int):
    db_storeman = db.query(models.StoreMan).filter(models.StoreMan.store_id == store_id).first()
    if db_storeman:
        db.delete(db_storeman)
        db.commit()
    return db_storeman


# ---------------- Customer ----------------
def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_customers_by_store(db: Session, store_id: int):
    return db.query(models.Customer).filter(models.Customer.store_id == store_id).all()

def update_customer(db: Session, customer_id: int, customer: schemas.CustomerUpdate):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer:
        update_data = customer.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_customer, key, value)
        db.commit()
        db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer


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
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_orders_by_customer(db: Session, customer_id: int):
    return db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.customer_id == customer_id).all()


def get_orders_by_store(db: Session, store_id: int):
    return db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.store_id == store_id).all()

def delete_order(db: Session, order_id: int):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order

def update_product(db: Session, product_id: int, name: str, price: float, store_id: int, description: str, image: str = None):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        db_product.name = name
        db_product.price = price
        db_product.store_id = store_id
        db_product.description = description
        if image:
            db_product.image_path = image
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def update_offer(db: Session, offer_id: int, offer: schemas.OfferCreate):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if db_offer:
        db_offer.title = offer.title
        db_offer.description = offer.description
        db_offer.discount = offer.discount
        db_offer.valid_until = offer.valid_until
        db_offer.store_id = offer.store_id
        db.commit()
        db.refresh(db_offer)
    return db_offer

def delete_offer(db: Session, offer_id: int):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if db_offer:
        db.delete(db_offer)
        db.commit()
    return db_offer


# ---------------- OTP Helpers ----------------
def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP."""
    return "".join([str(random.randint(0, 9)) for _ in range(length)])


def set_otp_for_user(user, otp: str, ttl_minutes: int = 5):
    """Set OTP for either Owner or StoreMan."""
    if hasattr(user, 'otp_code') and hasattr(user, 'otp_expires_at'):
        user.otp_code = otp
        user.otp_expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)
    # For StoreMan, we don't store OTP in database since they authenticate via mobile OTP


def verify_otp_for_user(user, otp: str) -> bool:
    """Check if OTP is valid for a user (Owner or StoreMan)."""
    # For Owner, check database OTP fields
    if hasattr(user, 'otp_code') and hasattr(user, 'otp_expires_at'):
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

    # For StoreMan, OTP verification is handled externally (via SMS)
    # This is a simplified implementation - in production you'd verify against your SMS service
    return True

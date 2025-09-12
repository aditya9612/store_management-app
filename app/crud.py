from . import models, schemas, auth
from sqlalchemy.orm import Session

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


# Customer
def create_customer(db: Session, customer: schemas.CustomerCreate, owner_id: int):
    db_customer = models.Customer(**customer.dict(), owner_id=owner_id)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customers_by_owner(db: Session, owner_id: int):
    return db.query(models.Customer).filter(models.Customer.owner_id == owner_id).all()


# Orders
def create_order(db: Session, order_data: schemas.OrderCreate):
    db_order = models.Order(
        owner_id=order_data.owner_id,
        customer_id=order_data.customer_id,
        status="Pending"
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
            price=item.price
        )
        db.add(db_item)

    db_order.total = total
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders_by_customer(db: Session, customer_id: int):
    return db.query(models.Order).filter(models.Order.customer_id == customer_id).all()

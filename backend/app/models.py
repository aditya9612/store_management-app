from sqlalchemy import Column, Integer, String, ForeignKey,Float,DateTime,func
from sqlalchemy.orm import relationship
from .database import Base

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .database import Base


class Owner(Base):
    __tablename__ = "owners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=True)    # optional
    mobile = Column(String(15), unique=True, nullable=False)   # login with mobile
    password_hash = Column(String(255), nullable=False)        # password/OTP hash
    shop_name = Column(String(200), nullable=True)
    address = Column(String(255), nullable=True)
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    stores = relationship("Store", back_populates="owner", cascade="all, delete-orphan")


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    location = Column(String(255), nullable=True)
    owner_id = Column(Integer, ForeignKey("owners.id"), nullable=False)

    # Relationships
    owner = relationship("Owner", back_populates="stores")
    customers = relationship("Customer", back_populates="store", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="store", cascade="all, delete-orphan")
    storeman = relationship("StoreMan", back_populates="store", uselist=False, cascade="all, delete-orphan")


class StoreMan(Base):
    __tablename__ = "storemans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mobile = Column(String(15), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)   # optional
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)

    # Relationships
    store = relationship("Store", back_populates="storeman")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(15), nullable=True)
    address = Column(String(255), nullable=True)  # Added address column
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)

    # Relationships
    store = relationship("Store", back_populates="customers")
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    total = Column(Float, nullable=False, default=0.0)
    discount = Column(Float, nullable=False, default=0.0)
    status = Column(String(100), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    store = relationship("Store", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    description = Column(String(500), nullable=True)
    image_path = Column(String(255), nullable=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)

    # Relationships
    order_items = relationship("OrderItem", back_populates="product")


class Offer(Base):
    __tablename__ = "offers"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    discount = Column(Float, nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    store = relationship("Store", backref="offers")
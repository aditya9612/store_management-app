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
    email = Column(String(100), unique=True, nullable=True)    # gmail / email
    mobile = Column(String(15), unique=True, nullable=False)   # login with mobile
    password_hash = Column(String(255), nullable=False)
    shop_name = Column(String(200), nullable=False)
    address = Column(String(255), nullable=True)

    customers = relationship("Customer", back_populates="owner", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="owner")




class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(15), nullable=True)
    owner_id = Column(Integer, ForeignKey("owners.id"))

    owner = relationship("Owner", back_populates="customers")
    orders = relationship("Order", back_populates="customer")




class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("owners.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    total = Column(Float, nullable=False, default=0.0)
    status = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("Owner", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items") 

 
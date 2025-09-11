from sqlalchemy import Column, Integer, String, ForeignKey
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



class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(15), nullable=True)
    owner_id = Column(Integer, ForeignKey("owners.id"))

    owner = relationship("Owner", back_populates="customers")

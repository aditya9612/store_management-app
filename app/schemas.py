from pydantic import BaseModel
from datetime import datetime
from typing import List

# Owner
class OwnerBase(BaseModel):
    name: str
    email: str
    mobile: str
    shop_name: str
    address: str

class OwnerCreate(OwnerBase):
    password: str

class OwnerOut(OwnerBase):
    id: int
    class Config:
        from_attributes = True


# Customer
class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str | None = None

class CustomerCreate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True


# Order Items
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: int
    class Config:
        from_attributes = True


# Orders
class OrderBase(BaseModel):
    owner_id: int
    customer_id: int

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderOut(OrderBase):
    id: int
    total: float
    status: str
    created_at: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# ---------------- Owner ----------------
class OwnerBase(BaseModel):
    name: str
    email: Optional[str] = None
    mobile: str
    shop_name: Optional[str] = None
    address: Optional[str] = None

class OwnerCreate(OwnerBase):
    password: str  # optional if using password

class Owner(OwnerBase):
    id: int
    stores: List['Store'] = []

    class Config:
        from_attributes = True

class OwnerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    shop_name: Optional[str] = None
    address: Optional[str] = None

# ---------------- Store ----------------
class StoreBase(BaseModel):
    name: str
    location: str | None = None
class StoreCreate(StoreBase):
    owner_id: int

class Store(StoreBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True


# class StoreManCreate(StoreManBase):
#     store_id: int
#
# class StoreManOut(StoreManBase):
#     id: int
#     store_id: int
#     class Config:
#         from_attributes = True

# ---------------- Offer ----------------
class OfferBase(BaseModel):
    title: str
    description: Optional[str] = None
    discount: float
    valid_until: datetime
    store_id: int

class OfferCreate(OfferBase):
    pass

class OfferResponse(OfferBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OfferUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount: Optional[float] = None
    valid_until: Optional[datetime] = None

# ---------------- CompanyAdmin ----------------
class CompanyAdminBase(BaseModel):
    email: str
    
class CompanyAdminCreate(CompanyAdminBase):
    password: str

class CompanyAdminLogin(CompanyAdminBase):
    password: str

class CompanyAdminResponse(CompanyAdminBase):
    id: int

    class Config:
        from_attributes = True

# ---------------- Customer ----------------
class CustomerBase(BaseModel):
    name: str
    email: str| None = None
    phone: str | None = None
    address: str | None = None

class CustomerCreate(CustomerBase):
    store_id: int

class CustomerOut(CustomerBase):
    id: int
    store_id: int
    class Config:
        from_attributes = True

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


# ---------------- Order Items ----------------
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


# ---------------- Orders ----------------
class OrderBase(BaseModel):
    store_id: int
    customer_id: int
    discount: float = 0.0

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

class InvoiceOut(BaseModel):
    file_path: str


# ---------------- OTP ----------------
class OTPRequest(BaseModel):
    mobile: str
    role: str  # "owner" and "storeman"

class OTPVerify(BaseModel):
    mobile: str
    otp: str
    role: str


# ---------------- Products ----------------
class ProductBase(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    image_path: Optional[str] = None
    store_id: int

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None

Owner.model_rebuild()
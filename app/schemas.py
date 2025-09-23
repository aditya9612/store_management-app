from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# ---------------- Products ----------------
class ProductBase(BaseModel):
    name: str
    price: float

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    class Config:
        from_attributes = True


# ---------------- Owner ----------------
class OwnerBase(BaseModel):
    name: str
    email: Optional[str] = None
    mobile: str
    shop_name: str
    address: Optional[str] = None

class OwnerCreate(OwnerBase):
    password: str

class OwnerOut(OwnerBase):
    id: int
    otp_code: Optional[str] = None
    otp_expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------- Store ----------------
class StoreBase(BaseModel):
    name: str
    location: Optional[str] = None

class StoreCreate(StoreBase):
    owner_id: int

class StoreOut(StoreBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True


# ---------------- StoreMan ----------------
class StoreManBase(BaseModel):
    name: str
    mobile: str

class StoreManCreate(StoreManBase):
    store_id: int

class StoreManOut(StoreManBase):
    id: int
    store_id: int
    class Config:
        from_attributes = True


# ---------------- Customer ----------------
class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: int
    store_id: int
    class Config:
        from_attributes = True


# ---------------- Order Items ----------------
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: int
    product: Optional[ProductOut] = None  
    class Config:
        from_attributes = True


# ---------------- Orders ----------------
class OrderBase(BaseModel):
    store_id: int
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


# ---------------- Token ----------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---------------- Invoice ----------------
class InvoiceResponse(BaseModel):
    message: str
    file_path: str

# ---------------- OTP ----------------
class OTPRequest(BaseModel):
    mobile: str
    role: str  # "owner" or "storeman"

class OTPVerify(BaseModel):
    mobile: str
    otp: str
    role: str
# ---------------- Inquiry ----------------
class InquiryBase(BaseModel):
    subject: str
    message: str

class InquiryCreate(InquiryBase):
    customer_id: int
    store_id: int

class InquiryOut(InquiryBase):
    id: int
    customer_id: int
    store_id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# ---------------- Offer ----------------
class OfferBase(BaseModel):
    title: str
    description: str
    discount: float   
    valid_until: datetime
    store_id: Optional[int] = None  # None = all stores
   # owner_id: int Optional[int] = None  # None = admin created

class OfferCreate(OfferBase):
    pass

class OfferOut(OfferBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


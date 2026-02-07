from pydantic import BaseModel, validator
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
    password: Optional[str] = None
    shop_name: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True

# Rebuild the Owner model to include the new OwnerUpdate schema
OwnerUpdate.model_rebuild()

# ---------------- StoreMan ----------------
class StoreManBase(BaseModel):
    name: str
    mobile: str

class StoreManCreate(StoreManBase):
    store_id: int

class StoreMan(StoreManBase):
    id: int
    store_id: int

    class Config:
        from_attributes = True

# ---------------- Store ----------------
class StoreBase(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    status: str = 'active'  # active, inactive, suspended

class StoreCreate(StoreBase):
    owner_id: int

class Store(StoreBase):
    id: int
    owner_id: int
    storeman: Optional[StoreMan] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "My Store",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "pincode": "10001",
                "gstin": "22AAAAA0000A1Z5",
                "status": "active",
                "owner_id": 1
            }
        }

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
    product_id: Optional[int] = None  # Make product_id optional for manual products
    name: Optional[str] = None  # Name for manual products
    quantity: int
    price: float
    description: Optional[str] = None  # Description for manual products

    @validator('name', always=True)
    def validate_name_or_product_id(cls, v, values):
        if not v and not values.get('product_id'):
            raise ValueError('Either product_id or name must be provided')
        return v

    @validator('price')
    def validate_price(cls, v):
        if v is None or v <= 0:
            raise ValueError('Price must be greater than 0')
        return v

    class Config:
        # Allow validation to pass even if product_id is None when name is provided
        schema_extra = {
            "example": {
                "product_id": 1,  # For catalog products
                "name": "Product Name",  # For manual products or override
                "quantity": 2,
                "price": 10.50,
                "description": "Product description"
            }
        }

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
    customer: Optional[CustomerOut] = None  # Include customer details

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


# ---------------- Admin ----------------
class AdminBase(BaseModel):
    name: str
    email: str
    mobile: str
    address: Optional[str] = None
    role: str = "Super Admin"

class AdminCreate(AdminBase):
    password: str

class AdminResponse(AdminBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    
    class Config:
        from_attributes = True


# ---------------- Company Settings ----------------
class CompanySettingsBase(BaseModel):
    company_name: str
    company_email: str
    company_phone: Optional[str] = None
    company_address: Optional[str] = None
    timezone: str = "UTC"
    currency: str = "USD"
    language: str = "en"

class CompanySettingsCreate(CompanySettingsBase):
    pass

class CompanySettingsResponse(CompanySettingsBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CompanySettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    company_email: Optional[str] = None
    company_phone: Optional[str] = None
    company_address: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    
    class Config:
        from_attributes = True


# ---------------- Password Change ----------------
class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
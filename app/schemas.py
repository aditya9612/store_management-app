from pydantic import BaseModel
from typing import List, Optional

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: int
    class Config:
        from_attributes = True


# Owner Schemas
from pydantic import BaseModel, EmailStr
from typing import Optional


class OwnerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    mobile: str
    shop_name: str
    address: Optional[str] = None


class OwnerCreate(OwnerBase):
    password: str


class OwnerOut(OwnerBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

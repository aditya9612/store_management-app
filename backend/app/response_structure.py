# response_structure.py
from pydantic import BaseModel
from typing import TypeVar, Generic, Optional

DataType = TypeVar('DataType')

class OnSuccess(BaseModel, Generic[DataType]):
    status: str = "success"
    data: Optional[DataType] = None
    message: str = "Success"

class OnError(BaseModel):
    status: str = "error"
    data: Optional[DataType] = None
    message: str = "Error"

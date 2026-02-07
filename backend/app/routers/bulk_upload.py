
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import shutil, os
from ..database import get_db
from .. import models, schemas
from ..utils.file_parser import parse_file
from app.response_structure import OnSuccess, OnError

router = APIRouter(prefix="/bulk", tags=["Bulk Upload"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/customers/{owner_id}")
def bulk_upload_customers(owner_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        customer_list = parse_file(file_path)
        owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
        if not owner:
            return OnError(message=f"Owner {owner_id} not found")
        db_customers = []
        for customer in customer_list:
            if db.query(models.Customer).filter(models.Customer.phone == customer["phone"]).first():
                return OnError(message=f"Duplicate mobile: {customer['phone']}")
            db_customer = models.Customer(
                name=customer["name"],
                email=customer.get("email"),
                phone=customer["phone"],
                owner_id=owner_id
            )
            db.add(db_customer)
            db_customers.append(db_customer)
        db.commit()
        for customer in db_customers:
            db.refresh(customer)
        return OnSuccess(data=[c.id for c in db_customers], message=f"Successfully uploaded {len(db_customers)} customers.")
    except Exception as e:
        return OnError(message=str(e))

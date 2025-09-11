from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import shutil, os

from ..database import get_db
from .. import models, schemas
from ..utils.file_parser import parse_file

router = APIRouter(prefix="/bulk", tags=["Bulk Upload"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/customers/{owner_id}", response_model=List[schemas.CustomerOut])
def bulk_upload_customers(owner_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Save uploaded file temporarily
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        customer_list = parse_file(file_path)  # list of dicts
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Ensure owner exists
    owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail=f"Owner {owner_id} not found")

    db_customers = []
    for customer in customer_list:
        # check duplicate mobile
        if db.query(models.Customer).filter(models.Customer.phone == customer["phone"]).first():
            raise HTTPException(status_code=400, detail=f"Duplicate mobile: {customer['phone']}")

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

    return db_customers


from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from .. import models, schemas, crud, database
from app.response_structure import OnSuccess
from typing import List

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("/upload-bulk/")
async def upload_customers(
    store_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
):
    try:
        if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
            raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported")
        store = db.query(models.Store).filter(models.Store.id == store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)

        normalized_columns = [str(col).strip().lower().replace(" ", "_").replace("-", "_") for col in df.columns]
        df.columns = normalized_columns

        alias_map = {
            "phone_number": "phone", "mobile": "phone", "mobile_number": "phone",
            "customer_name": "name", "email_address": "email",
        }
        for alias, target in alias_map.items():
            if alias in df.columns and target not in df.columns:
                df[target] = df[alias]

        required_columns = {"name", "email", "phone"}
        if not required_columns.issubset(set(df.columns)):
            raise HTTPException(status_code=400, detail=f"File must contain columns: {required_columns}. Found: {list(df.columns)}")

        df["name"] = df["name"].astype(str).str.strip()
        df["email"] = df["email"].astype(str).str.strip()
        df["phone"] = df["phone"].apply(lambda x: str(x)).str.replace(r"[^0-9]+", "", regex=True)
        if "address" in df.columns:
            df["address"] = df["address"].astype(str).str.strip()
        
        customers = [
            models.Customer(
                name=row.get("name"), email=row.get("email"), phone=row.get("phone"),
                address=row.get("address") if "address" in df.columns else None, store_id=store_id
            )
            for _, row in df.iterrows()
        ]
        db.bulk_save_objects(customers)
        db.commit()
        return OnSuccess(data={"count": len(customers)}, message=f"Successfully inserted {len(customers)} customers")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=OnSuccess[schemas.CustomerOut])
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(database.get_db)):
    try:
        store = db.query(models.Store).filter(models.Store.id == customer.store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")

        if customer.phone:
            existing_customer = db.query(models.Customer).filter(
                models.Customer.phone == customer.phone, models.Customer.store_id == customer.store_id
            ).first()
            if existing_customer:
                raise HTTPException(status_code=400, detail="Customer with this phone number already exists")
        
        db_customer = crud.create_customer(db, customer)
        return OnSuccess(data=db_customer, message="Customer created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-store/{store_id}", response_model=OnSuccess[List[schemas.CustomerOut]])
def get_customers_by_store(store_id: int, db: Session = Depends(database.get_db)):
    try:
        store = db.query(models.Store).filter(models.Store.id == store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        
        customers = crud.get_customers_by_store(db, store_id)
        return OnSuccess(data=customers, message="Customers fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{customer_id}", response_model=OnSuccess[schemas.CustomerOut])
def update_customer(customer_id: int, customer: schemas.CustomerUpdate, db: Session = Depends(database.get_db)):
    try:
        db_customer = crud.update_customer(db, customer_id, customer)
        if not db_customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return OnSuccess(data=db_customer, message="Customer updated successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{customer_id}", status_code=200)
def delete_customer(customer_id: int, db: Session = Depends(database.get_db)):
    try:
        crud.delete_customer(db, customer_id)
        return OnSuccess(message="Customer deleted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

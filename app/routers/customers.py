from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from .. import models, schemas, crud, database, auth

router = APIRouter(prefix="/customers", tags=["Customers"])


# 🔹 Bulk Upload Customers
@router.post("/upload-bulk/")
async def upload_customers(
    store_id: int,   # ✅ which store these customers belong to
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    # Validate file type
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported")

    # Validate store belongs to current owner
    store = db.query(models.Store).filter(
        models.Store.id == store_id,
        models.Store.owner_id == current_owner.id
    ).first()
    if not store:
        raise HTTPException(status_code=403, detail="Store not found or not owned by you")

    # Read file into DataFrame
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file.file)
        else:  # Excel
            df = pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # Validate required columns
    required_columns = {"name", "email", "phone"}
    if not required_columns.issubset(set(df.columns)):
        raise HTTPException(status_code=400, detail=f"File must contain columns: {required_columns}")

    # Insert rows into DB
    customers = []
    for _, row in df.iterrows():
        customer = models.Customer(
            name=row["name"],
            email=row.get("email"),
            phone=row.get("phone"),
            store_id=store_id   # ✅ assign to store
        )
        customers.append(customer)

    db.bulk_save_objects(customers)
    db.commit()

    return {"message": f"Successfully inserted {len(customers)} customers into store {store_id}"}


# 🔹 Create Single Customer
@router.post("/", response_model=schemas.CustomerOut)
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    # Validate store belongs to current owner
    store = db.query(models.Store).filter(
        models.Store.id == customer.store_id,
        models.Store.owner_id == current_owner.id
    ).first()
    if not store:
        raise HTTPException(status_code=403, detail="Store not found or not owned by you")

    return crud.create_customer(db, customer)


# 🔹 Get Customers for a Store
@router.get("/by-store/{store_id}", response_model=list[schemas.CustomerOut])
def get_customers_by_store(
    store_id: int,
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    # Validate store belongs to current owner
    store = db.query(models.Store).filter(
        models.Store.id == store_id,
        models.Store.owner_id == current_owner.id
    ).first()
    if not store:
        raise HTTPException(status_code=403, detail="Store not found or not owned by you")

    return crud.get_customers_by_store(db, store_id)

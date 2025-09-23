from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from app import models, schemas, crud, database, auth
from fastapi.responses import FileResponse
from app.utils.export_service import export_customers_to_excel

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

# 🔹 Update Customer
@router.put("/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(
    customer_id: int,
    customer_update: schemas.CustomerBase,   # reuse base schema for updates
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    db_customer = crud.get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # ensure store belongs to owner
    if db_customer.store.owner_id != current_owner.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this customer")

    updated = crud.update_customer(db, customer_id, customer_update.dict(exclude_unset=True))
    return updated


# 🔹 Delete Customer
@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    db_customer = crud.get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # ensure store belongs to owner
    if db_customer.store.owner_id != current_owner.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this customer")

    crud.delete_customer(db, customer_id)
    return {"message": f"Customer {customer_id} deleted successfully"}

# 🔹 Export Customers (by store)
@router.get("/export/{store_id}")
def export_customers(
    store_id: int,
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    # validate store belongs to current owner
    store = db.query(models.Store).filter(
        models.Store.id == store_id,
        models.Store.owner_id == current_owner.id
    ).first()
    if not store:
        raise HTTPException(status_code=403, detail="Store not found or not owned by you")

    customers = crud.get_customers_by_store(db, store_id)
    if not customers:
        raise HTTPException(status_code=404, detail="No customers found for this store")

    file_path = export_customers_to_excel(customers, f"customers_store_{store_id}.xlsx")

    return FileResponse(
        path=file_path,
        filename=f"customers_store_{store_id}.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


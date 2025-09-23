from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app import schemas, crud, database, models
from app.utils import invoice_service


router = APIRouter(prefix="/orders", tags=["Orders"])


# ---------------- Create Order ----------------
@router.post("/", response_model=schemas.OrderOut)
def create_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    store = db.query(models.Store).filter(models.Store.id == order.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return crud.create_order(db, order)


# ---------------- Get Order by ID ----------------
@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(database.get_db)):
    db_order = crud.get_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order


# ---------------- Get Orders by Customer ----------------
@router.get("/by-customer/{customer_id}", response_model=list[schemas.OrderOut])
def get_orders_by_customer(customer_id: int, db: Session = Depends(database.get_db)):
    orders = crud.get_orders_by_customer(db, customer_id)
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this customer")
    return orders


# ---------------- Get Orders by Store ----------------
@router.get("/by-store/{store_id}", response_model=list[schemas.OrderOut])
def get_orders_by_store(store_id: int, db: Session = Depends(database.get_db)):
    orders = crud.get_orders_by_store(db, store_id)
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this store")
    return orders


# ---------------- Generate Invoice (JSON response) ----------------
@router.post("/{order_id}/invoice", response_model=schemas.InvoiceResponse)
def generate_invoice(order_id: int, db: Session = Depends(database.get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    file_path = invoice_service.create_invoice(order)
    return {"message": "Invoice generated", "file_path": file_path}


# ---------------- Download Invoice (PDF file response) ----------------
@router.get("/{order_id}/invoice/download")
def download_invoice(order_id: int, db: Session = Depends(database.get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    file_path = invoice_service.create_invoice(order)
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"invoice_{order_id}.pdf"
    )

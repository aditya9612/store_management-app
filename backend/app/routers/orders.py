from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from typing import List
from app import schemas, crud, database, models
from app.utils import invoice_service
from app.response_structure import OnSuccess

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OnSuccess[schemas.OrderOut])
def create_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    try:
        store = db.query(models.Store).filter(models.Store.id == order.store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        db_order = crud.create_order(db, order)
        return OnSuccess(data=db_order, message="Order created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}", response_model=OnSuccess[schemas.OrderOut])
def get_order(order_id: int, db: Session = Depends(database.get_db)):
    try:
        db_order = crud.get_order(db, order_id)
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
        return OnSuccess(data=db_order, message="Order fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-customer/{customer_id}", response_model=OnSuccess[List[schemas.OrderOut]])
def get_orders_by_customer(customer_id: int, db: Session = Depends(database.get_db)):
    try:
        orders = crud.get_orders_by_customer(db, customer_id)
        return OnSuccess(data=orders, message="Orders fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-store/{store_id}", response_model=OnSuccess[List[schemas.OrderOut]])
def get_orders_by_store(store_id: int, db: Session = Depends(database.get_db)):
    try:
        orders = crud.get_orders_by_store(db, store_id)
        return OnSuccess(data=orders, message="Orders fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{order_id}/invoice", response_model=OnSuccess[schemas.InvoiceOut])
def generate_invoice(order_id: int, db: Session = Depends(database.get_db)):
    try:
        order = crud.get_order(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        file_path = invoice_service.create_invoice(order)
        return OnSuccess(data={"file_path": file_path}, message="Invoice generated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}/download-invoice", response_class=FileResponse)
def download_invoice(order_id: int, db: Session = Depends(database.get_db)):
    try:
        order = crud.get_order(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        file_path = os.path.join(invoice_service.UPLOAD_DIR, f"invoice_{order_id}.pdf")
        if not os.path.exists(file_path):
            invoice_service.create_invoice(order)
            
        response = invoice_service.download_invoice(order_id)
        if not response:
            raise HTTPException(status_code=404, detail="Invoice file not found")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{order_id}", status_code=200)
def delete_order(order_id: int, db: Session = Depends(database.get_db)):
    try:
        crud.delete_order(db, order_id)
        return OnSuccess(message="Order deleted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
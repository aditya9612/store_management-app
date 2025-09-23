from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, crud, database, auth

router = APIRouter(prefix="/inquiries", tags=["Inquiries"])

# 🔹 Customer creates inquiry
@router.post("/", response_model=schemas.InquiryOut)
def create_inquiry(
    inquiry: schemas.InquiryCreate,
    db: Session = Depends(database.get_db)
):
    # Ensure customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == inquiry.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return crud.create_inquiry(db, inquiry)


# 🔹 Owner views all inquiries for their store
@router.get("/by-store/{store_id}", response_model=list[schemas.InquiryOut])
def get_inquiries_by_store(
    store_id: int,
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    # check ownership
    store = db.query(models.Store).filter(models.Store.id == store_id, models.Store.owner_id == current_owner.id).first()
    if not store:
        raise HTTPException(status_code=403, detail="Not authorized")

    return crud.get_inquiries_by_store(db, store_id)





# 🔹 Owner updates inquiry status (resolve/close)
@router.put("/{inquiry_id}/status")
def update_inquiry_status(
    inquiry_id: int,
    status: str,
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    # Check ownership
    if inquiry.store.owner_id != current_owner.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated = crud.update_inquiry_status(db, inquiry_id, status)
    return {"message": f"Inquiry {inquiry_id} status updated to {status}"}

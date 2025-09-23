from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, crud, database

router = APIRouter(prefix="/offers", tags=["Offers"])

get_db = database.get_db

# ---------------- Owner creates offer ----------------
@router.post("/", response_model=schemas.OfferOut)
def create_offer(offer: schemas.OfferCreate, db: Session = Depends(get_db)):
    db_offer = crud.create_offer(db, offer)

    # 🔹 Find customers to send SMS
    if offer.store_id:
        customers = db.query(models.Customer).filter(models.Customer.store_id == offer.store_id).all()
    else:
        customers = db.query(models.Customer).all()

    # 🔹 Demo SMS sending
    for customer in customers:
        if customer.phone:
            print(f"📩 SMS to {customer.phone}: {offer.title} - {offer.description} (Valid till {offer.valid_until})")

    return db_offer


# ---------------- Get offers by store ----------------
@router.get("/by-store/{store_id}", response_model=list[schemas.OfferOut])
def get_offers_by_store(store_id: int, db: Session = Depends(get_db)):
    return crud.get_offers_by_store(db, store_id)


# ---------------- Get all offers ----------------
@router.get("/", response_model=list[schemas.OfferOut])
def get_all_offers(db: Session = Depends(get_db)):
    return crud.get_all_offers(db)

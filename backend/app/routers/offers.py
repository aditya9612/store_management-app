from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import Offer, Store, Customer
from ..schemas import OfferCreate, OfferResponse, OfferUpdate

router = APIRouter(
    prefix="/offers",
    tags=["offers"],
)

@router.post("/", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(offer: OfferCreate, db: Session = Depends(get_db)):
    # Check if store exists
    store = db.query(Store).filter(Store.id == offer.store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store with id {offer.store_id} not found"
        )
    
    # Create new offer
    db_offer = Offer(
        title=offer.title,
        description=offer.description,
        discount=offer.discount,
        valid_until=offer.valid_until,
        store_id=offer.store_id
    )
    
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

@router.get("/by-store/{store_id}", response_model=List[OfferResponse])
def get_offers_by_store(store_id: int, db: Session = Depends(get_db)):
    # Check if store exists
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store with id {store_id} not found"
        )
    
    # Get offers for the store
    offers = db.query(Offer).filter(Offer.store_id == store_id).all()
    return offers

@router.post("/{offer_id}/send", status_code=status.HTTP_200_OK)
def send_offer_to_all_customers(offer_id: int, db: Session = Depends(get_db)):
    # Check if offer exists
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Offer with id {offer_id} not found"
        )
    
    # Get all customers for the store
    customers = db.query(Customer).filter(Customer.store_id == offer.store_id).all()
    
    # In a real application, you would send notifications to customers here
    # For now, we'll just return the number of customers notified
    return {"message": f"Offer sent to {len(customers)} customers", "customers_notified": len(customers)}

@router.put("/{offer_id}", response_model=OfferResponse)
def update_offer(offer_id: int, offer: OfferUpdate, db: Session = Depends(get_db)):
    db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    update_data = offer.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_offer, key, value)

    db.commit()
    db.refresh(db_offer)
    return db_offer


@router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offer(offer_id: int, db: Session = Depends(get_db)):
    db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    db.delete(db_offer)
    db.commit()
    return
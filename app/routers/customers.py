from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, crud, database, auth

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("/", response_model=schemas.CustomerOut)
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    return crud.create_customer(db, customer, current_owner.id)

@router.get("/", response_model=list[schemas.CustomerOut])
def get_customers(
    db: Session = Depends(database.get_db),
    current_owner = Depends(auth.get_current_owner)
):
    return crud.get_customers_by_owner(db, current_owner.id)

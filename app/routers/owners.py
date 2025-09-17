from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, crud, database
router = APIRouter(prefix="/owners", tags=["Owners"])

@router.post("/", response_model=schemas.OwnerOut)
def create_owner(owner: schemas.OwnerCreate, db: Session = Depends(database.get_db)):
    db_owner = crud.create_owner(db, owner)
    return db_owner

@router.get("/", response_model=list[schemas.OwnerOut])
def list_owners(db: Session = Depends(database.get_db)):
    return db.query(models.Owner).all()

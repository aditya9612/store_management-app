from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud, models
from app.database import get_db

router = APIRouter(prefix="/stores", tags=["Stores"])

@router.post("/", response_model=schemas.StoreOut)
def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db), owner_id: int = 1):
    # TODO: Replace `owner_id=1` with JWT auth user
    return crud.create_store(db, store, owner_id)

@router.get("/", response_model=list[schemas.StoreOut])
def get_stores(db: Session = Depends(get_db), owner_id: int = 1):
    return crud.get_stores_by_owner(db, owner_id)

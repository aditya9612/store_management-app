from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, crud, database

router = APIRouter(prefix="/stores", tags=["Stores"])

# Dependency
get_db = database.get_db

# ---------------- Owner → Get all stores ----------------
@router.get("/", response_model=list[schemas.StoreOut])
def get_stores(owner_id: int, db: Session = Depends(get_db)):
    stores = crud.get_stores_by_owner(db, owner_id)
    return stores

# ---------------- StoreMan → Get own store ----------------
@router.get("/me", response_model=schemas.StoreOut)
def get_my_store(store_id: int, db: Session = Depends(get_db)):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

# ---------------- Create new store ----------------
@router.post("/create", response_model=schemas.StoreOut)
def create_new_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    # Check if owner exists
    owner = db.query(models.Owner).filter(models.Owner.id == store.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    # Create store
    return crud.create_store(db, store)

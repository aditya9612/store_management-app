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
@router.put("/{store_id}", response_model=schemas.StoreOut)
def update_store(store_id: int, store: schemas.StoreBase, db: Session = Depends(get_db)):
    db_store = crud.update_store(db, store_id, store)
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    return db_store

@router.delete("/{store_id}")
def delete_store(store_id: int, db: Session = Depends(get_db)):
    db_store = crud.delete_store(db, store_id)
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    return {"message": "Store deleted successfully"}


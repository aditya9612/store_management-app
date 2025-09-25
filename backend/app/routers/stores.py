
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, crud, database
from app.response_structure import OnSuccess
from typing import List

router = APIRouter(prefix="/stores", tags=["Stores"])
get_db = database.get_db

@router.get("/", response_model=OnSuccess[List[schemas.Store]])
def get_stores(owner_id: int, db: Session = Depends(get_db)):
    try:
        stores = crud.get_stores_by_owner(db, owner_id)
        return OnSuccess(data=stores, message="Stores fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/details", response_model=OnSuccess[schemas.Store])
def get_my_store(store_id: int, db: Session = Depends(get_db)):
    try:
        store = db.query(models.Store).filter(models.Store.id == store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        return OnSuccess(data=store, message="Store fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create", response_model=OnSuccess[schemas.Store])
def create_new_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    try:
        owner = db.query(models.Owner).filter(models.Owner.id == store.owner_id).first()
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")
        db_store = crud.create_store(db, store)
        return OnSuccess(data=db_store, message="Store created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{store_id}", response_model=OnSuccess[schemas.Store])
def update_store(
    store_id: int,
    store_data: schemas.StoreCreate,
    db: Session = Depends(get_db)
):
    try:
        # Check if store exists
        db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
        if not db_store:
            raise HTTPException(status_code=404, detail="Store not found")
            
        # Check if owner exists
        owner = db.query(models.Owner).filter(models.Owner.id == store_data.owner_id).first()
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")
            
        # Update store
        updated_store = crud.update_store(db, store_id, store_data)
        if not updated_store:
            raise HTTPException(status_code=404, detail="Failed to update store")
            
        return OnSuccess(data=updated_store, message="Store updated successfully")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{store_id}", response_model=OnSuccess[dict])
def delete_store(store_id: int, db: Session = Depends(get_db)):
    try:
        # Check if store exists
        db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
        if not db_store:
            raise HTTPException(status_code=404, detail="Store not found")
            
        # Delete store
        deleted = crud.delete_store(db, store_id)
        if not deleted:
            raise HTTPException(status_code=500, detail="Failed to delete store")
            
        return OnSuccess(data={"id": store_id}, message="Store deleted successfully")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

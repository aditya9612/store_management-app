
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import schemas, models, crud, database
from app.response_structure import OnSuccess
from typing import List

router = APIRouter(prefix="/owners", tags=["Owners"])

@router.post("/", response_model=OnSuccess[schemas.Owner], status_code=201)
def create_owner(owner: schemas.OwnerCreate, db: Session = Depends(database.get_db)):
    try:
        db_owner = crud.create_owner(db, owner)
        return OnSuccess(data=schemas.Owner.from_orm(db_owner), message="Owner created successfully")
    except IntegrityError as e:
        db.rollback()
        error_message = str(e.orig)
        if "owners.email" in error_message:
            raise HTTPException(status_code=400, detail="Email already registered.")
        if "owners.mobile" in error_message:
            raise HTTPException(status_code=400, detail="Mobile number already registered.")
        raise HTTPException(status_code=400, detail="A database integrity error occurred.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@router.get("/", response_model=OnSuccess[List[schemas.Owner]])
def list_owners(db: Session = Depends(database.get_db)):
    try:
        owners = crud.get_owners(db)
        return OnSuccess(data=[schemas.Owner.from_orm(owner) for owner in owners], message="Owners fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@router.put("/{owner_id}", response_model=OnSuccess[schemas.Owner])
def update_owner_details(owner_id: int, owner: schemas.OwnerUpdate, db: Session = Depends(database.get_db)):
    try:
        db_owner = crud.update_owner(db, owner_id, owner)
        if db_owner is None:
            raise HTTPException(status_code=404, detail="Owner not found")
        return OnSuccess(data=schemas.Owner.from_orm(db_owner), message="Owner updated successfully")
    except IntegrityError as e:
        db.rollback()
        error_message = str(e.orig)
        if "owners.email" in error_message:
            raise HTTPException(status_code=400, detail="Email already registered.")
        if "owners.mobile" in error_message:
            raise HTTPException(status_code=400, detail="Mobile number already registered.")
        raise HTTPException(status_code=400, detail="A database integrity error occurred.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@router.delete("/{owner_id}", status_code=200)
def delete_owner_details(owner_id: int, db: Session = Depends(database.get_db)):
    try:
        crud.delete_owner(db, owner_id)
        return OnSuccess(message="Owner deleted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

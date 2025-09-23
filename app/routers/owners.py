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


@router.put("/{owner_id}", response_model=schemas.OwnerOut)
def update_owner(owner_id: int, owner: schemas.OwnerBase, db: Session = Depends(database.get_db)):
    db_owner = crud.update_owner(db, owner_id, owner)
    if not db_owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    return db_owner

@router.delete("/{owner_id}")
def delete_owner(owner_id: int, db: Session = Depends(database.get_db)):
    db_owner = crud.delete_owner(db, owner_id)
    if not db_owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    return {"message": "Owner deleted successfully"}

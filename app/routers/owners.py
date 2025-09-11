from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from .. import schemas, crud, database, auth

router = APIRouter(prefix="/owners", tags=["Owners"])

@router.post("/register", response_model=schemas.OwnerOut)
def register_owner(owner: schemas.OwnerCreate, db: Session = Depends(database.get_db)):
    db_owner = crud.create_owner(db, owner)
    return db_owner

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    owner = crud.authenticate_owner(db, form_data.username, form_data.password)
    if not owner:
        raise HTTPException(status_code=400, detail="Invalid mobile or password")
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": owner.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

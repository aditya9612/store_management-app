# app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, database, models
from datetime import datetime, timedelta
from app.auth import create_access_token  # Import the token creator

# Create an APIRouter instance for authentication routes
router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# Endpoint to request an OTP
@router.post("/request-otp")
def request_otp(otp_request: schemas.OTPRequest, db: Session = Depends(database.get_db)):
    # Check if the user is an Owner or a StoreMan
    if otp_request.role == "owner":
        user = crud.get_owner_by_mobile(db, otp_request.mobile)
    elif otp_request.role == "storeman":
        user = crud.get_storeman_by_mobile(db, otp_request.mobile)
    else:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    # If the user is not found, raise an error
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Generate and set the OTP for the user
    otp_code = crud.generate_otp()
    crud.set_otp_for_user(user, otp_code)
    db.commit() # Commit the changes to the database

    # In a real application, you would send this OTP via SMS or email
    print(f"OTP for {user.name} ({user.mobile}): {otp_code}") # For demonstration

    return {"message": "OTP sent successfully."}

# Endpoint to verify the OTP
@router.post("/verify-otp", response_model=schemas.Token)
def verify_otp(otp_verify: schemas.OTPVerify, db: Session = Depends(database.get_db)):
    # Check if the user is an Owner or a StoreMan
    if otp_verify.role == "owner":
        user = crud.get_owner_by_mobile(db, otp_verify.mobile)
    elif otp_verify.role == "storeman":
        user = crud.get_storeman_by_mobile(db, otp_verify.mobile)
    else:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    # If the user is not found, raise an error
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Verify the provided OTP
    if not crud.verify_otp_for_user(user, otp_verify.otp):
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    db.commit()

    # Generate JWT token
    token_data = {"sub": str(user.id), "role": otp_verify.role}
    access_token = create_access_token(token_data)

    return {"access_token": access_token, "token_type": "bearer"}
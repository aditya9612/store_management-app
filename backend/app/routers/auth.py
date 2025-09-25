# app/routers/auth.py


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, database, models
from datetime import datetime, timedelta
from app.response_structure import OnSuccess, OnError
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/request-otp")
def request_otp(otp_request: schemas.OTPRequest, db: Session = Depends(database.get_db)):
    try:
        if otp_request.role == "owner":
            user = crud.get_owner_by_mobile(db, otp_request.mobile)
        elif otp_request.role == "storeman":
            user = crud.get_storeman_by_mobile(db, otp_request.mobile)
        else:
            return JSONResponse(status_code=400, content=OnError(message="Invalid role specified"))
        if not user:
            return JSONResponse(status_code=404, content=OnError(message="Mobile number is Invalid. Contact Administrator"))
        otp_code = crud.generate_otp()
        crud.set_otp_for_user(user, otp_code)
        db.commit()
        return OnSuccess(data={"otp": otp_code}, message="OTP sent successfully")
    except Exception as e:
        return JSONResponse(status_code=500, content=OnError(message=str(e)))

@router.post("/verify-otp")
def verify_otp(otp_verify: schemas.OTPVerify, db: Session = Depends(database.get_db)):
    try:
        if otp_verify.role == "owner":
            user = crud.get_owner_by_mobile(db, otp_verify.mobile)
        elif otp_verify.role == "storeman":
            user = crud.get_storeman_by_mobile(db, otp_verify.mobile)
        else:
            return JSONResponse(status_code=400, content=OnError(message="Invalid role specified"))
        if not user:
            return JSONResponse(status_code=404, content=OnError(message="User not found."))
        if not crud.verify_otp_for_user(user, otp_verify.otp):
            db.rollback()
            return JSONResponse(status_code=401, content=OnError(message="Invalid or expired OTP."))
        db.commit()
        return OnSuccess(data={"owner_id": user.id, "role": otp_verify.role, "owner_name": user.name}, message="OTP verified successfully")
    except Exception as e:
        return JSONResponse(status_code=500, content=OnError(message=str(e)))

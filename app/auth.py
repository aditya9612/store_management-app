from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app import crud, database
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = HTTPBearer()

# Create JWT token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Get current owner from token
def get_current_owner(
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if not user_id or role != "owner":
            raise HTTPException(status_code=401, detail="Invalid token or role")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    owner = crud.get_owner_by_id(db, int(user_id))
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    return owner

# Get current storeman from token
def get_current_storeman(
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if not user_id or role != "storeman":
            raise HTTPException(status_code=401, detail="Invalid token or role")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    storeman = crud.get_storeman_by_id(db, int(user_id))
    if not storeman:
        raise HTTPException(status_code=404, detail="Storeman not found")
    return storeman

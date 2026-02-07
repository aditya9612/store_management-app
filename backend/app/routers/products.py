from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import os
from typing import Optional, List

from app import models, database, schemas
from app.response_structure import OnSuccess

router = APIRouter(prefix="/products", tags=["Products"])
get_db = database.get_db

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=OnSuccess[schemas.ProductOut])
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    store_id: int = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    try:
        store = db.query(models.Store).filter(models.Store.id == store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")

        image_path = None
        if image is not None:
            ext = os.path.splitext(image.filename)[1]
            safe_name = f"product_{store_id}_{name.replace(' ', '_')}"[:50]
            filename = f"{safe_name}{ext}"
            save_path = os.path.join(UPLOAD_DIR, filename)
            with open(save_path, "wb") as f:
                f.write(await image.read())
            image_path = f"/uploads/{filename}"

        product = models.Product(
            name=name,
            price=price,
            description=description,
            image_path=image_path,
            store_id=store_id,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return OnSuccess(data=product, message="Product created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=OnSuccess[List[schemas.ProductOut]])
def list_products(store_id: int, db: Session = Depends(get_db)):
    try:
        store = db.query(models.Store).filter(models.Store.id == store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        products = db.query(models.Product).filter(models.Product.store_id == store_id).all()
        return OnSuccess(data=products, message="Products fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{product_id}", response_model=OnSuccess[schemas.ProductOut])
async def update_product(
    product_id: int,
    name: str = Form(None),
    price: float = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    try:
        db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")

        if name is not None:
            db_product.name = name
        if price is not None:
            db_product.price = price
        if description is not None:
            db_product.description = description

        if image is not None:
            ext = os.path.splitext(image.filename)[1]
            safe_name = f"product_{db_product.store_id}_{db_product.name.replace(' ', '_')}"[:50]
            filename = f"{safe_name}{ext}"
            save_path = os.path.join(UPLOAD_DIR, filename)
            with open(save_path, "wb") as f:
                f.write(await image.read())
            db_product.image_path = f"/uploads/{filename}"

        db.commit()
        db.refresh(db_product)
        return OnSuccess(data=db_product, message="Product updated successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{product_id}", status_code=200)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    try:
        db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")

        if db_product.image_path:
            image_path = os.path.join(UPLOAD_DIR, os.path.basename(db_product.image_path))
            if os.path.exists(image_path):
                os.remove(image_path)

        db.delete(db_product)
        db.commit()
        return OnSuccess(message="Product deleted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



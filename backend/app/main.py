from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .routers import auth, stores, owners, customers, orders, bulk_upload, products, offers, company_admin, reports, owner_reports, admin_settings
from . import models


app = FastAPI(title="Shop Management API", version="1.0.0")

# Create all database tables
models.Base.metadata.create_all(bind=engine)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server (if used)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include application routers
app.include_router(auth.router)
app.include_router(stores.router)
app.include_router(owners.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(bulk_upload.router)
app.include_router(products.router)
app.include_router(offers.router)
app.include_router(company_admin.router)
app.include_router(reports.router)
app.include_router(owner_reports.router)
app.include_router(admin_settings.router)

# Serve uploaded files
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
if os.path.isdir(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


# Health check and root endpoints
@app.get("/")
def root():
    return {
        "message": "Shop Management API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }
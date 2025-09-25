from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .routers import auth, stores, owners, customers, orders, bulk_upload, products, offers, company_admin


app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # React development server (default)
        "http://localhost:5173",    # Vite development server (default)
        "http://localhost:8080",    # Alternative development port
        "http://127.0.0.1:3000",   # Alternative localhost
        "http://127.0.0.1:5173",   # Alternative localhost
        "http://127.0.0.1:8080",   # Alternative localhost
        "http://localhost:5174",    # Vite alternative port
        "http://127.0.0.1:5174",   # Alternative localhost
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

# Serve uploaded files
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
if os.path.isdir(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
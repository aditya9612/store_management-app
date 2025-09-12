from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import owners, customers,bulk_upload,orders

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI instance
app = FastAPI(title="Store Management System")

# Allow frontend (Vite runs on :5173 by default)
origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(owners.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(bulk_upload.router)

# Root endpoint
@app.get("/")
def root():
    return {"message": "Store Management API running 🚀"}

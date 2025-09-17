from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import owners, customers, orders, stores, auth

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Store Management System")

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(owners.router)
app.include_router(stores.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Store Management API running 🚀"}

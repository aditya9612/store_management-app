from fastapi import FastAPI
from .database import Base, engine
from .routers import owners, customers

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Store Management System")

# Routers
app.include_router(owners.router)
app.include_router(customers.router)

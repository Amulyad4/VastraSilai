import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, add_columns_if_missing
from app.scheduler import start_scheduler, shutdown_scheduler

# Import routes
from app.routes import auth, customers, orders, payments, deliveries, analytics, customer_dashboard, notifications

# Auto-create tables on startup (Supabase or local SQLite)
Base.metadata.create_all(bind=engine)
add_columns_if_missing()

app = FastAPI(
    title="VastraSilai AI API",
    description="Multilingual Tailoring Management System Backend Services",
    version="1.0.0"
)

# CORS configuration to connect from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict to Vite client domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists and mount it statically
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Background Scheduler Lifetime events
@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    shutdown_scheduler()

# Register Router endpoints
app.include_router(auth.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(deliveries.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(customer_dashboard.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "VastraSilai AI Backend Core",
        "supported_languages": ["en", "hi", "te"]
    }

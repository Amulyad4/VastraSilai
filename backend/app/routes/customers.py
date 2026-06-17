import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User, Customer, Measurement, Order, Payment
from app.schemas import CustomerCreate, CustomerUpdate, CustomerResponse, MeasurementUpdate, MeasurementResponse
from app.auth import require_tailor

router = APIRouter(prefix="/customers", tags=["Customer Management"])

# Base Directory to store uploads
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = None,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    # Query final customer list (only matching the current logged-in tailor)
    query = db.query(Customer).filter(Customer.tailor_id == current_user.id)
    if search:
        query = query.filter(
            (Customer.name.ilike(f"%{search}%")) | 
            (Customer.phone.contains(search))
        )
    return query.all()

@router.post("", response_model=CustomerResponse)
def add_customer(
    customer_in: CustomerCreate,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    # Check if this phone already exists under this tailor (to avoid duplicate customers)
    existing = db.query(Customer).filter(
        Customer.tailor_id == current_user.id,
        Customer.phone == customer_in.phone
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this phone number already exists under your profile"
        )
        
    customer = Customer(
        tailor_id=current_user.id,
        name=customer_in.name,
        phone=customer_in.phone,
        gender=customer_in.gender,
        address=customer_in.address,
        email=customer_in.email
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    
    # Initialize empty digital measurement table for this customer
    measurement = Measurement(customer_id=customer.id)
    db.add(measurement)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{id}", response_model=CustomerResponse)
def get_customer_details(
    id: int,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == id,
        Customer.tailor_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{id}", response_model=CustomerResponse)
def update_customer(
    id: int,
    customer_update: CustomerUpdate,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == id,
        Customer.tailor_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for field, value in customer_update.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{id}/measurements", response_model=MeasurementResponse)
def get_measurements(
    id: int,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    # Verify customer belongs to tailor
    customer = db.query(Customer).filter(
        Customer.id == id,
        Customer.tailor_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    measurement = db.query(Measurement).filter(Measurement.customer_id == id).first()
    if not measurement:
        # Fallback create if missing
        measurement = Measurement(customer_id=id)
        db.add(measurement)
        db.commit()
        db.refresh(measurement)
    return measurement

@router.put("/{id}/measurements", response_model=MeasurementResponse)
def update_measurements(
    id: int,
    measurement_in: MeasurementUpdate,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    # Verify customer belongs to tailor
    customer = db.query(Customer).filter(
        Customer.id == id,
        Customer.tailor_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    measurement = db.query(Measurement).filter(Measurement.customer_id == id).first()
    if not measurement:
        measurement = Measurement(customer_id=id)
        db.add(measurement)

    for field, value in measurement_in.model_dump(exclude_unset=True).items():
        setattr(measurement, field, value)

    db.commit()
    db.refresh(measurement)
    return measurement

@router.post("/{id}/upload-reference", response_model=MeasurementResponse)
async def upload_reference_image(
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == id,
        Customer.tailor_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    measurement = db.query(Measurement).filter(Measurement.customer_id == id).first()
    if not measurement:
        measurement = Measurement(customer_id=id)
        db.add(measurement)

    # Save Uploaded file
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save upload file: {e}")

    # Set file reference URL (served statically)
    relative_url = f"/uploads/{unique_filename}"
    measurement.reference_image_url = relative_url
    db.commit()
    db.refresh(measurement)
    return measurement

@router.delete("/{id}")
def delete_customer(
    id: int,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == id,
        Customer.tailor_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    # Also delete the global User login account for this customer (if role is 'customer')
    # to prevent auto-provisioning from re-creating this customer on subsequent GET requests.
    user = db.query(User).filter(User.phone == customer.phone, User.role == "customer").first()
    if user:
        db.delete(user)
        
    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}


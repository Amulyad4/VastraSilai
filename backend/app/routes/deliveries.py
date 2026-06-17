import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Any

from app.database import get_db
from app.models import User, Order, Customer
from app.schemas import OrderResponse, DeliveryScheduleResponse
from app.auth import require_tailor

router = APIRouter(prefix="/deliveries", tags=["Delivery Schedule Management"])

@router.get("/schedule", response_model=DeliveryScheduleResponse)
def get_delivery_schedule(
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    today = datetime.date.today()
    
    # Query all active orders for this tailor
    orders = db.query(Order).filter(Order.tailor_id == current_user.id).all()
    
    overdue: List[OrderResponse] = []
    today_deliveries: List[OrderResponse] = []
    upcoming: List[OrderResponse] = []
    
    for o in orders:
        # Load customer profile
        customer = db.query(Customer).filter(Customer.id == o.customer_id).first()
        o.customer = customer # Bind customer object manually if eager loading is not set
        
        # Check delivery status
        if o.status != "Delivered":
            if o.delivery_date < today:
                overdue.append(o)
            elif o.delivery_date == today:
                today_deliveries.append(o)
            else:
                upcoming.append(o)
        else:
            # Delivered orders in the future or today go to history, but let's include in upcoming if needed.
            # Usually only pending/completed go to active schedules.
            pass
            
    # Sort upcoming by date ascending
    upcoming.sort(key=lambda x: x.delivery_date)
    overdue.sort(key=lambda x: x.delivery_date)
    today_deliveries.sort(key=lambda x: x.delivery_date)

    # Compile calendar events: all orders (completed, pending, delivered) within a 60-day window
    calendar_events = []
    for o in orders:
        cust = db.query(Customer).filter(Customer.id == o.customer_id).first()
        calendar_events.append({
            "id": o.id,
            "title": f"{cust.name if cust else 'Customer'} - {o.cloth_type.capitalize()}",
            "start": o.delivery_date.isoformat(),
            "status": o.status,
            "paymentStatus": o.payment_status,
            "balance": o.balance_amount,
            "clothType": o.cloth_type
        })

    return {
        "overdue": overdue,
        "today": today_deliveries,
        "upcoming": upcoming,
        "calendar": calendar_events
    }

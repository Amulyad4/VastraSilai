from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models import User, Order, Customer, Payment, Notification
from app.schemas import CustomerDashboardResponse, OrderResponse, NotificationResponse
from app.auth import require_customer

router = APIRouter(prefix="/customer", tags=["Customer Portal"])

@router.get("/dashboard", response_model=CustomerDashboardResponse)
def get_customer_dashboard(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    # Find all customer profiles across different tailors matching the logged in customer's phone or name (case-insensitive)
    from sqlalchemy import func
    customers = db.query(Customer).filter(
        (Customer.phone == current_user.phone) |
        (func.lower(Customer.name) == func.lower(current_user.name))
    ).all()
    
    if not customers:
        return CustomerDashboardResponse(orders=[], pending_balance=0.0, notifications=[])
        
    customer_ids = [c.id for c in customers]
    
    # Query all orders for these customer profiles
    orders = db.query(Order).filter(Order.customer_id.in_(customer_ids)).order_by(Order.delivery_date.asc()).all()
    
    # Attach customer objects, tailor names, and payments eagerly
    order_responses = []
    total_pending_balance = 0.0
    
    for o in orders:
        cust = db.query(Customer).filter(Customer.id == o.customer_id).first()
        o.customer = cust
        
        # Fetch tailor details
        tailor = db.query(User).filter(User.id == o.tailor_id).first()
        if tailor:
            o.tailor_name = tailor.shop_name or tailor.name
        else:
            o.tailor_name = "Tailor"
            
        total_pending_balance += o.balance_amount
        order_responses.append(o)
        
    # Query all notifications for this customer
    notifications = db.query(Notification).filter(
        Notification.customer_id.in_(customer_ids)
    ).order_by(Notification.sent_at.desc()).all()
    
    notif_list = []
    for n in notifications:
        notif_list.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "sent_at": n.sent_at.isoformat(),
            "status": n.status
        })

    return {
        "orders": order_responses,
        "pending_balance": total_pending_balance,
        "notifications": notif_list
    }

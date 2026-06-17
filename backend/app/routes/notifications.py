from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import User, Customer, Notification
from app.schemas import NotificationResponse
from app.auth import get_current_user, require_tailor
from app.services.twilio_service import send_whatsapp_message
from app.scheduler import run_daily_notifications

router = APIRouter(prefix="/notifications", tags=["WhatsApp Notifications"])

class SendWhatsAppRequest(BaseModel):
    customer_id: int
    title: str
    message: str

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "tailor":
        # Return notifications sent by this tailor
        return db.query(Notification).filter(
            Notification.tailor_id == current_user.id
        ).order_by(Notification.sent_at.desc()).all()
    else:
        # Resolve customer phone
        customers = db.query(Customer).filter(Customer.phone == current_user.phone).all()
        customer_ids = [c.id for c in customers]
        return db.query(Notification).filter(
            Notification.customer_id.in_(customer_ids)
        ).order_by(Notification.sent_at.desc()).all()

@router.post("/send-whatsapp")
def send_custom_whatsapp(
    req: SendWhatsAppRequest,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == req.customer_id,
        Customer.tailor_id == current_user.id
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
        
    success = send_whatsapp_message(
        db=db,
        message=req.message,
        to_phone=customer.phone,
        tailor_id=current_user.id,
        customer_id=customer.id,
        title=req.title
    )
    
    if success:
        return {"status": "success", "message": "WhatsApp reminder sent successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send WhatsApp message via Twilio API"
        )

@router.post("/trigger-daily-run")
def trigger_daily_run(
    current_user: User = Depends(require_tailor),
):
    # Runs the daily notification job immediately in a background task thread
    try:
        run_daily_notifications()
        return {"status": "success", "message": "Daily WhatsApp notification batch execution triggered and completed."}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute notification job: {e}"
        )

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Order, Payment
from app.schemas import PaymentCreate, PaymentResponse
from app.auth import require_tailor

router = APIRouter(tags=["Smart Payment Tracking"])

@router.get("/payments", response_model=List[PaymentResponse])
def get_all_payments(
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    # Retrieve all payments for orders belonging to this tailor
    payments = db.query(Payment).join(Order).filter(Order.tailor_id == current_user.id).order_by(Payment.payment_date.desc()).all()
    return payments

@router.post("/orders/{order_id}/payments", response_model=PaymentResponse)
def add_payment(
    order_id: int,
    payment_in: PaymentCreate,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    # Verify order exists and belongs to tailor
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.tailor_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    if order.balance_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This order is already fully paid"
        )
        
    if payment_in.amount > order.balance_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount (₹{payment_in.amount}) exceeds the remaining balance (₹{order.balance_amount})"
        )

    # Record payment transaction
    payment = Payment(
        order_id=order_id,
        amount=payment_in.amount,
        payment_method=payment_in.payment_method,
        transaction_id=payment_in.transaction_id,
        notes=payment_in.notes
    )
    db.add(payment)
    
    # Recalculate financial fields on the parent order
    order.advance_amount += payment_in.amount
    order.balance_amount = order.total_amount - order.advance_amount
    if payment_in.transaction_id:
        order.transaction_id = payment_in.transaction_id
    
    if order.balance_amount <= 0:
        order.payment_status = "Paid"
    else:
        order.payment_status = "Partially Paid"

    db.commit()
    db.refresh(payment)
    return payment

@router.get("/orders/{order_id}/payments", response_model=List[PaymentResponse])
def get_order_payments(
    order_id: int,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    # Verify order belongs to tailor
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.tailor_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    return order.payments

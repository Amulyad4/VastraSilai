from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models import User, Customer, Order, Payment, Measurement
from app.schemas import OrderCreate, OrderUpdate, OrderResponse
from app.auth import require_tailor

router = APIRouter(prefix="/orders", tags=["Order Management"])

def calculate_payment_status(total: float, advance: float) -> tuple[float, str]:
    balance = total - advance
    if balance <= 0:
        return 0.0, "Paid"
    elif advance > 0:
        return balance, "Partially Paid"
    else:
        return balance, "Pending"

@router.get("", response_model=List[OrderResponse])
def get_orders(
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    cloth_type: Optional[str] = None,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    query = db.query(Order).filter(Order.tailor_id == current_user.id)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if status:
        query = query.filter(Order.status == status)
    if cloth_type:
        query = query.filter(Order.cloth_type == cloth_type)
    return query.order_by(Order.delivery_date.asc()).all()

@router.post("", response_model=OrderResponse)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    # Perform smart payment validation
    if order_in.advance_amount > order_in.total_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Advance paid cannot exceed total amount"
        )

    # Search for customer in customers table (case-insensitive, tailor-scoped)
    customer = db.query(Customer).filter(
        func.lower(Customer.name) == func.lower(order_in.customer_name),
        Customer.tailor_id == current_user.id
    ).first()

    if not customer:
        # Search registered customer users (case-insensitive)
        cust_user = db.query(User).filter(
            func.lower(User.name) == func.lower(order_in.customer_name),
            User.role == "customer"
        ).first()

        if cust_user:
            customer = Customer(
                name=order_in.customer_name,
                phone=cust_user.phone,
                email=cust_user.email,
                tailor_id=current_user.id,
                gender="Male"
            )
        else:
            customer = Customer(
                name=order_in.customer_name,
                phone="0000000000",
                email=None,
                tailor_id=current_user.id,
                gender="Male"
            )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    balance, pay_status = calculate_payment_status(order_in.total_amount, order_in.advance_amount)

    order = Order(
        tailor_id=current_user.id,
        customer_id=customer.id,
        cloth_type=order_in.cloth_type,
        order_date=date.today(),
        delivery_date=order_in.delivery_date,
        status=order_in.status,
        total_amount=order_in.total_amount,
        advance_amount=order_in.advance_amount,
        balance_amount=balance,
        payment_status=pay_status,
        transaction_id=order_in.transaction_id
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Auto-log initial payment history if advance payment was made
    if order_in.advance_amount > 0:
        payment_log = Payment(
            order_id=order.id,
            amount=order_in.advance_amount,
            payment_method="Cash",
            transaction_id=order_in.transaction_id,
            notes="Initial advance payment recorded during order creation."
        )
        db.add(payment_log)
        db.commit()
        db.refresh(order)

    return order

@router.get("/{id}", response_model=OrderResponse)
def get_order_by_id(
    id: int,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == id,
        Order.tailor_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{id}", response_model=OrderResponse)
def update_order(
    id: int,
    order_update: OrderUpdate,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == id,
        Order.tailor_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Update simple fields
    if order_update.cloth_type is not None:
        order.cloth_type = order_update.cloth_type
    if order_update.delivery_date is not None:
        order.delivery_date = order_update.delivery_date
    if order_update.status is not None:
        old_status = order.status
        order.status = order_update.status
        if order.status != old_status:
            status_msgs = {
                "In Progress": "Your order is being stitched.",
                "Ready": "Your order is ready for pickup.",
                "Delivered": "Your order has been delivered."
            }
            if order.status in status_msgs:
                try:
                    from app.services.twilio_service import send_whatsapp_message
                    send_whatsapp_message(
                        db=db,
                        message=status_msgs[order.status],
                        to_phone=order.customer.phone,
                        tailor_id=current_user.id,
                        customer_id=order.customer_id,
                        title=f"Order Update: {order.status}"
                    )
                except Exception as e:
                    print(f"Error sending WhatsApp status update notification: {e}")
    if order_update.transaction_id is not None:
        order.transaction_id = order_update.transaction_id

    # If pricing updates
    total_changed = order_update.total_amount is not None
    advance_changed = order_update.advance_amount is not None

    if total_changed or advance_changed:
        new_total = order_update.total_amount if total_changed else order.total_amount
        new_advance = order_update.advance_amount if advance_changed else order.advance_amount

        if new_advance > new_total:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Advance paid cannot exceed total amount"
            )

        balance, pay_status = calculate_payment_status(new_total, new_advance)
        order.total_amount = new_total
        order.advance_amount = new_advance
        order.balance_amount = balance
        order.payment_status = pay_status

    db.commit()
    db.refresh(order)
    return order

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    id: int,
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == id,
        Order.tailor_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db.delete(order)
    db.commit()
    return None

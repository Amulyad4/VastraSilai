import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Dict, List, Any

from app.database import get_db
from app.models import User, Order, Payment, Customer
from app.schemas import RevenueAnalyticsResponse, TopCustomer, DailyRevenue, MonthlyRevenue
from app.auth import require_tailor

router = APIRouter(prefix="/analytics", tags=["Revenue Analytics"])

@router.get("/revenue", response_model=RevenueAnalyticsResponse)
def get_revenue_analytics(
    current_user: User = Depends(require_tailor),
    db: Session = Depends(get_db)
):
    today = datetime.date.today()
    local_offset = datetime.datetime.now().astimezone().utcoffset() or datetime.timedelta(0)
    
    start_of_today_local = datetime.datetime.combine(today, datetime.time.min)
    start_of_today_utc = start_of_today_local - local_offset
    
    start_of_month_local = datetime.datetime(today.year, today.month, 1)
    start_of_month_utc = start_of_month_local - local_offset

    # 1. Daily Earnings (Sum of payments made today)
    daily_earnings_query = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).join(Order).filter(
        Order.tailor_id == current_user.id,
        Payment.payment_date >= start_of_today_utc
    ).scalar()

    # 2. Monthly Revenue (Sum of payments made this calendar month)
    monthly_revenue_query = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).join(Order).filter(
        Order.tailor_id == current_user.id,
        Payment.payment_date >= start_of_month_utc
    ).scalar()

    # 3. Pending Collection (Total balance remaining to collect)
    pending_collection_query = db.query(func.coalesce(func.sum(Order.balance_amount), 0.0)).filter(
        Order.tailor_id == current_user.id
    ).scalar()

    # 4. Completed Orders Count (Orders either completed or delivered)
    completed_orders_count = db.query(func.count(Order.id)).filter(
        Order.tailor_id == current_user.id,
        Order.status.in_(["Completed", "Delivered"])
    ).scalar()

    # 5. Top Customers: aggregate count and total billing
    top_cust_query = db.query(
        Customer.id,
        Customer.name,
        Customer.phone,
        func.count(Order.id).label("order_count"),
        func.coalesce(func.sum(Order.total_amount), 0.0).label("total_spent")
    ).join(Order, Order.customer_id == Customer.id).filter(
        Order.tailor_id == current_user.id
    ).group_by(Customer.id, Customer.name, Customer.phone).order_by(
        func.sum(Order.total_amount).desc()
    ).limit(5).all()

    top_customers = [
        TopCustomer(
            id=c[0],
            name=c[1],
            phone=c[2],
            order_count=c[3],
            total_spent=float(c[4])
        ) for c in top_cust_query
    ]

    # 6. Daily Revenue Chart Data (Last 7 days)
    daily_chart_data = []
    for i in range(6, -1, -1):
        target_day = today - datetime.timedelta(days=i)
        day_start_local = datetime.datetime.combine(target_day, datetime.time.min)
        day_end_local = datetime.datetime.combine(target_day, datetime.time.max)
        
        day_start_utc = day_start_local - local_offset
        day_end_utc = day_end_local - local_offset
        
        day_rev = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).join(Order).filter(
            Order.tailor_id == current_user.id,
            Payment.payment_date >= day_start_utc,
            Payment.payment_date <= day_end_utc
        ).scalar()
        
        daily_chart_data.append(
            DailyRevenue(
                date=target_day.strftime("%d %b"),
                revenue=float(day_rev)
            )
        )

    # 7. Monthly Revenue Chart Data (Last 6 calendar months)
    monthly_chart_data = []
    # To determine last 6 months dynamically:
    for m in range(5, -1, -1):
        # Calculate month offset
        year_offset = (today.month - 1 - m) // 12
        month_offset = (today.month - 1 - m) % 12 + 1
        target_year = today.year + year_offset
        target_month = month_offset
        
        month_start_local = datetime.datetime(target_year, target_month, 1)
        if target_month == 12:
            month_end_local = datetime.datetime(target_year + 1, 1, 1) - datetime.timedelta(seconds=1)
        else:
            month_end_local = datetime.datetime(target_year, target_month + 1, 1) - datetime.timedelta(seconds=1)
            
        month_start_utc = month_start_local - local_offset
        month_end_utc = month_end_local - local_offset
            
        month_rev = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).join(Order).filter(
            Order.tailor_id == current_user.id,
            Payment.payment_date >= month_start_utc,
            Payment.payment_date <= month_end_utc
        ).scalar()
        
        month_label = datetime.date(target_year, target_month, 1).strftime("%b %Y")
        monthly_chart_data.append(
            MonthlyRevenue(
                month=month_label,
                revenue=float(month_rev)
            )
        )

    return RevenueAnalyticsResponse(
        daily_earnings=float(daily_earnings_query),
        monthly_revenue=float(monthly_revenue_query),
        pending_collection=float(pending_collection_query),
        completed_orders=completed_orders_count,
        top_customers=top_customers,
        revenue_chart_data=daily_chart_data,
        monthly_chart_data=monthly_chart_data
    )

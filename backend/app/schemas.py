from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    language: str

class TokenData(BaseModel):
    phone: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)
    role: str = "tailor" # 'tailor' or 'customer'
    language: str = "en" # 'en', 'hi', 'te'
    shop_name: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    name: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = None
    role: str
    language: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    language: Optional[str] = None
    password: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    phone: str

class BypassLoginRequest(BaseModel):
    role: str
    name_or_phone: Optional[str] = None


# Measurement Schemas
class MeasurementUpdate(BaseModel):
    chest: Optional[float] = None
    waist: Optional[float] = None
    shoulder: Optional[float] = None
    sleeve: Optional[float] = None
    length: Optional[float] = None
    neck: Optional[float] = None
    hip: Optional[float] = None
    notes: Optional[str] = None
    reference_image_url: Optional[str] = None

class MeasurementResponse(BaseModel):
    id: int
    customer_id: int
    chest: Optional[float] = None
    waist: Optional[float] = None
    shoulder: Optional[float] = None
    sleeve: Optional[float] = None
    length: Optional[float] = None
    neck: Optional[float] = None
    hip: Optional[float] = None
    notes: Optional[str] = None
    reference_image_url: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

# Customer Schemas
class CustomerCreate(BaseModel):
    name: str
    phone: str
    gender: str
    address: Optional[str] = None
    email: Optional[EmailStr] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None

class CustomerResponse(BaseModel):
    id: int
    tailor_id: int
    name: str
    phone: str
    gender: str
    address: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    measurements: Optional[MeasurementResponse] = None

    class Config:
        from_attributes = True

# Payment Schemas
class PaymentCreate(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "Cash"  # Cash, UPI, Card, Other
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentOrderResponse(BaseModel):
    id: int
    cloth_type: str
    customer_id: int
    customer: Optional[CustomerResponse] = None

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    payment_date: datetime
    payment_method: str
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    order: Optional[PaymentOrderResponse] = None

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    customer_name: str
    cloth_type: Optional[str] = "shirt"  # shirt, pant, blouse, kurta, suit
    delivery_date: date
    total_amount: float = Field(..., ge=0)
    advance_amount: float = Field(default=0.0, ge=0)
    transaction_id: Optional[str] = None
    status: Optional[str] = "Pending"

class OrderUpdate(BaseModel):
    cloth_type: Optional[str] = None
    delivery_date: Optional[date] = None
    status: Optional[str] = None  # Pending, In Progress, Ready, Delivered
    total_amount: Optional[float] = None
    advance_amount: Optional[float] = None
    transaction_id: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    tailor_id: int
    tailor_name: Optional[str] = None
    customer_id: int
    customer: Optional[CustomerResponse] = None
    cloth_type: str
    order_date: date
    delivery_date: date
    status: str
    total_amount: float
    advance_amount: float
    balance_amount: float
    payment_status: str
    transaction_id: Optional[str] = None
    
    created_at: datetime
    payments: List[PaymentResponse] = []

    class Config:
        from_attributes = True

# Customer Dashboard Details (consolidated response)
class CustomerDashboardResponse(BaseModel):
    orders: List[OrderResponse] = []
    pending_balance: float = 0.0
    notifications: List[dict] = []

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    tailor_id: Optional[int] = None
    customer_id: Optional[int] = None
    title: str
    message: str
    type: str
    sent_at: datetime
    status: str

    class Config:
        from_attributes = True

# Analytics Response Schemas
class TopCustomer(BaseModel):
    id: int
    name: str
    phone: str
    order_count: int
    total_spent: float

class DailyRevenue(BaseModel):
    date: str
    revenue: float

class MonthlyRevenue(BaseModel):
    month: str
    revenue: float

class RevenueAnalyticsResponse(BaseModel):
    daily_earnings: float
    monthly_revenue: float
    pending_collection: float
    completed_orders: int
    top_customers: List[TopCustomer] = []
    revenue_chart_data: List[DailyRevenue] = []
    monthly_chart_data: List[MonthlyRevenue] = []

class DeliveryScheduleResponse(BaseModel):
    overdue: List[OrderResponse]
    today: List[OrderResponse]
    upcoming: List[OrderResponse]
    calendar: List[Dict[str, Any]]


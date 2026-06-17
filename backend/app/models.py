from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="tailor")  # 'tailor', 'customer'
    language = Column(String(10), nullable=False, default="en")   # 'en', 'hi', 'te'
    shop_name = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    tailor_id = Column(Integer, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False, index=True)
    gender = Column(String(20), nullable=False)
    address = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    measurements = relationship("Measurement", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Measurement Fields
    chest = Column(Float, nullable=True)
    waist = Column(Float, nullable=True)
    shoulder = Column(Float, nullable=True)
    sleeve = Column(Float, nullable=True)
    length = Column(Float, nullable=True)
    neck = Column(Float, nullable=True)
    hip = Column(Float, nullable=True)
    
    notes = Column(Text, nullable=True)
    reference_image_url = Column(String(500), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="measurements")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    tailor_id = Column(Integer, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    cloth_type = Column(String(50), nullable=False)  # 'shirt', 'pant', 'blouse', 'kurta', 'suit'
    order_date = Column(Date, nullable=False)
    delivery_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False, default="Pending")  # 'Pending', 'Completed', 'Delivered'
    
    # Financial fields
    total_amount = Column(Float, nullable=False, default=0.0)
    advance_amount = Column(Float, nullable=False, default=0.0)
    balance_amount = Column(Float, nullable=False, default=0.0)
    payment_status = Column(String(50), nullable=False, default="Pending")  # 'Paid', 'Partially Paid', 'Pending'
    transaction_id = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
    payment_method = Column(String(50), default="Cash")  # 'Cash', 'UPI', 'Card', 'Other'
    transaction_id = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    order = relationship("Order", back_populates="payments")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    tailor_id = Column(Integer, index=True, nullable=True)
    customer_id = Column(Integer, index=True, nullable=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="general")  # 'delivery', 'payment', 'general'
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), nullable=False, default="sent")  # 'sent', 'failed'

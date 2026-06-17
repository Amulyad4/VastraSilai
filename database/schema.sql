-- VastraSilai AI Database Schema
-- Compatible with PostgreSQL (Supabase) and SQLite

-- 1. Users Table (Tailors & Customers authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'tailor', -- 'tailor' or 'customer'
    language VARCHAR(10) NOT NULL DEFAULT 'en', -- 'en', 'hi', 'te'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table (Managed by Tailors)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    tailor_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for customer searching
CREATE INDEX IF NOT EXISTS idx_customers_tailor_id ON customers(tailor_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- 3. Digital Measurements Table (Linked to Customers)
CREATE TABLE IF NOT EXISTS measurements (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER UNIQUE NOT NULL,
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    shoulder DECIMAL(5,2),
    sleeve DECIMAL(5,2),
    length DECIMAL(5,2),
    neck DECIMAL(5,2),
    hip DECIMAL(5,2),
    notes TEXT,
    reference_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    tailor_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    cloth_type VARCHAR(50) NOT NULL, -- 'shirt', 'pant', 'blouse', 'kurta', 'suit'
    order_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Completed', 'Delivered'
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    advance_amount DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    balance_amount DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Paid', 'Partially Paid', 'Pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_tailor_id ON orders(tailor_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

-- 5. Payments Table (Tracks individual payment logs per order)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- 6. Notifications Table (Daily summary logs and automated alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    tailor_id INTEGER,
    customer_id INTEGER,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'delivery', 'payment', 'general'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'sent' -- 'sent', 'failed'
);

CREATE INDEX IF NOT EXISTS idx_notifications_tailor_id ON notifications(tailor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);

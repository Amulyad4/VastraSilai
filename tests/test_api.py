import os
import sys
import pytest
from fastapi.testclient import TestClient

# Adjust path to import app correctly
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

# Force test database override
os.environ["DATABASE_URL"] = "sqlite:///./test_vastrasilai.db"

from app.main import app
from app.database import Base, engine, SessionLocal

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Make sure we use a clean SQLite DB for testing
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup after testing

def test_root_route():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "VastraSilai AI Backend Core"

def test_auth_registration_and_login():
    # 1. Register a Tailor
    register_payload = {
        "name": "Master Tailor Ramesh",
        "phone": "9876543210",
        "email": "ramesh@example.com",
        "password": "securepassword123",
        "role": "tailor",
        "language": "en",
        "shop_name": "Ramesh Tailors",
        "address": "123 Stitch St"
    }
    reg_res = client.post("/api/auth/register", json=register_payload)
    assert reg_res.status_code == 200
    assert reg_res.json()["phone"] == "9876543210"
    assert reg_res.json()["role"] == "tailor"

    # 2. Login Tailor
    login_payload = {
        "name": "Master Tailor Ramesh",
        "password": "securepassword123",
        "role": "tailor"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
    assert login_res.json()["role"] == "tailor"
    
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Retrieve user details (/auth/me)
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Master Tailor Ramesh"

def test_customer_and_measurements_crud():
    # Login to get authorization
    login_res = client.post("/api/auth/login", json={
        "name": "Master Tailor Ramesh",
        "password": "securepassword123",
        "role": "tailor"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a Customer record
    cust_payload = {
        "name": "Lakshmi Prasanna",
        "phone": "9988776655",
        "gender": "Female",
        "address": "Kukatpally, Hyderabad",
        "email": "lakshmi@example.com"
    }
    cust_res = client.post("/api/customers", json=cust_payload, headers=headers)
    assert cust_res.status_code == 200
    cust_id = cust_res.json()["id"]
    assert cust_res.json()["name"] == "Lakshmi Prasanna"

    # 2. Retrieve Measurements (should be default/empty initially)
    meas_res = client.get(f"/api/customers/{cust_id}/measurements", headers=headers)
    assert meas_res.status_code == 200
    assert meas_res.json()["chest"] is None

    # 3. Update Measurements
    meas_update = {
        "chest": 38.5,
        "waist": 32.0,
        "shoulder": 15.0,
        "sleeve": 22.5,
        "length": 42.0,
        "neck": 7.5,
        "hip": 40.0,
        "notes": "Prefers heavy gold border stitching"
    }
    update_res = client.put(f"/api/customers/{cust_id}/measurements", json=meas_update, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["chest"] == 38.5
    assert update_res.json()["notes"] == "Prefers heavy gold border stitching"

def test_order_creation_and_balance_math():
    # Login
    login_res = client.post("/api/auth/login", json={
        "name": "Master Tailor Ramesh",
        "password": "securepassword123",
        "role": "tailor"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Book an order with an advance
    order_payload = {
        "customer_name": "Lakshmi Prasanna",
        "cloth_type": "suit",
        "delivery_date": "2026-06-25",
        "total_amount": 2500.0,
        "advance_amount": 1000.0,
        "status": "In Progress"
    }
    order_res = client.post("/api/orders", json=order_payload, headers=headers)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["cloth_type"] == "suit"
    assert order_data["status"] == "In Progress"
    
    # Verify math
    assert order_data["balance_amount"] == 1500.0
    assert order_data["payment_status"] == "Partially Paid"
    
    order_id = order_data["id"]

    # 2. Record an installment payment for the remaining balance
    pay_payload = {
        "amount": 1500.0,
        "payment_method": "UPI",
        "notes": "UPI final clearance"
      }
    pay_res = client.post(f"/api/orders/{order_id}/payments", json=pay_payload, headers=headers)
    assert pay_res.status_code == 200
    
    # Verify the order status gets updated
    check_res = client.get(f"/api/orders/{order_id}", headers=headers)
    assert check_res.json()["balance_amount"] == 0.0
    assert check_res.json()["payment_status"] == "Paid"

def test_transaction_id_and_order_deletion():
    # Login
    login_res = client.post("/api/auth/login", json={
        "name": "Master Tailor Ramesh",
        "password": "securepassword123",
        "role": "tailor"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create an order with transaction_id
    order_payload = {
        "customer_name": "Lakshmi Prasanna",
        "cloth_type": "shirt",
        "delivery_date": "2026-06-30",
        "total_amount": 1000.0,
        "advance_amount": 300.0,
        "transaction_id": "TXN-ADV-999"
    }
    order_res = client.post("/api/orders", json=order_payload, headers=headers)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["transaction_id"] == "TXN-ADV-999"
    order_id = order_data["id"]

    # 2. Check the initial payment's transaction_id
    payments_res = client.get(f"/api/orders/{order_id}/payments", headers=headers)
    assert payments_res.status_code == 200
    payments = payments_res.json()
    assert len(payments) == 1
    assert payments[0]["transaction_id"] == "TXN-ADV-999"

    # 3. Add another payment with transaction_id
    pay_payload = {
        "amount": 700.0,
        "payment_method": "UPI",
        "notes": "Clear balance",
        "transaction_id": "TXN-INST-888"
    }
    pay_res = client.post(f"/api/orders/{order_id}/payments", json=pay_payload, headers=headers)
    assert pay_res.status_code == 200
    
    # 4. Check order transaction_id and payments transaction_ids
    check_res = client.get(f"/api/orders/{order_id}", headers=headers)
    assert check_res.status_code == 200
    order_data = check_res.json()
    assert order_data["transaction_id"] == "TXN-INST-888"
    assert order_data["balance_amount"] == 0.0

    payments_res = client.get(f"/api/orders/{order_id}/payments", headers=headers)
    payments = payments_res.json()
    assert len(payments) == 2
    # The list should contain both payments
    txn_ids = [p["transaction_id"] for p in payments]
    assert "TXN-ADV-999" in txn_ids
    assert "TXN-INST-888" in txn_ids

    # 5. Delete the order
    delete_res = client.delete(f"/api/orders/{order_id}", headers=headers)
    assert delete_res.status_code == 204

    # 6. Verify order is deleted
    get_deleted = client.get(f"/api/orders/{order_id}", headers=headers)
    assert get_deleted.status_code == 404

def test_customer_portal_registration_and_dashboard():
    # 1. Register customer user (must match pre-existing customer 'Lakshmi Prasanna')
    cust_register_payload = {
        "name": "Lakshmi Prasanna",
        "phone": "9988776655",
        "email": "lakshmi@example.com",
        "password": "customerpassword123",
        "role": "customer",
        "language": "en"
    }
    reg_res = client.post("/api/auth/register", json=cust_register_payload)
    assert reg_res.status_code == 200
    assert reg_res.json()["role"] == "customer"

    # 2. Login customer
    cust_login_payload = {
        "name": "Lakshmi Prasanna",
        "password": "customerpassword123",
        "role": "customer"
    }
    login_res = client.post("/api/auth/login", json=cust_login_payload)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Retrieve customer details (/auth/me)
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Lakshmi Prasanna"

    # 4. Access Customer Dashboard
    dashboard_res = client.get("/api/customer/dashboard", headers=headers)
    assert dashboard_res.status_code == 200
    dashboard_data = dashboard_res.json()
    assert "orders" in dashboard_data
    assert "pending_balance" in dashboard_data
    assert "notifications" in dashboard_data


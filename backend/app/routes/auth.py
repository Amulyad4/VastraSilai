from datetime import timedelta
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, Token, UserResponse, UserUpdate, ForgotPasswordRequest, BypassLoginRequest
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

logger = logging.getLogger("AuthRouter")
router = APIRouter(prefix="/auth", tags=["Authentication"])

def normalize_phone(phone: str) -> str:
    if not phone:
        return ""
    digits = "".join(c for c in phone if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits

@router.post("/register", response_model=UserResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    logger.info(f"Registration attempt: name='{user_in.name}', phone='{user_in.phone}', role='{user_in.role}'")
    
    # Check if phone number is already registered (check raw input and normalized)
    norm_phone = normalize_phone(user_in.phone)
    existing_user = db.query(User).filter(
        (User.phone == user_in.phone) | (User.phone == norm_phone)
    ).first()
    if existing_user:
        logger.warning(f"Registration failed: Phone number '{user_in.phone}' is already registered as user '{existing_user.name}'")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # If customer registering, verify they match a customer profile entered by a tailor (by phone or name)
    if user_in.role == "customer":
        from sqlalchemy import func
        from app.models import Customer
        name_lower = user_in.name.strip().lower()
        
        # Query candidates by name or raw phone or normalized phone
        candidates = db.query(Customer).filter(
            (Customer.phone == user_in.phone) |
            (Customer.phone == norm_phone) |
            (func.lower(func.trim(Customer.name)) == name_lower)
        ).all()
        
        customer_profile = None
        for cand in candidates:
            if normalize_phone(cand.phone) == norm_phone or cand.name.strip().lower() == name_lower:
                customer_profile = cand
                break
                
        if not customer_profile:
            logger.warning(f"Customer registration failed: no matching customer profile found in tailor database for name='{user_in.name}', phone='{user_in.phone}'")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No customer record found with this name/phone. Please register with the exact details registered by your tailor."
            )

    # Hash password and create new User
    hashed_password = get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        phone=norm_phone if norm_phone else user_in.phone,
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role,
        language=user_in.language,
        shop_name=user_in.shop_name,
        address=user_in.address
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"User '{user.name}' successfully registered as '{user.role}'")

    # Update phone/email in matching Customer profiles if a customer registered
    if user.role == "customer":
        from sqlalchemy import func
        from app.models import Customer
        matching_profiles = db.query(Customer).filter(
            (Customer.phone == user.phone) |
            (Customer.phone == user_in.phone) |
            (func.lower(func.trim(Customer.name)) == func.lower(user.name.strip()))
        ).all()
        for c in matching_profiles:
            c.phone = user.phone
            if user.email:
                c.email = user.email
        db.commit()

    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Login attempt: name/phone='{credentials.name}', role='{credentials.role}'")
    
    norm_name = normalize_phone(credentials.name)
    # Fetch user by name or phone, and role (case-insensitive for name)
    user = db.query(User).filter(
        (
            (func.lower(User.name) == func.lower(credentials.name)) | 
            (User.phone == credentials.name) | 
            (User.phone == norm_name)
        ),
        User.role == credentials.role
    ).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Login failed for name/phone='{credentials.name}', role='{credentials.role}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create Access Token
    access_token = create_access_token(
        data={"sub": user.phone, "role": user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "language": user.language
    }

@router.post("/bypass-login", response_model=Token)
def bypass_login(req: BypassLoginRequest, db: Session = Depends(get_db)):
    logger.info(f"Bypass login request: role='{req.role}', name_or_phone='{req.name_or_phone}'")
    
    role = req.role.lower()
    if role not in ["tailor", "customer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'tailor' or 'customer'"
        )
        
    user = None
    
    if req.name_or_phone:
        norm_phone = normalize_phone(req.name_or_phone)
        user = db.query(User).filter(
            (
                (User.name == req.name_or_phone) | 
                (User.phone == req.name_or_phone) | 
                (User.phone == norm_phone)
            ),
            User.role == role
        ).first()
        
    if not user:
        if role == "tailor":
            if req.name_or_phone:
                from app.auth import get_password_hash
                norm_phone = normalize_phone(req.name_or_phone)
                user = User(
                    name=req.name_or_phone,
                    phone=norm_phone if norm_phone else "9999999999",
                    password_hash=get_password_hash("password123"),
                    role="tailor",
                    language="en",
                    shop_name=f"{req.name_or_phone}'s Shop",
                    address="Default Address"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                user = db.query(User).filter(User.role == "tailor").first()
                if not user:
                    from app.auth import get_password_hash
                    user = User(
                        name="Demo Tailor",
                        phone="9999999999",
                        password_hash=get_password_hash("password123"),
                        role="tailor",
                        language="en",
                        shop_name="VastraSilai Tailors",
                        address="Main Bazaar, Hyderabad"
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
        else: # customer
            from app.models import Customer
            customer_profile = None
            if req.name_or_phone:
                norm_phone = normalize_phone(req.name_or_phone)
                customer_profile = db.query(Customer).filter(
                    (Customer.name == req.name_or_phone) |
                    (Customer.phone == req.name_or_phone) |
                    (Customer.phone == norm_phone)
                ).first()
            
            if not customer_profile:
                customer_profile = db.query(Customer).first()
                
            if not customer_profile:
                tailor = db.query(User).filter(User.role == "tailor").first()
                tailor_id = tailor.id if tailor else 1
                customer_profile = Customer(
                    tailor_id=tailor_id,
                    name="Demo Customer",
                    phone="8529637411",
                    gender="Male",
                    address="123 Customer St"
                )
                db.add(customer_profile)
                db.commit()
                db.refresh(customer_profile)
                
            user = db.query(User).filter(User.phone == customer_profile.phone).first()
            if not user:
                from app.auth import get_password_hash
                user = User(
                    name=customer_profile.name,
                    phone=customer_profile.phone,
                    password_hash=get_password_hash("password123"),
                    role="customer",
                    language="en"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
    access_token = create_access_token(
        data={"sub": user.phone, "role": user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "language": user.language
    }

@router.get("/bypass-profiles")
def get_bypass_profiles(db: Session = Depends(get_db)):
    tailors = db.query(User).filter(User.role == "tailor").all()
    from app.models import Customer
    customers = db.query(Customer).all()
    
    return {
        "tailors": [{"id": t.id, "name": t.name, "phone": t.phone, "shop_name": t.shop_name} for t in tailors],
        "customers": [{"id": c.id, "name": c.name, "phone": c.phone} for c in customers]
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        # Avoid user enumeration by sending a standard success message anyway
        return {"message": "If this phone number is registered, you will receive a reset code."}
    
    # Simulate sending SMS/Email
    reset_code = "VS-" + str(user.id * 123 + 4567)[-6:]
    logger.info(f"--- FORGOT PASSWORD RESET CODE SIMULATOR ---")
    logger.info(f"To: {user.phone} ({user.name})")
    logger.info(f"Your VastraSilai AI reset code is: {reset_code}")
    logger.info(f"--------------------------------------------")
    
    return {
        "message": "Reset code generated and simulated successfully. In production, this goes via Twilio/SMTP.",
        "debug_code": reset_code  # Exposing for easy local manual verification
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        current_user.email = user_update.email
    if user_update.language is not None:
        current_user.language = user_update.language
    if user_update.password is not None and len(user_update.password) >= 6:
        current_user.password_hash = get_password_hash(user_update.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

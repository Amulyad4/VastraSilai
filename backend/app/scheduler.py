import datetime
import logging
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import SessionLocal
from app.models import User, Customer, Order
from app.services.twilio_service import send_whatsapp_message

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BackgroundScheduler")

scheduler = BackgroundScheduler()

def run_daily_notifications():
    """
    Sends automated daily WhatsApp summary to tailors and reminders to customers.
    """
    logger.info("Executing scheduled daily tailoring notifications...")
    db = SessionLocal()
    try:
        # 1. Fetch all tailors
        tailors = db.query(User).filter(User.role == "tailor").all()
        today = datetime.date.today()
        tomorrow = today + datetime.timedelta(days=1)
        
        for tailor in tailors:
            # Get orders due today (pending or completed but not yet delivered)
            today_orders = db.query(Order).filter(
                Order.tailor_id == tailor.id,
                Order.delivery_date == today,
                Order.status != "Delivered"
            ).all()

            # Get orders due tomorrow (for customer alerts)
            tomorrow_orders = db.query(Order).filter(
                Order.tailor_id == tailor.id,
                Order.delivery_date == tomorrow,
                Order.status != "Delivered"
            ).all()

            # Get completed/delivered orders with outstanding payments
            pending_payments = db.query(Order).filter(
                Order.tailor_id == tailor.id,
                Order.balance_amount > 0,
                Order.status.in_(["Completed", "Delivered"])
            ).all()

            # -------------------------------------------------------------
            # A. TAILOR SUMMARY
            # -------------------------------------------------------------
            expected_collection = sum(o.balance_amount for o in today_orders)
            
            # Calculate total outstanding balance across all orders
            total_outstanding = db.query(Order).filter(
                Order.tailor_id == tailor.id,
                Order.balance_amount > 0
            ).all()
            total_pending_balance = sum(o.balance_amount for o in total_outstanding)
            
            # Calculate overdue orders count
            overdue_orders = db.query(Order).filter(
                Order.tailor_id == tailor.id,
                Order.delivery_date < today,
                Order.status != "Delivered"
            ).all()
            overdue_count = len(overdue_orders)

            # Dynamic translation for Tailor Alert
            lang = tailor.language
            if lang == "hi":
                title = "दैनिक सिलाई रिपोर्ट"
                msg = f"शुभ प्रभात, {tailor.name}!\n\nवस्त्रसिलाई दैनिक रिपोर्ट:\n"
                msg += f"• आज की डिलीवरी: {len(today_orders)} (अपेक्षित संग्रह: ₹{expected_collection})\n"
                msg += f"• विलंबित आर्डर: {overdue_count}\n"
                msg += f"• कुल लंबित संग्रह: ₹{total_pending_balance}\n\n"
                
                if today_orders:
                    msg += "आज की डिलीवरी सूची:\n"
                    for idx, o in enumerate(today_orders, 1):
                        cust = db.query(Customer).filter(Customer.id == o.customer_id).first()
                        name = cust.name if cust else "ग्राहक"
                        msg += f"{idx}. {name} - शेष ₹{o.balance_amount}\n"
                else:
                    msg += "आज कोई डिलीवरी निर्धारित नहीं है।"
            elif lang == "te":
                title = "రోజువారీ టైలరింగ్ నివేదిక"
                msg = f"శుభోదయం, {tailor.name}!\n\nవస్త్రసిలై రోజువారీ నివేదిక:\n"
                msg += f"• ఈరోజు డెలివరీలు: {len(today_orders)} (ఆశించిన వసూలు: ₹{expected_collection})\n"
                msg += f"• గడువు ముగిసిన ఆర్డర్లు: {overdue_count}\n"
                msg += f"• మొత్తం బ్యాలెన్స్ వసూళ్లు: ₹{total_pending_balance}\n\n"
                
                if today_orders:
                    msg += "ఈరోజు డెలివరీల జాబితా:\n"
                    for idx, o in enumerate(today_orders, 1):
                        cust = db.query(Customer).filter(Customer.id == o.customer_id).first()
                        name = cust.name if cust else "కస్టమర్"
                        msg += f"{idx}. {name} - బ్యాలెన్స్ ₹{o.balance_amount}\n"
                else:
                    msg += "ఈరోజు ఎటువంటి డెలివరీలు షెడ్యూల్ చేయబడలేదు."
            else:  # Default English
                title = "Daily Tailoring Report"
                msg = f"Good Morning, {tailor.name}!\n\nVastraSilai Morning Summary:\n"
                msg += f"• Today's Deliveries: {len(today_orders)} (Expected Collection: ₹{expected_collection})\n"
                msg += f"• Overdue Orders: {overdue_count}\n"
                msg += f"• Total Outstanding Balance: ₹{total_pending_balance}\n\n"
                
                if today_orders:
                    msg += "Today's Delivery List:\n"
                    for idx, o in enumerate(today_orders, 1):
                        cust = db.query(Customer).filter(Customer.id == o.customer_id).first()
                        name = cust.name if cust else "Customer"
                        msg += f"{idx}. {name} (Balance ₹{o.balance_amount})\n"
                else:
                    msg += "No deliveries scheduled for today."
            
            send_whatsapp_message(
                db=db,
                message=msg,
                to_phone=tailor.phone,
                tailor_id=tailor.id,
                title=title
            )

            # -------------------------------------------------------------
            # B. CUSTOMER REMINDERS: DELIVERIES DUE TOMORROW
            # -------------------------------------------------------------
            for order in tomorrow_orders:
                cust = db.query(Customer).filter(Customer.id == order.customer_id).first()
                if cust:
                    # Resolve customer language
                    cust_user = db.query(User).filter(User.phone == cust.phone).first()
                    cust_lang = cust_user.language if cust_user else tailor.language
                    
                    if cust_lang == "hi":
                        title = "डिलीवरी अनुस्मारक (ग्राहक)"
                        msg = f"नमस्ते {cust.name}! VastraSilai अनुस्मारक: आपका {order.cloth_type} का आर्डर कल तैयार है। बकाया राशि: ₹{order.balance_amount}।"
                    elif cust_lang == "te":
                        title = "డెలివరీ రిమైండర్ (కస్టమర్)"
                        msg = f"నమస్తే {cust.name}! VastraSilai రిమైండర్: మీ {order.cloth_type} ఆర్డర్ రేపు డెలివరీకి సిద్ధంగా ఉంది. బ్యాలెన్స్: ₹{order.balance_amount}."
                    else:
                        title = "Delivery Reminder (Customer)"
                        msg = f"Hello {cust.name}! Quick reminder from VastraSilai: Your {order.cloth_type} is scheduled for delivery tomorrow. Balance due: ₹{order.balance_amount}."

                    send_whatsapp_message(
                        db=db,
                        message=msg,
                        to_phone=cust.phone,
                        tailor_id=tailor.id,
                        customer_id=cust.id,
                        title=title
                    )

            # -------------------------------------------------------------
            # C. CUSTOMER REMINDERS: OUTSTANDING BALANCE
            # -------------------------------------------------------------
            for order in pending_payments:
                cust = db.query(Customer).filter(Customer.id == order.customer_id).first()
                if cust:
                    cust_user = db.query(User).filter(User.phone == cust.phone).first()
                    cust_lang = cust_user.language if cust_user else tailor.language
                    
                    if cust_lang == "hi":
                        title = "भुगतान अनुस्मारक (ग्राहक)"
                        msg = f"नमस्ते {cust.name}! VastraSilai अनुस्मारक: आपके {order.cloth_type} आर्डर के लिए ₹{order.balance_amount} का भुगतान अभी भी लंबित है। कृपया जल्द भुगतान करें।"
                    elif cust_lang == "te":
                        title = "చెల్లింపు రిమైండర్ (కస్టమర్)"
                        msg = f"నమస్తే {cust.name}! VastraSilai రిమైండర్: మీ {order.cloth_type} ఆర్డర్ బ్యాలెన్స్ ₹{order.balance_amount} ఇంకా చెల్లించాల్సి ఉంది. దయచేసి త్వరగా చెల్లించండి."
                    else:
                        title = "Payment Reminder (Customer)"
                        msg = f"Hello {cust.name}! Gentle reminder from VastraSilai: An outstanding balance of ₹{order.balance_amount} is pending for your {order.cloth_type} order. Please settle it soon."

                    send_whatsapp_message(
                        db=db,
                        message=msg,
                        to_phone=cust.phone,
                        tailor_id=tailor.id,
                        customer_id=cust.id,
                        title=title
                    )

        logger.info("Daily scheduled notifications completed successfully.")
    except Exception as e:
        logger.error(f"Error executing daily scheduled notifications: {e}")
    finally:
        db.close()

def start_scheduler():
    # Setup cron trigger for daily at 8:00 AM
    trigger = CronTrigger(hour=8, minute=0)
    scheduler.add_job(
        run_daily_notifications,
        trigger=trigger,
        id="daily_whatsapp_job",
        replace_existing=True
    )
    scheduler.start()
    logger.info("APScheduler initialized: Scheduled Daily Job at 08:00 AM local time.")

def shutdown_scheduler():
    scheduler.shutdown()
    logger.info("APScheduler background service stopped.")

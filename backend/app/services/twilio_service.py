import logging
from sqlalchemy.orm import Session
from app.config import settings
from app.models import Notification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TwilioWhatsAppService")

def send_whatsapp_message(
    db: Session,
    message: str,
    to_phone: str,
    tailor_id: int = None,
    customer_id: int = None,
    title: str = "WhatsApp Notification"
) -> bool:
    """
    Sends a WhatsApp message using Twilio WhatsApp API.
    If Twilio credentials are not set, it prints the message to logs and stores a Notification entry in DB.
    """
    # Standardize to_phone to WhatsApp format if not already
    to_whatsapp = to_phone
    if not to_whatsapp.startswith("whatsapp:"):
        clean_phone = to_phone.strip()
        if not clean_phone.startswith("+"):
            # Assume local Indian numbers if 10 digits and no prefix
            if len(clean_phone) == 10:
                clean_phone = "+91" + clean_phone
            elif len(clean_phone) == 12 and clean_phone.startswith("91"):
                clean_phone = "+" + clean_phone
        to_whatsapp = f"whatsapp:{clean_phone}"

    # Print nicely in console log
    logger.info(f"\n========================================\n"
                f"--- WHATSAPP NOTIFICATION SENDING ---\n"
                f"Title: {title}\n"
                f"To: {to_whatsapp}\n"
                f"Message:\n{message}\n"
                f"========================================")

    status = "sent"
    success = True

    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=message,
                from_=settings.TWILIO_WHATSAPP_NUMBER,
                to=to_whatsapp
            )
            logger.info("Successfully sent WhatsApp message via Twilio API.")
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message via Twilio API: {e}")
            status = "failed"
            success = False
    else:
        logger.info("Twilio API credentials missing in .env. Mocking delivery.")

    # Record notification in DB
    try:
        # Resolve type
        notif_type = "general"
        lower_title = title.lower()
        lower_msg = message.lower()
        if "delivery" in lower_title or "due tomorrow" in lower_msg:
            notif_type = "delivery"
        elif "payment" in lower_title or "pending" in lower_msg or "balance" in lower_msg:
            notif_type = "payment"

        notif = Notification(
            tailor_id=tailor_id,
            customer_id=customer_id,
            title=title,
            message=message,
            type=notif_type,
            status=status
        )
        db.add(notif)
        db.commit()
    except Exception as db_err:
        db.rollback()
        logger.error(f"Failed to record notification log in DB: {db_err}")

    return success

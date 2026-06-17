import os
from pydantic_settings import BaseSettings

# Locate the .env file in parent directories
env_path = ".env"
if not os.path.exists(env_path):
    # Check if in backend directory and .env is at the workspace root
    parent_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    if os.path.exists(parent_env):
        env_path = parent_env
    else:
        # Check one level up (backend folder level)
        sibling_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        if os.path.exists(sibling_env):
            env_path = sibling_env

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    DATABASE_URL: str = "sqlite:///./database/vastrasilai.db"
    JWT_SECRET: str = "super_secret_key_for_vastrasilai_ai_2026_change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"
    
    class Config:
        env_file = env_path
        extra = "ignore"

settings = Settings()

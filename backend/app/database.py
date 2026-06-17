import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import URL
from app.config import settings

database_url = settings.DATABASE_URL
is_sqlite = database_url.startswith("sqlite")

# Normalize relative SQLite paths to be absolute relative to the project root directory
if is_sqlite:
    db_relative_path = database_url.replace("sqlite:///", "")
    if not os.path.isabs(db_relative_path):
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        db_absolute_path = os.path.abspath(os.path.join(project_root, db_relative_path))
        database_url = f"sqlite:///{db_absolute_path}"


# Handle connection string parsing with password special character escaping
if not is_sqlite and (database_url.startswith("postgres://") or database_url.startswith("postgresql://")):
    prefix = "postgresql://" if database_url.startswith("postgresql://") else "postgres://"
    connection_part = database_url.replace(prefix, "", 1)
    
    if "@" in connection_part:
        # Split at the last '@' to isolate host from credentials
        creds_part, host_part = connection_part.rsplit("@", 1)
        
        # Parse credentials
        username = "postgres"
        password = ""
        if ":" in creds_part:
            username, password = creds_part.split(":", 1)
        else:
            username = creds_part
            
        username = urllib.parse.unquote(username)
        password = urllib.parse.unquote(password)
        
        # Parse host details
        port = 5432
        dbname = "postgres"
        host = host_part
        
        if "/" in host_part:
            host_port, dbname = host_part.split("/", 1)
            # Remove any query parameters
            dbname = dbname.split("?")[0]
        else:
            host_port = host_part
            
        if ":" in host_port:
            host, port_str = host_port.split(":", 1)
            port = int(port_str)
        else:
            host = host_port
            
        # Construct SQL URL
        engine_url = URL.create(
            drivername="postgresql+psycopg2",
            username=username,
            password=password,
            host=host,
            port=port,
            database=dbname
        )
    else:
        engine_url = database_url
else:
    engine_url = database_url

# Ensure parent directory exists for local SQLite database
if is_sqlite:
    db_path = database_url.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    engine_url,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def add_columns_if_missing():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            # Check and add transaction_id to orders table
            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN transaction_id VARCHAR(255)"))
                if hasattr(conn, "commit"):
                    conn.commit()
            except Exception:
                pass

            # Check and add transaction_id to payments table
            try:
                conn.execute(text("ALTER TABLE payments ADD COLUMN transaction_id VARCHAR(255)"))
                if hasattr(conn, "commit"):
                    conn.commit()
            except Exception:
                pass

            # Add columns to users table
            for col, col_type in [("shop_name", "VARCHAR(255)"), ("address", "TEXT")]:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                    if hasattr(conn, "commit"):
                        conn.commit()
                    print(f"Successfully added {col} column to users table.")
                except Exception:
                    pass

            # Add columns to orders table
            order_cols = [
                ("chest", "FLOAT"),
                ("waist", "FLOAT"),
                ("shoulder", "FLOAT"),
                ("sleeve", "FLOAT"),
                ("length", "FLOAT"),
                ("fabric_type", "VARCHAR(100)"),
                ("quantity", "INTEGER DEFAULT 1")
            ]
            for col, col_type in order_cols:
                try:
                    conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col} {col_type}"))
                    if hasattr(conn, "commit"):
                        conn.commit()
                    print(f"Successfully added {col} column to orders table.")
                except Exception:
                    pass
    except Exception as e:
        print(f"Error checking/adding db columns: {e}")

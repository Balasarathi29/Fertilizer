from sqlalchemy import create_engine
from urllib.parse import quote_plus

username = "root"
password = quote_plus("Ashwin@2004")
host = "127.0.0.1"
port = 3307
database = "bhoomi_bloom"

DATABASE_URL = (
    f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
)

print(DATABASE_URL)

engine = create_engine(DATABASE_URL)

try:
    conn = engine.connect()
    print("✅ Connected Successfully!")
    conn.close()
except Exception as e:
    print("❌ Connection Failed")
    print(repr(e))
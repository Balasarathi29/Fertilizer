import os
import logging
from urllib.parse import quote_plus
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

logger = logging.getLogger("bhoomi_bloom_database")

# Extract configuration
db_user = quote_plus(settings.DB_USER)
db_password = quote_plus(settings.DB_PASSWORD)
db_host = settings.DB_HOST
db_port = settings.DB_PORT
db_name = settings.DB_NAME

MYSQL_URL = os.getenv("DATABASE_URL") or f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
SQLITE_URL = settings.SQLITE_URL

engine = None

# Attempt MySQL connection
try:
    # First connect without database name to ensure database exists
    base_mysql_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}"
    temp_engine = create_engine(base_mysql_url, pool_pre_ping=True)
    with temp_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"))
    temp_engine.dispose()

    engine = create_engine(MYSQL_URL, pool_pre_ping=True, pool_recycle=3600)
    with engine.connect() as conn:
        logger.info(f"✅ Connected successfully to MySQL Database: {db_name} at {db_host}:{db_port}")
except Exception as e:
    logger.warning(f"⚠️ MySQL connection failed ({e}). Falling back to SQLite database: {SQLITE_URL}")
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


class CollectionWrapper:
    """
    Adapter wrapper providing dict-style collection interface over SQLAlchemy ORM models.
    """
    def __init__(self, session, model_cls):
        self.session = session
        self.model_cls = model_cls

    def _doc_to_dict(self, obj):
        if obj is None:
            return None
        # Extract all columns into a raw dictionary
        d = {}
        for c in obj.__table__.columns:
            val = getattr(obj, c.name)
            d[c.name] = val
        if hasattr(obj, "to_dict"):
            custom_d = obj.to_dict()
            # Preserve internal security fields like password_hash if present on model
            if hasattr(obj, "password_hash") and obj.password_hash:
                custom_d["password_hash"] = obj.password_hash
            return custom_d
        return d

    def find_one(self, filter_query: dict = None) -> dict:
        query = self.session.query(self.model_cls)
        if filter_query:
            for k, v in filter_query.items():
                if hasattr(self.model_cls, k):
                    query = query.filter(getattr(self.model_cls, k) == v)
        obj = query.first()
        return self._doc_to_dict(obj)

    def find(self, filter_query: dict = None) -> list:
        query = self.session.query(self.model_cls)
        if filter_query:
            for k, v in filter_query.items():
                if hasattr(self.model_cls, k):
                    query = query.filter(getattr(self.model_cls, k) == v)
        objs = query.all()
        return [self._doc_to_dict(o) for o in objs]

    def insert_one(self, doc: dict):
        if not isinstance(doc, dict):
            return doc
        valid_keys = {c.name for c in self.model_cls.__table__.columns}
        clean_doc = {k: v for k, v in doc.items() if k in valid_keys and k != "_id"}
        
        obj = self.model_cls(**clean_doc)
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return self._doc_to_dict(obj)

    def update_one(self, filter_query: dict, update_data: dict, upsert: bool = False):
        query = self.session.query(self.model_cls)
        for k, v in filter_query.items():
            if hasattr(self.model_cls, k):
                query = query.filter(getattr(self.model_cls, k) == v)
        obj = query.first()

        data_to_set = update_data.get("$set", update_data) if isinstance(update_data, dict) else update_data
        
        if not obj:
            if upsert:
                new_doc = {**filter_query, **data_to_set}
                return self.insert_one(new_doc)
            return False

        for k, v in data_to_set.items():
            if hasattr(self.model_cls, k):
                setattr(obj, k, v)
        self.session.commit()
        return True

    def delete_one(self, filter_query: dict) -> bool:
        query = self.session.query(self.model_cls)
        for k, v in filter_query.items():
            if hasattr(self.model_cls, k):
                query = query.filter(getattr(self.model_cls, k) == v)
        obj = query.first()
        if obj:
            self.session.delete(obj)
            self.session.commit()
            return True
        return False

    def count_documents(self, filter_query: dict = None) -> int:
        query = self.session.query(self.model_cls)
        if filter_query:
            for k, v in filter_query.items():
                if hasattr(self.model_cls, k):
                    query = query.filter(getattr(self.model_cls, k) == v)
        return query.count()


class ExtendedSession:
    """
    Wraps SQLAlchemy Session to provide collection attribute access while maintaining standard Session methods.
    """
    def __init__(self, session):
        self._session = session

    def __getattr__(self, name):
        from database.model import (
            User, Product, Category, Order, CartItem, WishlistItem, Review, Notification, SoilAnalysisRecord, FlashSale,
            BhoomiCardConfig, CustomerBhoomiCard, SpinWheelConfig, SpinWheelReward, UserSpinLog, UserIssuedReward
        )
        model_map = {
            "users": User,
            "products": Product,
            "categories": Category,
            "orders": Order,
            "carts": CartItem,
            "wishlists": WishlistItem,
            "reviews": Review,
            "notifications": Notification,
            "soil_analysis": SoilAnalysisRecord,
            "disease_detection": SoilAnalysisRecord,
            "flash_sales": FlashSale,
            "bhoomi_card_configs": BhoomiCardConfig,
            "customer_bhoomi_cards": CustomerBhoomiCard,
            "spin_wheel_configs": SpinWheelConfig,
            "spin_wheel_rewards": SpinWheelReward,
            "user_spin_logs": UserSpinLog,
            "user_issued_rewards": UserIssuedReward
        }
        if name in model_map:
            return CollectionWrapper(self._session, model_map[name])
        return getattr(self._session, name)


def get_db():
    db = SessionLocal()
    ext_db = ExtendedSession(db)
    try:
        yield ext_db
    finally:
        db.close()
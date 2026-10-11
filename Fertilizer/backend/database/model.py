import json
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=True)
    name = Column(String(100), nullable=True)
    username = Column(String(50), unique=True, nullable=True, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="farmer")  # farmer, seller, admin
    mobile = Column(String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    location = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.id,
            "name": self.name or self.full_name or "User",
            "full_name": self.full_name or self.name or "User",
            "username": self.username or self.email.split("@")[0],
            "email": self.email,
            "role": (self.role or "farmer").lower(),
            "mobile": self.mobile or self.phone or "",
            "phone": self.phone or self.mobile or "",
            "location": self.location or "India",
            "is_active": self.is_active if self.is_active is not None else True,
            "created_at": str(self.created_at) if self.created_at else ""
        }


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    rating = Column(Float, default=4.5)
    reviews = Column(Integer, default=100)
    isOrganic = Column(Boolean, default=True)
    image = Column(String(255), nullable=True)
    placeholder = Column(String(10), default="🌱")
    description = Column(Text, nullable=True)
    stock = Column(Integer, default=50)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "rating": self.rating or 4.5,
            "reviews": self.reviews or 100,
            "isOrganic": self.isOrganic if self.isOrganic is not None else True,
            "image": self.image or "seed_tomato.jpg",
            "placeholder": self.placeholder or "🌱",
            "description": self.description or "",
            "stock": self.stock if self.stock is not None else 50
        }


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    id_slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "id_slug": self.id_slug,
            "name": self.name,
            "description": self.description or ""
        }


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, default=1)
    name = Column(String(200), nullable=True)
    price = Column(Float, default=0.0)
    image = Column(String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "product_id": self.product_id,
            "quantity": self.quantity or 1,
            "name": self.name or "",
            "price": self.price or 0.0,
            "image": self.image or ""
        }


CartItem = Cart


class Wishlist(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    product_id = Column(Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "product_id": self.product_id
        }


WishlistItem = Wishlist


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), nullable=False, index=True)
    customer_name = Column(String(100), nullable=True)
    name = Column(String(100), nullable=True)
    shipping_address = Column(Text, nullable=True)
    delivery_location_json = Column(Text, nullable=True)
    payment_method = Column(String(50), default="UPI")
    payment_status = Column(String(50), default="Paid")
    order_status = Column(String(50), default="Order Placed")
    items_subtotal = Column(Float, default=0.0)
    shipping_charge = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    coupon_code = Column(String(50), nullable=True)
    items_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        items = []
        if self.items_json:
            try:
                items = json.loads(self.items_json)
            except Exception:
                items = []
        
        delivery_loc = {}
        if self.delivery_location_json:
            try:
                delivery_loc = json.loads(self.delivery_location_json)
            except Exception:
                delivery_loc = {}

        return {
            "_id": self.order_id,
            "id": self.order_id,
            "order_id": self.order_id,
            "email": self.email,
            "name": self.name or self.customer_name or "",
            "customer_name": self.customer_name or self.name or "",
            "shipping_address": self.shipping_address or "",
            "delivery_location": delivery_loc,
            "payment_method": self.payment_method or "UPI",
            "payment_status": self.payment_status or "Paid",
            "order_status": self.order_status or "Order Placed",
            "items_subtotal": self.items_subtotal or self.total_amount,
            "shipping_charge": self.shipping_charge or 0.0,
            "discount_amount": self.discount_amount or 0.0,
            "total_amount": self.total_amount,
            "coupon_code": self.coupon_code or "",
            "items": items,
            "date": str(self.created_at) if self.created_at else "",
            "created_at": str(self.created_at) if self.created_at else ""
        }


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False)
    user_name = Column(String(100), nullable=True)
    name = Column(String(100), nullable=True)
    product_id = Column(Integer, nullable=False)
    rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name or self.user_name or "User",
            "product_id": self.product_id,
            "rating": self.rating or 5.0,
            "comment": self.comment or ""
        }


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read if self.is_read is not None else False
        }


class SoilAnalysisRecord(Base):
    __tablename__ = "soil_analysis"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    crop_type = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    image_path = Column(String(255), nullable=True)
    report_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        report_data = {}
        if self.report_json:
            try:
                report_data = json.loads(self.report_json)
            except Exception:
                report_data = {}
        return {
            "id": self.id,
            "_id": str(self.id),
            "email": self.email,
            "crop_type": self.crop_type or "",
            "location": self.location or "",
            "image_path": self.image_path or "",
            "report_data": report_data,
            "created_at": str(self.created_at) if self.created_at else ""
        }


class CropHistoryRecord(Base):
    __tablename__ = "crop_history"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    crop = Column(String(100), nullable=False)
    confidence = Column(String(20), default="94.5%")
    expected_yield = Column(String(50), default="2.5 - 3.5 Tons per Acre")
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    N = Column(Float, nullable=True)
    P = Column(Float, nullable=True)
    K = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "_id": str(self.id),
            "email": self.email,
            "crop": self.crop,
            "confidence": self.confidence or "94.5%",
            "yield": self.expected_yield or "2.5 - 3.5 Tons per Acre",
            "temperature": self.temperature,
            "humidity": self.humidity,
            "rainfall": self.rainfall,
            "ph": self.ph,
            "N": self.N,
            "P": self.P,
            "K": self.K,
            "date": str(self.created_at)[:10] if self.created_at else ""
        }


class DiseaseDetectionRecord(Base):
    __tablename__ = "disease_detection"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    crop_hint = Column(String(100), nullable=True)
    image_path = Column(String(255), nullable=True)
    result_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        result = {}
        if self.result_json:
            try:
                result = json.loads(self.result_json)
            except Exception:
                result = {}
        return {
            "id": self.id,
            "_id": str(self.id),
            "email": self.email,
            "crop_hint": self.crop_hint or "",
            "image_path": self.image_path or "",
            "result": result,
            "created_at": str(self.created_at) if self.created_at else ""
        }


class FlashSale(Base):
    __tablename__ = "flash_sales"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    product_id = Column(Integer, nullable=False)
    discount_percentage = Column(Float, default=20.0)
    end_time = Column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "product_id": self.product_id,
            "discount_percentage": self.discount_percentage,
            "end_time": str(self.end_time) if self.end_time else ""
        }


class BhoomiCardConfig(Base):
    __tablename__ = "bhoomi_card_configs"

    id = Column(Integer, primary_key=True, index=True)
    price = Column(Float, default=200.0)
    discount_percentage = Column(Float, default=10.0)
    validity_days = Column(Integer, default=365)
    is_enabled = Column(Boolean, default=True)
    description = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "price": self.price or 200.0,
            "discount_percentage": self.discount_percentage or 10.0,
            "validity_days": self.validity_days or 365,
            "is_enabled": self.is_enabled if self.is_enabled is not None else True,
            "description": self.description or ""
        }


class CustomerBhoomiCard(Base):
    __tablename__ = "customer_bhoomi_cards"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    customer_name = Column(String(100), nullable=True)
    card_number = Column(String(50), unique=True, nullable=False)
    price_paid = Column(Float, default=200.0)
    discount_percentage = Column(Float, default=10.0)
    status = Column(String(20), default="Active")  # Active, Expired, Disabled
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())
    expiry_date = Column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "customer_name": self.customer_name or "",
            "card_number": self.card_number,
            "price_paid": self.price_paid or 200.0,
            "discount_percentage": self.discount_percentage or 10.0,
            "status": self.status or "Active",
            "purchase_date": str(self.purchase_date) if self.purchase_date else "",
            "expiry_date": str(self.expiry_date) if self.expiry_date else ""
        }


class SpinWheelConfig(Base):
    __tablename__ = "spin_wheel_configs"

    id = Column(Integer, primary_key=True, index=True)
    is_enabled = Column(Boolean, default=True)
    allow_stacking_with_bhoomi_card = Column(Boolean, default=False)
    description = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "is_enabled": self.is_enabled if self.is_enabled is not None else True,
            "allow_stacking_with_bhoomi_card": self.allow_stacking_with_bhoomi_card if self.allow_stacking_with_bhoomi_card is not None else False,
            "description": self.description or ""
        }


class SpinWheelReward(Base):
    __tablename__ = "spin_wheel_rewards"

    id = Column(Integer, primary_key=True, index=True)
    reward_index = Column(Integer, nullable=False)
    label = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    reward_type = Column(String(50), nullable=False)  # percentage, flat, shipping, bogo, gift, none
    value = Column(String(50), nullable=False)
    probability = Column(Float, default=0.08)
    color = Column(String(20), default="#2E7D32")
    is_active = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "index": self.reward_index,
            "reward_index": self.reward_index,
            "label": self.label,
            "code": self.code,
            "type": self.reward_type,
            "reward_type": self.reward_type,
            "val": self.value,
            "value": self.value,
            "reward_value": self.value,
            "probability": self.probability,
            "probability_weight": self.probability,
            "weight": self.probability,
            "color": self.color,
            "is_active": self.is_active,
            "status": "Active" if self.is_active else "Inactive"
        }


class SpinWheelLog(Base):
    __tablename__ = "spin_wheel_logs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    reward_code = Column(String(50), nullable=False)
    reward_label = Column(String(100), nullable=False)
    is_test = Column(Boolean, default=False)
    spun_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "reward_code": self.reward_code,
            "reward_label": self.reward_label,
            "is_test": self.is_test,
            "spun_at": str(self.spun_at) if self.spun_at else ""
        }


UserSpinLog = SpinWheelLog


class UserIssuedReward(Base):
    __tablename__ = "user_issued_rewards"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    code = Column(String(50), nullable=False)
    label = Column(String(100), nullable=False)
    reward_type = Column(String(50), nullable=False)
    reward_value = Column(Float, nullable=False, default=0.0)
    is_used = Column(Boolean, default=False)
    expiry_date = Column(String(20), default="")
    created_at = Column(String(30), default="")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "code": self.code,
            "label": self.label,
            "type": self.reward_type,
            "reward_type": self.reward_type,
            "value": self.reward_value,
            "reward_value": self.reward_value,
            "is_used": self.is_used,
            "expiry_date": self.expiry_date or "",
            "created_at": self.created_at or ""
        }
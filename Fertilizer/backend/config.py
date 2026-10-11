import os

class Settings:
    PROJECT_NAME: str = "Bhoomi Bloom Backend API"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-key-bhoomi-bloom-9922883344")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Databases
    DB_TYPE: str = os.getenv("DB_TYPE", "mysql")  # mysql, postgresql, sqlite
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("DB_PORT", 3306))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "Ashwin@2004")
    DB_NAME: str = os.getenv("DB_NAME", "bhoomibloom_db")
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', 'Ashwin%402004')}@{os.getenv('DB_HOST', '127.0.0.1')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'bhoomibloom_db')}"
    )
    SQLITE_URL: str = "sqlite:///./bhoomibloom.db"
    
    # Third-Party APIs
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()

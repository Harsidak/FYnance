import os

class Settings:
    PROJECT_NAME: str = "FYNANCE AI Engine"
    PROJECT_VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_for_dev_only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Paths
    MODEL_PATH: str = "models_data/"
    VECTOR_DB_PATH: str = "chroma_db/"
    
    # External APIs
    GEMINI_API_KEY: str = "AIzaSyC5x3SnUdr62tTlLL40oN9M9RuVeGw9peo" # Updated by user

settings = Settings()

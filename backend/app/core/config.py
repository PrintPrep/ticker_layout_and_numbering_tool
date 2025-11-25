# ============================================================================
# FILE: backend/app/core/config.py
# ============================================================================

"""
Application configuration settings
Load from environment variables with sensible defaults
"""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Ticket Layout Backend"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app"
    ]
    
    # Database (Supabase PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/ticket_layout_db"
    )
    
    # Redis Configuration
    USE_REDIS: bool = os.getenv("USE_REDIS", "true").lower() == "true"
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    REDIS_CACHE_TTL: int = int(os.getenv("REDIS_CACHE_TTL", "3600"))  # 1 hour
    
    # Celery Configuration
    USE_CELERY: bool = os.getenv("USE_CELERY", "true").lower() == "true"
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", REDIS_URL + "/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL + "/1")
    
    # Storage Configuration
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "supabase")  # 'supabase' or 's3' or 'local'
    
    # Supabase Storage
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_BUCKET_NAME: str = os.getenv("SUPABASE_BUCKET_NAME", "ticket-files")
    
    # AWS S3 (optional)
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "ticket-layout-files")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    
    # Local Storage (development)
    LOCAL_STORAGE_PATH: str = os.getenv("LOCAL_STORAGE_PATH", "./storage")
    
    # Next.js API (for webhooks)
    NEXTJS_API_URL: str = os.getenv("NEXTJS_API_URL", "http://localhost:3000")
    WEBHOOK_SECRET: str = os.getenv("WEBHOOK_SECRET", "your-webhook-secret-change-in-production")
    
    # File Processing
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    ALLOWED_FILE_TYPES: List[str] = ["pdf", "png", "jpg", "jpeg", "webp"]
    PDF_DPI: int = int(os.getenv("PDF_DPI", "300"))
    THUMBNAIL_MAX_WIDTH: int = int(os.getenv("THUMBNAIL_MAX_WIDTH", "200"))
    
    # Export Settings
    EXPORT_PRINT_DPI: int = int(os.getenv("EXPORT_PRINT_DPI", "300"))
    EXPORT_DIGITAL_DPI: int = int(os.getenv("EXPORT_DIGITAL_DPI", "150"))
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # Monitoring (optional)
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    
    class Config:
        case_sensitive = True
        env_file = ".env"


# Initialize settings
settings = Settings()


# Validate critical settings on startup
def validate_settings():
    """Validate critical configuration on startup"""
    errors = []
    
    # Check storage provider configuration
    if settings.STORAGE_PROVIDER == "supabase":
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            errors.append("Supabase configuration incomplete (URL or SERVICE_ROLE_KEY missing)")
    
    elif settings.STORAGE_PROVIDER == "s3":
        if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
            errors.append("AWS S3 configuration incomplete (credentials missing)")
    
    # Check Redis if enabled
    if settings.USE_REDIS and not settings.REDIS_URL:
        errors.append("Redis enabled but REDIS_URL not configured")
    
    # Check Celery if enabled
    if settings.USE_CELERY:
        if not settings.CELERY_BROKER_URL or not settings.CELERY_RESULT_BACKEND:
            errors.append("Celery enabled but broker/backend URLs not configured")
    
    if errors:
        raise ValueError(f"Configuration errors:\n" + "\n".join(f"- {e}" for e in errors))
    
    return True


# Run validation
try:
    validate_settings()
except ValueError as e:
    if settings.DEBUG:
        print(f"⚠️  Configuration warning: {e}")
        print("⚠️  Continuing in DEBUG mode with warnings...")
    else:
        raise
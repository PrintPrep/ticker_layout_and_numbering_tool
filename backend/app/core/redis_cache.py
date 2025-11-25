# ============================================================================
# FILE: backend/app/core/redis_cache.py
# ============================================================================

import json
import logging
from typing import Optional, Any
from datetime import datetime, timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheProvider:
    """Abstract cache interface"""
    
    def get(self, key: str) -> Optional[str]:
        raise NotImplementedError
    
    def set(self, key: str, value: str, ttl: int = 3600):
        raise NotImplementedError
    
    def delete(self, key: str):
        raise NotImplementedError
    
    def exists(self, key: str) -> bool:
        raise NotImplementedError


class RedisCache(CacheProvider):
    """Redis cache implementation"""
    
    def __init__(self):
        import redis
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
        logger.info("Redis cache initialized")
    
    def get(self, key: str) -> Optional[str]:
        try:
            return self.redis.get(key)
        except Exception as e:
            logger.error(f"Redis GET failed: {e}")
            return None
    
    def set(self, key: str, value: str, ttl: int = 3600):
        try:
            self.redis.setex(key, ttl, value)
        except Exception as e:
            logger.error(f"Redis SET failed: {e}")
    
    def delete(self, key: str):
        try:
            self.redis.delete(key)
        except Exception as e:
            logger.error(f"Redis DELETE failed: {e}")
    
    def exists(self, key: str) -> bool:
        try:
            return self.redis.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis EXISTS failed: {e}")
            return False


class InMemoryCache(CacheProvider):
    """In-memory cache fallback (development)"""
    
    def __init__(self):
        self._cache: dict = {}
        self._expiry: dict = {}
        logger.warning("Using in-memory cache (not persistent)")
    
    def get(self, key: str) -> Optional[str]:
        # Check if expired
        if key in self._expiry and datetime.now() > self._expiry[key]:
            self.delete(key)
            return None
        
        return self._cache.get(key)
    
    def set(self, key: str, value: str, ttl: int = 3600):
        self._cache[key] = value
        self._expiry[key] = datetime.now() + timedelta(seconds=ttl)
    
    def delete(self, key: str):
        self._cache.pop(key, None)
        self._expiry.pop(key, None)
    
    def exists(self, key: str) -> bool:
        return self.get(key) is not None


# Cache factory
def get_cache_provider() -> CacheProvider:
    """Get configured cache provider"""
    if settings.USE_REDIS:
        try:
            return RedisCache()
        except Exception as e:
            logger.warning(f"Redis unavailable, using in-memory cache: {e}")
            return InMemoryCache()
    else:
        return InMemoryCache()


# Helper functions for common cache operations
cache = get_cache_provider()


def cache_import_data(import_id: str, data: Any, ttl: int = 3600):
    """Cache imported CSV/XLSX data"""
    cache.set(f"import:{import_id}", json.dumps(data), ttl)


def get_import_data(import_id: str) -> Optional[Any]:
    """Retrieve cached import data"""
    data = cache.get(f"import:{import_id}")
    return json.loads(data) if data else None


def cache_job_status(job_id: str, status: dict, ttl: int = 7200):
    """Cache job status"""
    cache.set(f"job:{job_id}", json.dumps(status), ttl)


def get_job_status(job_id: str) -> Optional[dict]:
    """Retrieve cached job status"""
    data = cache.get(f"job:{job_id}")
    return json.loads(data) if data else None
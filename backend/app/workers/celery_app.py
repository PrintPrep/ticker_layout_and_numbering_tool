# ============================================================================
# FILE: backend/app/workers/celery_app.py
# ============================================================================

from celery import Celery
import os

from app.core.config import settings

celery_app = Celery(
    'ticket_layout_worker',
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    task_soft_time_limit=3300,  # 55 minutes soft limit
)

if __name__ == '__main__':
    celery_app.start()
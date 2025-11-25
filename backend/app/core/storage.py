# ============================================================================
# FILE: backend/app/core/storage.py
# ============================================================================

import os
import logging
from typing import Optional
from uuid import uuid4

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageProvider:
    """Abstract storage provider interface"""
    
    async def upload_file(self, file_bytes: bytes, filename: str, folder: str = "") -> str:
        """Upload file and return public URL"""
        raise NotImplementedError
    
    async def delete_file(self, file_url: str) -> bool:
        """Delete file by URL"""
        raise NotImplementedError
    
    async def get_file(self, file_url: str) -> bytes:
        """Download file by URL"""
        raise NotImplementedError


class SupabaseStorage(StorageProvider):
    """Supabase Storage implementation"""
    
    def __init__(self):
        from supabase import create_client  # CHANGED: removed ", Client"
        
        self.client = create_client(  # CHANGED: removed ", Client"
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.bucket_name = settings.SUPABASE_BUCKET_NAME
    
    async def upload_file(self, file_bytes: bytes, filename: str, folder: str = "") -> str:
        """Upload file to Supabase Storage"""
        try:
            # Generate unique filename
            file_id = str(uuid4())
            ext = filename.split('.')[-1] if '.' in filename else 'png'
            storage_path = f"{folder}/{file_id}.{ext}" if folder else f"{file_id}.{ext}"
            
            # Upload
            response = self.client.storage().from_(self.bucket_name).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": f"image/{ext}"}
            )
            
            # Get public URL
            public_url = self.client.storage().from_(self.bucket_name).get_public_url(storage_path)

            logger.info(f"Uploaded to Supabase: {storage_path}")
            return public_url
        
        except Exception as e:
            logger.error(f"Supabase upload failed: {e}")
            raise
    
    async def delete_file(self, file_url: str) -> bool:
        """Delete file from Supabase Storage"""
        try:
            # Extract path from URL
            path = file_url.split(f"{self.bucket_name}/")[-1]
            
            self.client.storage().from_(self.bucket_name).remove([path])
            logger.info(f"Deleted from Supabase: {path}")
            return True
        
        except Exception as e:
            logger.error(f"Supabase delete failed: {e}")
            return False
    
    async def get_file(self, file_url: str) -> bytes:
        """Download file from Supabase Storage"""
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(file_url)
                response.raise_for_status()
                return response.content
        
        except Exception as e:
            logger.error(f"Supabase download failed: {e}")
            raise


class S3Storage(StorageProvider):
    """AWS S3 Storage implementation"""
    
    def __init__(self):
        import boto3
        
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_S3_BUCKET
    
    async def upload_file(self, file_bytes: bytes, filename: str, folder: str = "") -> str:
        """Upload file to S3"""
        try:
            file_id = str(uuid4())
            ext = filename.split('.')[-1] if '.' in filename else 'png'
            storage_path = f"{folder}/{file_id}.{ext}" if folder else f"{file_id}.{ext}"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=storage_path,
                Body=file_bytes,
                ContentType=f"image/{ext}"
            )
            
            # Generate public URL
            public_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{storage_path}"
            
            logger.info(f"Uploaded to S3: {storage_path}")
            return public_url
        
        except Exception as e:
            logger.error(f"S3 upload failed: {e}")
            raise
    
    async def delete_file(self, file_url: str) -> bool:
        """Delete file from S3"""
        try:
            key = file_url.split(f"{self.bucket_name}.s3.")[-1].split('/', 1)[-1]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            
            logger.info(f"Deleted from S3: {key}")
            return True
        
        except Exception as e:
            logger.error(f"S3 delete failed: {e}")
            return False
    
    async def get_file(self, file_url: str) -> bytes:
        """Download file from S3"""
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(file_url)
                response.raise_for_status()
                return response.content
        
        except Exception as e:
            logger.error(f"S3 download failed: {e}")
            raise


class LocalStorage(StorageProvider):
    """Local filesystem storage (development only)"""
    
    def __init__(self):
        self.storage_path = settings.LOCAL_STORAGE_PATH
        os.makedirs(self.storage_path, exist_ok=True)
    
    async def upload_file(self, file_bytes: bytes, filename: str, folder: str = "") -> str:
        """Save file to local filesystem"""
        try:
            file_id = str(uuid4())
            ext = filename.split('.')[-1] if '.' in filename else 'png'
            
            folder_path = os.path.join(self.storage_path, folder) if folder else self.storage_path
            os.makedirs(folder_path, exist_ok=True)
            
            filepath = os.path.join(folder_path, f"{file_id}.{ext}")
            
            with open(filepath, 'wb') as f:
                f.write(file_bytes)
            
            # Return relative URL (will need to be served by Next.js or static server)
            relative_path = filepath.replace(self.storage_path, '').lstrip('/')
            public_url = f"/storage/{relative_path}"
            
            logger.info(f"Saved locally: {filepath}")
            return public_url
        
        except Exception as e:
            logger.error(f"Local storage failed: {e}")
            raise
    
    async def delete_file(self, file_url: str) -> bool:
        """Delete local file"""
        try:
            filepath = file_url.replace('/storage/', self.storage_path + '/')
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"Deleted local file: {filepath}")
                return True
            return False
        
        except Exception as e:
            logger.error(f"Local delete failed: {e}")
            return False
    
    async def get_file(self, file_url: str) -> bytes:
        """Read local file"""
        try:
            filepath = file_url.replace('/storage/', self.storage_path + '/')
            with open(filepath, 'rb') as f:
                return f.read()
        
        except Exception as e:
            logger.error(f"Local read failed: {e}")
            raise


# Storage factory
def get_storage_provider() -> StorageProvider:
    """Get configured storage provider"""
    provider = settings.STORAGE_PROVIDER.lower()
    
    if provider == 'supabase':
        return SupabaseStorage()
    elif provider == 's3':
        return S3Storage()
    elif provider == 'local':
        return LocalStorage()
    else:
        logger.warning(f"Unknown storage provider '{provider}', using local")
        return LocalStorage()

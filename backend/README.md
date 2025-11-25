# ============================================================================
# FILE: backend/README.md
# ============================================================================

# Ticket Layout Backend API

Python FastAPI backend for ticket layout optimization and PDF generation.

## Features

- PDF/Image file processing
- Layout optimization with margins and spacing
- QR code and barcode generation
- CSV/XLSX data import
- Background PDF export jobs
- Multiple storage providers (Supabase, S3, Local)

## Setup

### Local Development

1. Install Python 3.13+
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install system dependencies:
   - **libvips** (for image processing)
   - **poppler** (for PDF rendering)
   
   ```bash
   # macOS
   brew install vips poppler
   
   # Ubuntu/Debian
   sudo apt-get install libvips-dev poppler-utils
   
   # Windows
   # Download pre-built binaries
   ```

5. Copy `.env.example` to `.env` and configure

6. Run development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

7. Optional: Start Redis (if USE_REDIS=true):
   ```bash
   redis-server
   ```

8. Optional: Start Celery worker (if USE_CELERY=true):
   ```bash
   celery -A app.workers.celery_app worker --loglevel=info
   ```

## Deployment

### Railway.app

1. Connect GitHub repository
2. Add Redis addon
3. Set environment variables
4. Deploy automatically

### Render.com

1. Create new Web Service
2. Add Redis addon
3. Create Background Worker (for Celery)
4. Set environment variables
5. Deploy

## API Documentation

Access interactive docs at: `http://localhost:8000/docs`

## Environment Variables

See `.env.example` for all available configuration options.

### Feature Flags

- `USE_REDIS`: Enable Redis cache (default: true)
- `USE_CELERY`: Enable background jobs (default: true)
- `STORAGE_PROVIDER`: Storage backend (supabase, s3, local)
- `DEBUG`: Enable debug mode (default: false)

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── core/
│   │   ├── config.py           # Configuration
│   │   ├── storage.py          # Storage providers
│   │   └── redis_cache.py      # Cache providers
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/      # API routes
│   ├── models/                 # Pydantic models
│   ├── services/               # Business logic
│   ├── utils/                  # Utilities
│   └── workers/                # Celery tasks
├── requirements.txt
├── Procfile                    # Railway/Render config
├── railway.json               # Railway config
└── .env.example
```

## License

MIT

transition from python 3.13 to 3.12.7

```bash
py -3.12 -m venv env
.\env\Scripts\activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
uvicorn app.main:app --reload
```
supabase==1.0.1 #requirements.txt change krnna
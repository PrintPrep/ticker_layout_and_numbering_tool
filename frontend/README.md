# ============================================================================
# FILE: README.md (Frontend)
# ============================================================================

# Ticket Layout & Numbering Tool - Frontend

Next.js 16 frontend for ticket layout optimization and PDF generation.

## Features

- Wizard flow for side selection and file upload
- Numbering editor with drag-and-drop elements
- Real-time layout preview
- CSV/XLSX data import
- QR code and barcode support
- Multi-page PDF export

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and configure:
   ```bash
   cp .env.local.example .env.local
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── tools/
│   │   └── ticket-layout/
│   │       ├── page.tsx            # Main workspace
│   │       ├── wizard/
│   │       │   └── page.tsx        # Upload wizard
│   │       └── numbering-editor/
│   │           └── page.tsx        # Numbering editor
│   └── api/
│       ├── files/
│       ├── numbering/
│       ├── layout/
│       ├── export/
│       └── projects/
├── components/
│   └── tools/
│       └── ticket-layout/
├── lib/
│   ├── ticket-layout/
│   │   ├── zustandStore.ts         # Global state
│   │   ├── optimize.ts             # Layout algorithm
│   │   └── numberingGenerator.ts   # Numbering logic
│   ├── api/
│   │   ├── apiClient.ts            # Python backend client
│   │   └── fileUpload.ts           # File utilities
│   ├── constants/
│   │   ├── paperSizes.ts
│   │   └── marginPresets.ts
│   └── utils/
│       ├── formatters.ts
│       └── exportHelpers.ts
└── .env.local                      # Environment variables
```

## Environment Variables

- `NEXT_PUBLIC_PYTHON_BACKEND_URL` - Python backend URL
- `PYTHON_BACKEND_URL` - Server-side backend URL
- `NEXT_PUBLIC_APP_URL` - App URL (for redirects)

## Development

- State persists in localStorage via Zustand
- Real-time preview uses client-side optimization
- API routes proxy requests to Python backend
- File uploads handled via FormData

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## TODO (When Auth is Ready)

- Uncomment auth middleware in `middleware.ts`
- Enable project saving in API routes
- Add user-specific project loading
- Implement cloud storage integration
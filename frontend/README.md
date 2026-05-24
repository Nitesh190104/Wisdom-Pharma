# Wisdom Pharma — Frontend

React (Vite) frontend for the Wisdom Pharma full-stack platform.

## Requirements

- Node.js 18+ (recommended: latest LTS)
- Backend running on `http://localhost:8000`

## Setup

```bash
cd frontend
npm install
```

Create `frontend/.env` if you want to override the API base URL (optional):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Notes

- Login supports **Consumer**, **Medical Store**, and **Admin** (admin uses normal login with admin credentials).
- Store ordering is blocked until `business.is_verified === true` (the backend enforces this; the UI also disables checkout and cart actions accordingly).

For full project setup (backend + database + seed data), see the root `README.md`.

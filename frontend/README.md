# QuickFile Frontend

This is a minimal React + Vite frontend for the QuickFile project.

Features:
- Login / Register (multipart for avatar)
- File upload (multiple)
- List files

Setup

1. Move into the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start dev server:

```bash
npm run dev
```

The app will be available at http://localhost:5173 (Vite default). It expects the backend API at `http://localhost:8000/api/v1` by default. To change the backend URL, set environment variable `REACT_APP_API_URL` before starting.

Notes
- This is a minimal starter. You should secure cookies and CORS settings when deploying.
- The components expect the backend to return responses using the project's `apiResponse` format (data in `data` property). Adjust `api.js` if your backend differs.

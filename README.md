# 📁 QuickFile (Monorepo)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

QuickFile is a simple file-sharing app. Backend uses Express + MongoDB with Supabase Storage; Frontend is React (Vite + TypeScript). Auth uses httpOnly cookies; downloads stream as attachments. CORS is minimal and configured via env.

---

## 🌟 Features
- Upload to Supabase Storage
- Streaming downloads (Content-Disposition: attachment)
- Cookie-based auth (1 day access token, 10 days refresh)
- Per-user storage quota (100 MB)
- Profile dashboard with usage stats

---

## 🧭 Structure
- `backend/` – Express API, Supabase storage, MongoDB
- `frontend/` – React + Vite UI

---

## ⚙️ Quick Start (Development)

1) Backend
```bash
cd backend
npm install
cp .env.example .env # or create .env
npm run start
```

2) Frontend
```bash
cd frontend
npm install
cp .env.example .env # or create .env
npm run dev
```

---

## 🔐 Backend Environment (.env)
Required keys (example):
```
PORT=8000
DB_URI=...
CORS_ORIGIN=http://127.0.0.1:8080

ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_BUCKET=quickfile
```
Notes:
- CORS is driven only by `CORS_ORIGIN`. Use `*` (dev only) or a CSV list of origins.
- API is served under `/api` (e.g. `/api/users/login`).

---

## 🌐 Frontend Environment (.env)
```
VITE_API_URL=http://127.0.0.1:8000/api
```
If not set, the app falls back to `window.location.origin + /api`. On HTTPS, it avoids insecure HTTP calls (prevents mixed content).

---

## 🧩 API Endpoints (prefix `/api`)
Auth:
- `POST /users/register`
- `POST /users/login`
- `POST /users/logout`
- `POST /users/refresh`

Files:
- `POST /files/upload` (multipart: `file`)
- `GET  /files/allfile`
- `GET  /files/direct-download/:FileId`
- `PATCH /files/:FileId` (metadata)
- `DELETE /files/:FileId`

Stats:
- `GET /stats`

Health:
- `GET /ping`

---

## � Deploy Notes
- Backend: set `CORS_ORIGIN` to your frontend domain (e.g. `https://quick-file.vercel.app`).
- Frontend: set `VITE_API_URL` to your backend base (e.g. `https://api.example.com/api`) unless you proxy `/api` on the same host.

---

## 👨‍💻 Author
**Sourav Kumar Sahu**  
📧 [lcs.souravkrsahu@gmail.com](mailto:lcs.souravkrsahu@gmail.com)  
🌐 [GitHub: printf-sourav](https://github.com/printf-sourav)

---

⭐ If you like this project, star it on GitHub!

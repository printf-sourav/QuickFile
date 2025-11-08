# QuickFile Backend (Updated)

Express + MongoDB + Supabase Storage API.

## Features
- Upload (Multer temp -> Supabase)
- Streaming download (attachment headers)
- Cookie auth: access 1d, refresh 10d
- 100 MB per-user quota
- Stats endpoint (usage + most downloaded)
- Expired file cleanup service

## Environment (.env)
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

## Install & Run
```
cd backend
npm install
npm run start
```

## Endpoints (prefix /api)
Auth:
- POST /api/users/register
- POST /api/users/login
- POST /api/users/logout
- POST /api/users/refresh

Files:
- POST /api/files/upload (form field: file)
- GET  /api/files/allfile
- GET  /api/files/direct-download/:FileId
- PATCH /api/files/:FileId
- DELETE /api/files/:FileId

Stats:
- GET /api/stats

Health:
- GET /ping

## Response Shapes
Success:
```
{ "success": true, "data": { ... } }
```
Error:
```
{ "success": false, "message": "Reason" }
```

## Quota Logic
Sum existing user file sizes. Reject new upload if total would exceed 100 MB.

## Upload Flow
1. Multer writes temp file
2. Supabase upload
3. Temp file deleted
4. Metadata persisted (Mongo)

## CORS
Configured via CORS_ORIGIN ("*" for dev or CSV list).

## Security Notes
- Keep service role key server-side only
- Use HTTPS in production
- Rotate secrets regularly

## License
MIT

# QuickFile Backend

Express + MongoDB + Supabase storage API for the QuickFile app.

## Features
- File upload (Multer temp -> Supabase Storage)
- Streaming download with attachment headers
- Auth (cookies: access token 1d, refresh token 10d)
- Per-user storage quota (100 MB)
- Stats endpoint (usage + most downloaded)
- Expired file cleanup service

## Requirements
- Node 18+
- MongoDB URI
- Supabase project & bucket (created manually)

## Install
```bash
cd backend
npm install
```

## Environment (.env)
```env
PORT=8000
DB_URI=...
CORS_ORIGIN=http://127.0.0.1:8080

ACCESS_TOKEN_SECRET=change_me
REFRESH_TOKEN_SECRET=change_me_too
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_BUCKET=quickfile
```
Never commit real secrets.

## Run
```bash
npm run start
```
Server listens on `PORT`.

## CORS
`CORS_ORIGIN='*'` (dev only) or CSV list of origins.

## Endpoint Prefix
All endpoints are under `/api`.

### Auth
- POST `/api/users/register`
- POST `/api/users/login`
- POST `/api/users/logout`
- POST `/api/users/refresh`

### Files
- POST `/api/files/upload` (form field: file)
- GET  `/api/files/allfile`
- GET  `/api/files/direct-download/:FileId`
- PATCH `/api/files/:FileId` (fetch single metadata)
- DELETE `/api/files/:FileId`

### Stats
- GET `/api/stats`

### Health
- GET `/ping`

## Success Response Shape
```json
{ "success": true, "data": { /* payload */ } }
```
## Error Response Shape
```json
{ "success": false, "message": "Reason" }
```

## Upload Flow
1. Multer receives file (temp dir)
2. Supabase helper uploads bytes
3. Temp file removed
4. Mongo stores metadata (size, path, owner)

## Quota Enforcement
Before upload: sum sizes of user's files. Reject if new total > 100 MB.

## Cleanup
Background service deletes expired entries (Supabase object + Mongo doc).

## Auth Model
- httpOnly cookies carry tokens
- Access: 1 day; Refresh: 10 days
- Refresh endpoint issues new access token

## Security Tips
- Rotate secrets regularly
- Use HTTPS in production
- Restrict service role key usage (backend only)

## License
MIT

# 🚀 QuickFile

QuickFile is a simple and efficient file-sharing web application that allows users to **upload, manage, and share files securely** with automatic expiration and cloud storage support.

---

## 🧩 Features

- 📁 Upload and share files easily (up to 100MB)
- 🔐 Secure file access using JWT authentication (access & refresh tokens)
- ☁️ Cloud storage integration (Cloudinary)  
- ⏰ Auto-delete expired files after 2 days using cron jobs  
- 🔗 Generate shareable download links with expiration
- 📊 Track download statistics for uploaded files
- 🧾 RESTful API built with Express.js and MongoDB  
- ⚙️ Async error handling and clean architecture
- 📱 Responsive frontend with React and Bootstrap 5  

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Bootstrap 5, Axios
- **Backend:** Node.js, Express.js, Multer (file uploads)
- **Database:** MongoDB (Mongoose)  
- **Cloud Storage:** Cloudinary (with signed URLs for secure access)
- **Authentication:** JWT (httpOnly cookies with access & refresh tokens)
- **Scheduler:** Node-Cron (automatic file cleanup)
- **Deployment:** Frontend on Vercel, Backend on Render  

---

## 📦 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/printf-sourav/QuickFile.git
   cd QuickFile/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173
   
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   SHARE_LINK_TOKEN=your_share_link_token_secret
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the backend**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add environment variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

---

## 🧪 Scripts

### Backend Scripts
| Command | Description |
|----------|-------------|
| `npm start` | Run the production server |
| `npm run dev` | Start development server with nodemon |

### Frontend Scripts
| Command | Description |
|----------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 📁 Folder Structure

```
QuickFile/
│
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/        # Auth, error, multer middleware
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Background services (cleanup)
│   │   ├── utils/             # Helper functions (cloudinary, error handling)
│   │   ├── db/                # Database connection
│   │   ├── app.js             # Express app configuration
│   │   ├── server.js          # Server entry point
│   │   └── swagger.js         # API documentation
│   ├── public/temp/           # Temporary file uploads
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── api.js             # Axios configuration
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # React entry point
│   │   └── styles.css         # Global styles
│   ├── index.html
│   ├── vercel.json            # Vercel configuration
│   └── package.json
│
└── README.md
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `POST /api/v1/users/refresh-token` - Refresh access token

### File Operations (Protected)
- `POST /api/v1/files/upload` - Upload files (requires auth)
- `GET /api/v1/files/allfile` - Get all user files (requires auth)
- `GET /api/v1/files/direct-download/:FileId` - Download file by ID (requires auth)
- `POST /api/v1/files/:id/share` - Generate shareable link (requires auth)
- `DELETE /api/v1/files/:FileId` - Delete file (requires auth)

### Public Endpoints
- `GET /api/v1/files/download/:token` - Download via share link (public)

### Statistics
- `GET /api/v1/stats/file/:fileId` - Get file statistics (requires auth)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to fork this repo and submit a pull request.

---

## 🧑‍💻 Author

**Sourav Kr Sahu**  
🌐 [GitHub](https://github.com/printf-sourav)  
✉️ lcs.souravkrsahu@gmail.com 

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use and modify it.

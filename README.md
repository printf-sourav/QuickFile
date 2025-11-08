# 📁 QuickFile  
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

> 🚀 A lightweight and secure file-sharing backend built with **Node.js**, **Express**, and **Supabase Storage**.

---

## 🌟 Overview  
**QuickFile** allows users to easily upload, share, and download files using fast, cloud-based storage.  
It’s designed to be simple, scalable, and developer-friendly — perfect for personal projects or small teams.

---

## ✨ Features

- 📤 Upload files quickly and securely  
- ⏰ Support for temporary or expiring files  
- 🗑️ Automatic file cleanup using cron jobs  
- ☁️ Supabase-based storage (free & reliable)  
- 🔒 Secure environment variable configuration  

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| Backend | Node.js, Express |
| Storage | Supabase Storage |
| Utility | express-fileupload, asyncHandler, dotenv |
| Language | JavaScript (ES Modules) |

---

## ⚙️ Installation & Setup

1. **Clone this repository**
   ```bash
   git clone https://github.com/printf-sourav/quickfile.git
   cd quickfile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file**
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5000
   ```

4. **Run the server**
   ```bash
   npm start
   ```
   The server will run on 👉 [http://localhost:5000](http://localhost:5000)

---

## 🧩 API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/upload` | Upload a file |
| `GET` | `/download/:filename` | Download file by name |
| `DELETE` | `/delete/:filename` | Delete a file |
| `GET` | `/health` | Check API status |

---

## 🗂️ Project Structure
```
QuickFile/
├── controllers/
│   └── file.controller.js
├── routes/
│   └── file.routes.js
├── utils/
│   ├── asyncHandler.js
│   └── supabase.js
├── .env
├── server.js
└── package.json
```

---

## 🌍 Deployment (Render / Vercel / Railway)

### 🟣 Deploy on Render
1. Push your project to GitHub  
2. Go to [Render](https://render.com) → “New Web Service”  
3. Connect your repo  
4. Set build command → `npm install`  
5. Set start command → `npm start`  
6. Add environment variables (from `.env`)  
7. Deploy 🎉  

### 🟢 Deploy on Railway
1. Go to [Railway.app](https://railway.app)  
2. Create a new project → Connect to your GitHub  
3. Add environment variables  
4. Deploy 🚀  

---

## 💡 Future Plans

- 🔐 Add Supabase Auth or JWT user login  
- 📊 Dashboard for upload history & analytics  
- ⏳ Auto file expiration system  
- 🌈 Frontend UI (Bootstrap 5 + Poppins)  

---

## 👨‍💻 Author

**Sourav Kumar Sahu**  
📧 [lcs.souravkrsahu@gmail.com](mailto:lcs.souravkrsahu@gmail.com)  
🌐 [GitHub: printf-sourav](https://github.com/printf-sourav)

---

⭐ **If you like this project, don’t forget to star it on GitHub!** ⭐  
> “Simple, fast, and free — that’s QuickFile.”

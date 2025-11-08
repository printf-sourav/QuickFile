# QuickFile Frontend

A modern, responsive file-sharing web application built with React, Vite, Tailwind CSS, and TypeScript.

## 🚀 Features

- **Modern UI/UX**: Clean, minimal design with Poppins font
- **Dark/Light Mode**: Fully implemented theme toggle
- **Drag & Drop Upload**: Intuitive file upload with progress tracking
- **Auto-Expiry**: Files automatically delete after set time (1h, 6h, 24h, 3d, 7d)
- **File Management**: View, copy link, and delete uploaded files
- **JWT Authentication**: Secure login/signup with token-based auth
- **Real-time Notifications**: Toast notifications using react-hot-toast
- **Smooth Animations**: Framer Motion animations throughout
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA labels and semantic HTML

## 📁 Project Structure

```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── CustomButton.tsx
│   │   ├── CustomCard.tsx
│   │   ├── CustomInput.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Modal.tsx
│   ├── files/               # File-related components
│   │   ├── FileCard.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ExpiryTimer.tsx
│   │   └── ProgressBar.tsx
│   ├── layout/              # Layout components
│   │   └── Navbar.tsx
│   └── ui/                  # Shadcn UI components
├── contexts/                # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   └── ThemeContext.tsx     # Theme state
├── lib/                     # Utilities
│   ├── axios.ts             # Axios instance with interceptors
│   └── utils.ts             # Helper functions
├── pages/                   # Route pages
│   ├── Index.tsx            # Landing/Hero page
│   ├── Upload.tsx           # File upload page
│   ├── Files.tsx            # Dashboard - My Files
│   ├── Login.tsx            # Login page
│   ├── Signup.tsx           # Signup page
│   └── NotFound.tsx         # 404 page
└── App.tsx                  # Main app with routing
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (Node + Express + MongoDB + Cloudinary)

## 🚦 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd quickfile-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Replace `http://localhost:5000/api` with your backend API URL.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔌 Connecting to Backend

### Backend API Endpoints Expected

Your Node + Express + MongoDB + Cloudinary backend should provide these endpoints:

#### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  Request: { "name": "string", "email": "string", "password": "string" }
  Response: { "token": "string", "user": { "id": "string", "name": "string", "email": "string" } }
  ```

- `POST /api/auth/login` - Login user
  ```json
  Request: { "email": "string", "password": "string" }
  Response: { "token": "string", "user": { "id": "string", "name": "string", "email": "string" } }
  ```

#### Files
- `POST /api/files/upload` - Upload file (multipart/form-data)
  ```
  Form Data:
    - file: File
    - expiryHours: number
  Response: {
    "file": {
      "id": "string",
      "filename": "string",
      "originalName": "string",
      "size": number,
      "url": "string",
      "expiresAt": "string (ISO date)"
    }
  }
  ```

- `GET /api/files` - Get user's files (requires auth token)
  ```json
  Response: {
    "files": [
      {
        "id": "string",
        "filename": "string",
        "originalName": "string",
        "size": number,
        "url": "string",
        "expiresAt": "string (ISO date)"
      }
    ]
  }
  ```

- `DELETE /api/files/:id` - Delete file (requires auth token)
  ```json
  Response: { "message": "File deleted successfully" }
  ```

### Authentication Flow

1. **JWT Token Storage**: Tokens are stored in `localStorage` as `token` and `user`
2. **Axios Interceptor**: Automatically adds `Authorization: Bearer <token>` to all requests
3. **Auto Logout**: If API returns 401, user is automatically logged out and redirected to login

### CORS Configuration

Make sure your backend has CORS enabled for the frontend URL:

```javascript
// Express backend example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080', // Your frontend URL
  credentials: true
}));
```

### File Upload with Cloudinary

The frontend sends files as `multipart/form-data`. Your backend should:
1. Receive the file using middleware like `multer`
2. Upload to Cloudinary
3. Store file metadata in MongoDB with expiry time
4. Return the Cloudinary URL and file details

## 🎨 Design System

### Colors (Tailwind CSS Variables)

- **Primary**: Blue (`#3B82F6`) - Main brand color
- **Secondary**: Light gray - Secondary surfaces
- **Success**: Green - Successful uploads
- **Warning**: Orange - Expiring files
- **Destructive**: Red - Delete actions

### Typography

- **Font**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components

All components use semantic tokens from the design system defined in:
- `src/index.css` - CSS variables for light/dark mode
- `tailwind.config.ts` - Tailwind configuration

## 🔐 Security Features

- JWT token-based authentication
- Auto token refresh on API calls
- Secure password requirements (min 6 characters)
- Protected routes (redirect to login if not authenticated)
- Logout on 401 responses

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1400px`
- Touch-friendly UI elements
- Optimized for all screen sizes

## 🚀 Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

To preview the production build:

```bash
npm run preview
```

## 📦 Deployment

### Frontend Deployment

Deploy the `dist` folder to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables for Production

Update `VITE_API_BASE_URL` to your production backend URL:

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

## 🧪 Development Tips

1. **Hot Module Replacement**: Vite provides instant feedback on code changes
2. **TypeScript**: Use type definitions for better IDE support
3. **Component Reusability**: Use the custom components in `src/components/common/`
4. **Design Tokens**: Always use semantic tokens from the design system
5. **Error Handling**: Errors are automatically shown via toast notifications

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 🆘 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ using Lovable

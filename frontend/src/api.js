import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Check if error is 401 (Unauthorized) - token expired or invalid
    if (error.response && error.response.status === 401) {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Return the error for other status codes
    return Promise.reject(error);
  }
);

export default api;

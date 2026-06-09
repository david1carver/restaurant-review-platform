import axios from 'axios';

// Single axios instance for the whole app.
// baseURL points at the backend API. Keep localhost for local dev; before
// deploying to EC2, comment it and uncomment the "live" line with your
// instance's Public IPv4 (SOP Step 47).
// The request interceptor attaches the JWT from localStorage to every request.

const STORAGE_KEY = 'mesa.auth';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local development
  // baseURL: 'http://YOUR_EC2_PUBLIC_IP:5001', // live (EC2) — set your public IP, then push to main
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { token } = JSON.parse(raw);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // Ignore — request goes unauthenticated and the backend will 401 if it needs auth.
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
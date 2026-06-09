import axios from 'axios';

// Single axios instance for the whole app.
// baseURL is empty, so requests are same-origin: the app calls /api/... on
// whatever host serves it, and nginx on the server proxies /api/ to the
// backend on port 5001. No port or IP is hard-coded, so it keeps working
// even if the EC2 public IP changes.
// The request interceptor attaches the JWT from localStorage to every request.

const STORAGE_KEY = 'mesa.auth';

const axiosInstance = axios.create({
  baseURL: '', // same-origin: nginx proxies /api/ to the backend
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
      // Ignore: request goes unauthenticated and the backend will 401 if it needs auth.
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

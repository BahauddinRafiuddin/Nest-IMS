import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // important for future cookies / refresh token
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ Request interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      }

      if (status === 403) {
        console.error("Access denied");
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || "http://localhost:4000";

export const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem("dongne-auth");
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch {
      // ignore malformed storage
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dongne-auth");
    }
    return Promise.reject(error);
  },
);

export function resolveImage(url) {
  if (!url) return "";
  return url.startsWith("/uploads") ? `${UPLOADS_URL}${url}` : url;
}

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || error?.message || fallback;
}

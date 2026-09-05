import { apiClient } from "./client.js";

export const authApi = {
  register: (payload) => apiClient.post("/auth/register", payload).then((r) => r.data.data),
  login: (payload) => apiClient.post("/auth/login", payload).then((r) => r.data.data),
  me: () => apiClient.get("/auth/me").then((r) => r.data.data),
};

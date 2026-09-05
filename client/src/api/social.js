import { apiClient } from "./client.js";

export const usersApi = {
  getProfile: (username) => apiClient.get(`/users/${username}`).then((r) => r.data.data),
  updateMe: (payload) => apiClient.patch("/users/me", payload).then((r) => r.data.data),
  uploadAvatar: (formData) =>
    apiClient.post("/users/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data.data),
  uploadCover: (formData) =>
    apiClient.post("/users/me/cover", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data.data),
  listSavedPlaces: () => apiClient.get("/users/me/saved-places").then((r) => r.data.data),
  toggleSavePlace: (placeId) => apiClient.post(`/users/me/saved-places/${placeId}`).then((r) => r.data.data),
  getUserPosts: (username) => apiClient.get(`/users/${username}/posts`).then((r) => r.data.data),
  getUserCollections: (username) => apiClient.get(`/users/${username}/collections`).then((r) => r.data.data),
  followUser: (username) => apiClient.post(`/users/${username}/follow`).then((r) => r.data.data),
  unfollowUser: (username) => apiClient.delete(`/users/${username}/follow`).then((r) => r.data.data),
  listFollowers: (username) => apiClient.get(`/users/${username}/followers`).then((r) => r.data.data),
  listFollowing: (username) => apiClient.get(`/users/${username}/following`).then((r) => r.data.data),
};

export const postsApi = {
  listFeed: (params) => apiClient.get("/posts", { params }).then((r) => r.data),
  create: (payload) => apiClient.post("/posts", payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/posts/${id}`),
  listComments: (id) => apiClient.get(`/posts/${id}/comments`).then((r) => r.data.data),
  createComment: (id, text) => apiClient.post(`/posts/${id}/comments`, { text }).then((r) => r.data.data),
};

export const likesApi = {
  toggle: (targetType, targetId) => apiClient.post(`/likes/${targetType}/${targetId}`).then((r) => r.data.data),
};

export const collectionsApi = {
  listMine: () => apiClient.get("/collections").then((r) => r.data.data),
  get: (id) => apiClient.get(`/collections/${id}`).then((r) => r.data.data),
  create: (payload) => apiClient.post("/collections", payload).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/collections/${id}`, payload).then((r) => r.data.data),
  remove: (id) => apiClient.delete(`/collections/${id}`),
  addItem: (id, payload) => apiClient.post(`/collections/${id}/items`, payload).then((r) => r.data.data),
  removeItem: (id, itemId) => apiClient.delete(`/collections/${id}/items/${itemId}`).then((r) => r.data.data),
};

export const notificationsApi = {
  list: (params) => apiClient.get("/notifications", { params }).then((r) => r.data),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch("/notifications/read-all"),
};

export const languageApi = {
  listLessons: (params) => apiClient.get("/language/lessons", { params }).then((r) => r.data.data),
  getLesson: (slug) => apiClient.get(`/language/lessons/${slug}`).then((r) => r.data.data),
  submitQuiz: (slug, answers) => apiClient.post(`/language/lessons/${slug}/quiz`, { answers }).then((r) => r.data.data),
  getProgress: () => apiClient.get("/language/progress").then((r) => r.data.data),
};

export const achievementsApi = {
  list: () => apiClient.get("/achievements").then((r) => r.data.data),
};

export const activityApi = {
  getMine: () => apiClient.get("/activity/me").then((r) => r.data.data),
};

export const reportsApi = {
  create: (payload) => apiClient.post("/reports", payload).then((r) => r.data.data),
};

export const uploadApi = {
  image: (formData) => apiClient.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data.data),
};

export const adminApi = {
  getStats: () => apiClient.get("/admin/stats").then((r) => r.data.data),
  listUsers: (params) => apiClient.get("/admin/users", { params }).then((r) => r.data),
  updateUserRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.data),
  setUserSuspended: (id, isSuspended) => apiClient.patch(`/admin/users/${id}/suspend`, { isSuspended }).then((r) => r.data.data),
  listReports: (params) => apiClient.get("/admin/reports", { params }).then((r) => r.data.data),
  updateReportStatus: (id, status) => apiClient.patch(`/admin/reports/${id}`, { status }).then((r) => r.data.data),
};

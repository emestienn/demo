import { apiClient } from "./client.js";

const list = (path) => (params) => apiClient.get(path, { params }).then((r) => r.data);
const detail = (path) => (slugOrId, params) => apiClient.get(`${path}/${slugOrId}`, { params }).then((r) => r.data.data);

export function adminCrud(path) {
  return {
    create: (payload) => apiClient.post(path, payload).then((r) => r.data.data),
    update: (id, payload) => apiClient.patch(`${path}/${id}`, payload).then((r) => r.data.data),
    remove: (id) => apiClient.delete(`${path}/${id}`),
  };
}

export const citiesApi = {
  list: list("/cities"),
  get: detail("/cities"),
};

export const neighborhoodsApi = {
  list: list("/neighborhoods"),
  get: detail("/neighborhoods"),
};

export const placesApi = {
  list: list("/places"),
  get: detail("/places"),
  create: (payload) => apiClient.post("/places", payload).then((r) => r.data.data),
  createReview: (placeId, payload) => apiClient.post(`/places/${placeId}/reviews`, payload).then((r) => r.data),
};

export const foodApi = {
  list: list("/food"),
  get: detail("/food"),
};

export const cultureApi = {
  list: list("/culture"),
  get: detail("/culture"),
};

export const eventsApi = {
  list: list("/events"),
  get: detail("/events"),
  listSaved: () => apiClient.get("/events/saved/me").then((r) => r.data.data),
  toggleSave: (id) => apiClient.post(`/events/${id}/save`).then((r) => r.data.data),
};

export const searchApi = {
  search: (q, type) => apiClient.get("/search", { params: { q, type } }).then((r) => r.data.data),
};

export const recommendationsApi = {
  discover: (params) => apiClient.get("/recommendations/discover", { params }).then((r) => r.data.data),
};

export const aiApi = {
  itinerary: (prompt) => apiClient.post("/ai/itinerary", { prompt }).then((r) => r.data.data),
};

import api from "./api";

export async function fetchCategories() {
  const { data } = await api.get("/categories/");
  return data.results ?? data;
}

export async function fetchMenuItems(params = {}) {
  const { data } = await api.get("/menu/", { params });
  return data.results ?? data;
}

export async function fetchMenuItem(id) {
  const { data } = await api.get(`/menu/${id}/`);
  return data;
}

export async function createMenuItem(payload) {
  const { data } = await api.post("/menu/", payload);
  return data;
}

export async function updateMenuItem(id, payload) {
  const { data } = await api.put(`/menu/${id}/`, payload);
  return data;
}

export async function deleteMenuItem(id) {
  await api.delete(`/menu/${id}/`);
}

export async function createCategory(payload) {
  const { data } = await api.post("/categories/", payload);
  return data;
}
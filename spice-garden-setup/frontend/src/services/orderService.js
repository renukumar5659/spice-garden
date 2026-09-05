import api from "./api";

export async function placeOrder(payload) {
  const { data } = await api.post("/orders/", payload);
  return data;
}

export async function fetchOrders() {
  const { data } = await api.get("/orders/");
  return data.results ?? data;
}

export async function fetchOrder(id) {
  const { data } = await api.get(`/orders/${id}/`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status/`, { status });
  return data;
}

export async function fetchDashboardStats() {
  const { data } = await api.get("/orders/stats/");
  return data;
}

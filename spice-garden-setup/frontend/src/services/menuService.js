import api from "./api";

export async function fetchCategories() {
  const { data } = await api.get("/categories/");
  return data.results ?? data;
}

export async function fetchMenuItems(params = {}) {
  let page = 1;
  let allItems = [];

  while (true) {
    const { data } = await api.get("/menu/", {
      params: {
        ...params,
        page,
      },
    });

    // If API returns a normal array instead of paginated data
    if (Array.isArray(data)) {
      return [...allItems, ...data];
    }

    // Add current page items
    const items = data.results ?? [];
    allItems = [...allItems, ...items];

    // Stop when there are no more pages
    if (!data.next) {
      break;
    }

    page += 1;
  }

  return allItems;
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
  const { data } = await api.patch(`/menu/${id}/`, payload);
  return data;
}

export async function deleteMenuItem(id) {
  await api.delete(`/menu/${id}/`);
}

export async function createCategory(payload) {
  const { data } = await api.post("/categories/", payload);
  return data;
}
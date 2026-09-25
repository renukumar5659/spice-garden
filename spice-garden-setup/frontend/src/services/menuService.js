import api from "./api";

// ============================================================
// FETCH CATEGORIES
// GET /api/categories/
// ============================================================

export async function fetchCategories(params = {}) {
  const response = await api.get(
    "/categories/",
    {
      params,
    }
  );

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.categories)) {
    return data.categories;
  }

  console.warn(
    "Unexpected categories API response:",
    data
  );

  return [];
}

// ============================================================
// FETCH MENU ITEMS
// GET /api/menu/
// ============================================================

export async function fetchMenuItems(
  params = {}
) {
  const response = await api.get(
    "/menu/",
    {
      params,
    }
  );

  const data = response.data;

  // Normal array
  if (Array.isArray(data)) {
    return data;
  }

  // DRF pagination
  if (Array.isArray(data?.results)) {
    return data.results;
  }

  // Custom response
  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.menu_items)) {
    return data.menu_items;
  }

  console.warn(
    "Unexpected menu API response:",
    data
  );

  return [];
}

// ============================================================
// FETCH SINGLE MENU ITEM
// GET /api/menu/<id>/
// ============================================================

export async function fetchMenuItem(id) {
  if (!id) {
    throw new Error(
      "Menu item ID is required."
    );
  }

  const { data } = await api.get(
    `/menu/${id}/`
  );

  return data;
}

// ============================================================
// CREATE MENU ITEM
// POST /api/menu/
// ============================================================

export async function createMenuItem(
  payload
) {
  const { data } = await api.post(
    "/menu/",
    payload
  );

  return data;
}

// ============================================================
// UPDATE MENU ITEM
// PATCH /api/menu/<id>/
// ============================================================

export async function updateMenuItem(
  id,
  payload
) {
  if (!id) {
    throw new Error(
      "Menu item ID is required."
    );
  }

  const { data } = await api.patch(
    `/menu/${id}/`,
    payload
  );

  return data;
}

// ============================================================
// DELETE MENU ITEM
// DELETE /api/menu/<id>/
// ============================================================

export async function deleteMenuItem(
  id
) {
  if (!id) {
    throw new Error(
      "Menu item ID is required."
    );
  }

  await api.delete(
    `/menu/${id}/`
  );

  return true;
}

// ============================================================
// CREATE CATEGORY
// POST /api/categories/
// ============================================================

export async function createCategory(
  payload
) {
  const { data } = await api.post(
    "/categories/",
    payload
  );

  return data;
}

// ============================================================
// UPDATE CATEGORY
// PATCH /api/categories/<id>/
// ============================================================

export async function updateCategory(
  id,
  payload
) {
  if (!id) {
    throw new Error(
      "Category ID is required."
    );
  }

  const { data } = await api.patch(
    `/categories/${id}/`,
    payload
  );

  return data;
}

// ============================================================
// DELETE CATEGORY
// DELETE /api/categories/<id>/
// ============================================================

export async function deleteCategory(
  id
) {
  if (!id) {
    throw new Error(
      "Category ID is required."
    );
  }

  await api.delete(
    `/categories/${id}/`
  );

  return true;
}
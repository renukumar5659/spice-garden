import api from "./api";

// ============================================================
// FETCH CATEGORIES
// Backend URL: /api/categories/
// ============================================================

export async function fetchCategories(params = {}) {
  const { data } = await api.get(
    "/categories/",
    {
      params,
    }
  );

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
// FETCH ALL MENU ITEMS
// Backend URL: /api/menu/
// ============================================================

export async function fetchMenuItems(params = {}) {
  let page = 1;
  let allItems = [];

  while (true) {
    const { data } = await api.get(
      "/menu/",
      {
        params: {
          ...params,
          page,
        },
      }
    );

    // Normal array
    if (Array.isArray(data)) {
      allItems = [
        ...allItems,
        ...data,
      ];

      break;
    }

    // DRF pagination
    if (Array.isArray(data?.results)) {
      allItems = [
        ...allItems,
        ...data.results,
      ];

      if (!data.next) {
        break;
      }

      page += 1;
      continue;
    }

    // Custom response
    if (Array.isArray(data?.items)) {
      allItems = [
        ...allItems,
        ...data.items,
      ];

      break;
    }

    if (Array.isArray(data?.menu_items)) {
      allItems = [
        ...allItems,
        ...data.menu_items,
      ];

      break;
    }

    console.warn(
      "Unexpected menu API response:",
      data
    );

    break;
  }

  return allItems;
}


// ============================================================
// FETCH SINGLE MENU ITEM
// Backend URL: /api/menu/<id>/
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
// Backend URL: /api/menu/
// ============================================================

export async function createMenuItem(payload) {
  const { data } = await api.post(
    "/menu/",
    payload
  );

  return data;
}


// ============================================================
// UPDATE MENU ITEM
// Backend URL: /api/menu/<id>/
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
// Backend URL: /api/menu/<id>/
// ============================================================

export async function deleteMenuItem(id) {
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
// Backend URL: /api/categories/
// ============================================================

export async function createCategory(payload) {
  const { data } = await api.post(
    "/categories/",
    payload
  );

  return data;
}


// ============================================================
// UPDATE CATEGORY
// Backend URL: /api/categories/<id>/
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
    `/categories/${id}/`
  , payload);

  return data;
}


// ============================================================
// DELETE CATEGORY
// Backend URL: /api/categories/<id>/
// ============================================================

export async function deleteCategory(id) {
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
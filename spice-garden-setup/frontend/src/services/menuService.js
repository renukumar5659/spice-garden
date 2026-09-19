import api from "./api";

// ============================================================
// FETCH CATEGORIES
// Backend URL:
// /api/menu/categories/
// ============================================================

export async function fetchCategories(params = {}) {
  const { data } = await api.get(
    "/menu/categories/",
    {
      params,
    }
  );

  // Normal array
  if (Array.isArray(data)) {
    return data;
  }

  // DRF pagination
  if (Array.isArray(data?.results)) {
    return data.results;
  }

  // Custom response
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
// Backend URL:
// /api/menu/menu/
// ============================================================

export async function fetchMenuItems(params = {}) {
  let page = 1;
  let allItems = [];

  while (true) {
    const { data } = await api.get(
      "/menu/menu/",
      {
        params: {
          ...params,
          page,
        },
      }
    );

    // --------------------------------------------------------
    // Normal array
    // --------------------------------------------------------

    if (Array.isArray(data)) {
      allItems = [
        ...allItems,
        ...data,
      ];

      break;
    }

    // --------------------------------------------------------
    // DRF paginated response
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Custom response
    // --------------------------------------------------------

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
// /api/menu/menu/<id>/
// ============================================================

export async function fetchMenuItem(id) {
  if (!id) {
    throw new Error(
      "Menu item ID is required."
    );
  }

  const { data } = await api.get(
    `/menu/menu/${id}/`
  );

  return data;
}


// ============================================================
// CREATE MENU ITEM
// /api/menu/menu/
// ============================================================

export async function createMenuItem(payload) {
  const { data } = await api.post(
    "/menu/menu/",
    payload
  );

  return data;
}


// ============================================================
// UPDATE MENU ITEM
// /api/menu/menu/<id>/
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
    `/menu/menu/${id}/`,
    payload
  );

  return data;
}


// ============================================================
// DELETE MENU ITEM
// /api/menu/menu/<id>/
// ============================================================

export async function deleteMenuItem(id) {
  if (!id) {
    throw new Error(
      "Menu item ID is required."
    );
  }

  await api.delete(
    `/menu/menu/${id}/`
  );

  return true;
}


// ============================================================
// CREATE CATEGORY
// /api/menu/categories/
// ============================================================

export async function createCategory(payload) {
  const { data } = await api.post(
    "/menu/categories/",
    payload
  );

  return data;
}


// ============================================================
// UPDATE CATEGORY
// /api/menu/categories/<id>/
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
    `/menu/categories/${id}/`,
    payload
  );

  return data;
}


// ============================================================
// DELETE CATEGORY
// /api/menu/categories/<id>/
// ============================================================

export async function deleteCategory(id) {
  if (!id) {
    throw new Error(
      "Category ID is required."
    );
  }

  await api.delete(
    `/menu/categories/${id}/`
  );

  return true;
}
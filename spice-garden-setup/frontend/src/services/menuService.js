import api from "./api";

// ============================================================
// HELPER: EXTRACT ARRAY FROM API RESPONSE
// ============================================================

function extractArray(data, type = "items") {
  // Normal array response
  if (Array.isArray(data)) {
    return data;
  }

  // Django REST Framework paginated response
  // {
  //   "count": 12,
  //   "next": null,
  //   "previous": null,
  //   "results": [...]
  // }
  if (Array.isArray(data?.results)) {
    return data.results;
  }

  // Custom categories response
  if (
    type === "categories" &&
    Array.isArray(data?.categories)
  ) {
    return data.categories;
  }

  // Custom menu response
  if (
    type === "items" &&
    Array.isArray(data?.items)
  ) {
    return data.items;
  }

  if (
    type === "items" &&
    Array.isArray(data?.menu_items)
  ) {
    return data.menu_items;
  }

  console.warn(
    "Unexpected API response:",
    data
  );

  return [];
}


// ============================================================
// FETCH CATEGORIES
// Backend: /api/categories/
// ============================================================

export async function fetchCategories(params = {}) {
  const response = await api.get(
    "/categories/",
    {
      params,
    }
  );

  return extractArray(
    response.data,
    "categories"
  );
}


// ============================================================
// FETCH MENU ITEMS
// Backend: /api/menu/
// ============================================================

export async function fetchMenuItems(params = {}) {
  let allItems = [];
  let page = 1;

  while (true) {
    const response = await api.get(
      "/menu/",
      {
        params: {
          ...params,
          page,
        },
      }
    );

    const data = response.data;

    // --------------------------------------------------------
    // Normal array response
    // --------------------------------------------------------

    if (Array.isArray(data)) {
      allItems = [
        ...allItems,
        ...data,
      ];

      break;
    }

    // --------------------------------------------------------
    // Django REST Framework pagination
    // --------------------------------------------------------

    if (Array.isArray(data?.results)) {
      allItems = [
        ...allItems,
        ...data.results,
      ];

      // No next page
      if (!data.next) {
        break;
      }

      page += 1;

      continue;
    }

    // --------------------------------------------------------
    // Custom response:
    // { items: [...] }
    // --------------------------------------------------------

    if (Array.isArray(data?.items)) {
      allItems = [
        ...allItems,
        ...data.items,
      ];

      break;
    }

    // --------------------------------------------------------
    // Custom response:
    // { menu_items: [...] }
    // --------------------------------------------------------

    if (
      Array.isArray(data?.menu_items)
    ) {
      allItems = [
        ...allItems,
        ...data.menu_items,
      ];

      break;
    }

    // --------------------------------------------------------
    // Unexpected response
    // --------------------------------------------------------

    console.warn(
      "Unexpected menu API response:",
      data
    );

    break;
  }

  // IMPORTANT:
  // Always return an array.
  // This prevents:
  // "r.map is not a function"
  // --------------------------------------------------------

  return Array.isArray(allItems)
    ? allItems
    : [];
}


// ============================================================
// FETCH SINGLE MENU ITEM
// Backend: /api/menu/<id>/
// ============================================================

export async function fetchMenuItem(id) {
  if (!id) {
    throw new Error(
      "Menu item ID is required."
    );
  }

  const response = await api.get(
    `/menu/${id}/`
  );

  return response.data;
}


// ============================================================
// CREATE MENU ITEM
// Backend: /api/menu/
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
// Backend: /api/menu/<id>/
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
// Backend: /api/menu/<id>/
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
// Backend: /api/categories/
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
// Backend: /api/categories/<id>/
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
// Backend: /api/categories/<id>/
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
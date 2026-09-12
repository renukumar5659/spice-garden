import { useEffect, useMemo, useState } from "react";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";
import * as menuService from "../../services/menuService";

const SPICE_LEVELS = [
  "mild",
  "medium",
  "hot",
  "cool",
  "warm",
];

const EMPTY_FORM = {
  id: null,
  category: "",
  name: "",
  description: "",
  ingredients: "",
  price: "",
  is_veg: true,
  food_type: "veg",
  spice_level: "medium",
  available: true,
  image: null,
  currentImage: "",
};

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("");

  const { showToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [itemsData, categoriesData] = await Promise.all([
        menuService.fetchMenuItems(),
        menuService.fetchCategories(),
      ]);

      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load menu data:", err);
      setError("Could not load menu items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      category: categories[0]?.id || "",
    });

    setError("");
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({
      id: item.id,
      category: item.category,
      name: item.name || "",
      description: item.description || "",
      ingredients: item.ingredients || "",
      price: item.price || "",
      is_veg: Boolean(item.is_veg),
      food_type:
        item.food_type ||
        getFoodTypeFromItem(item),
      spice_level: item.spice_level || "medium",
      available: Boolean(item.available),
      image: null,
      currentImage: item.image || "",
    });

    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setError("");
  }

  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = e.target;

    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        image: files?.[0] || null,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handleFoodTypeChange(type) {
    setForm((prev) => ({
      ...prev,
      food_type: type,
      is_veg: type === "nonveg" ? false : true,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = new FormData();

    payload.append(
      "category",
      String(form.category)
    );

    payload.append(
      "name",
      form.name.trim()
    );

    payload.append(
      "description",
      form.description || ""
    );

    payload.append(
      "ingredients",
      form.ingredients || ""
    );

    payload.append(
      "price",
      String(form.price)
    );

    payload.append(
      "is_veg",
      String(form.is_veg)
    );

    payload.append(
      "food_type",
      form.food_type
    );

    payload.append(
      "spice_level",
      form.spice_level
    );

    payload.append(
      "available",
      String(form.available)
    );

    if (form.image) {
      payload.append("image", form.image);
    }

    try {
      if (form.id) {
        await menuService.updateMenuItem(
          form.id,
          payload
        );

        showToast("Menu item updated");
      } else {
        await menuService.createMenuItem(
          payload
        );

        showToast("Menu item created");
      }

      closeForm();
      await loadData();
    } catch (err) {
      console.error(
        "Failed to save menu item:",
        err
      );

      const data = err.response?.data;

      if (
        data &&
        typeof data === "object"
      ) {
        const messages = Object.entries(data)
          .flatMap(([field, value]) => {
            const values = Array.isArray(value)
              ? value
              : [value];

            return values.map(
              (message) =>
                `${field}: ${message}`
            );
          })
          .join(" ");

        setError(
          messages ||
            "Could not save menu item."
        );
      } else {
        setError(
          "Could not save menu item."
        );
      }
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Delete this menu item?"
      )
    ) {
      return;
    }

    try {
      await menuService.deleteMenuItem(id);

      showToast("Menu item deleted");

      await loadData();
    } catch (err) {
      console.error(
        "Failed to delete menu item:",
        err
      );

      setError(
        "Could not delete menu item."
      );
    }
  }

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setTypeFilter("");
    setAvailabilityFilter("");
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        item.name
          ?.toLowerCase()
          .includes(searchText) ||
        item.description
          ?.toLowerCase()
          .includes(searchText) ||
        item.category_name
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        !categoryFilter ||
        String(item.category) ===
          String(categoryFilter);

      const itemFoodType =
        item.food_type ||
        getFoodTypeFromItem(item);

      const matchesType =
        !typeFilter ||
        (typeFilter === "veg" &&
          itemFoodType === "veg") ||
        (typeFilter === "nonveg" &&
          itemFoodType === "nonveg") ||
        (typeFilter === "sweet" &&
          itemFoodType === "sweet");

      const matchesAvailability =
        !availabilityFilter ||
        (availabilityFilter ===
          "available" &&
          item.available) ||
        (availabilityFilter ===
          "unavailable" &&
          !item.available);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesAvailability
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    typeFilter,
    availabilityFilter,
  ]);

  const totalItems = items.length;

  const availableItems = items.filter(
    (item) => item.available
  ).length;

  const unavailableItems =
    totalItems - availableItems;

  const vegItems = items.filter(
    (item) => item.is_veg
  ).length;

  const sweetItems = items.filter((item) => {
    const itemFoodType =
      item.food_type ||
      getFoodTypeFromItem(item);

    return itemFoodType === "sweet";
  }).length;

  function formatLevel(level) {
    if (!level) return "Medium";

    return (
      level.charAt(0).toUpperCase() +
      level.slice(1)
    );
  }

  function getFoodTypeFromItem(item) {
    const categoryName = String(item.category_name || "").toLowerCase();

    if (
      categoryName.includes("sweet") ||
      categoryName.includes("dessert")
    ) {
      return "sweet";
    }

    return item.is_veg ? "veg" : "nonveg";
  }



  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className="admin-menu-modern"
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "8px 14px",
      }}
    >

      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "9px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            Restaurant Management
          </div>

          <h1
            style={{
              margin: "2px 0 0",
              fontSize: "19px",
              fontWeight: 800,
            }}
          >
            Menu Items
          </h1>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreate}
          style={{
            minHeight: "34px",
            padding: "0 12px",
            fontSize: "10px",
            fontWeight: 700,
          }}
        >
          + Add Item
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && !showForm && (
        <div
          className="form-error-banner"
          style={{
            marginBottom: "14px",
            borderRadius: "10px",
            fontSize: "10px",
          }}
        >
          {error}
        </div>
      )}

      {/* ================= SUMMARY ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(110px, 1fr))",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <div
          className="card"
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              opacity: 0.6,
            }}
          >
            Total Items
          </div>

          <div
            style={{
              fontSize: "19px",
              fontWeight: 800,
              marginTop: "2px",
            }}
          >
            {totalItems}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              opacity: 0.6,
            }}
          >
            Available
          </div>

          <div
            style={{
              fontSize: "19px",
              fontWeight: 800,
              marginTop: "2px",
            }}
          >
            {availableItems}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              opacity: 0.6,
            }}
          >
            Unavailable
          </div>

          <div
            style={{
              fontSize: "19px",
              fontWeight: 800,
              marginTop: "2px",
            }}
          >
            {unavailableItems}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              opacity: 0.6,
            }}
          >
            Veg Items
          </div>

          <div
            style={{
              fontSize: "19px",
              fontWeight: 800,
              marginTop: "2px",
            }}
          >
            {vegItems}
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div
        className="card"
        style={{
          padding: "9px",
          marginBottom: "12px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(180px, 1.5fr) repeat(3, 1fr) auto",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: "100%",
              minHeight: "34px",
              padding: "6px 9px",
              fontSize: "10px",
            }}
          />

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            style={{
              minHeight: "34px",
              fontSize: "10px",
            }}
          >
            <option value="">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
            style={{
              minHeight: "34px",
              fontSize: "10px",
            }}
          >
            <option value="">
              All Types
            </option>

            <option value="veg">
              Veg
            </option>

            <option value="nonveg">
              Non-Veg
            </option>

            <option value="sweet">
              Sweet
            </option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) =>
              setAvailabilityFilter(
                e.target.value
              )
            }
            style={{
              minHeight: "34px",
              fontSize: "10px",
            }}
          >
            <option value="">
              All Status
            </option>

            <option value="available">
              Available
            </option>

            <option value="unavailable">
              Unavailable
            </option>
          </select>

          <button
            type="button"
            className="btn btn-outline"
            onClick={resetFilters}
            style={{
              minHeight: "34px",
              padding: "0 12px",
              fontSize: "10px",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ================= FORM ================= */}

      {showForm && (
        <form
          className="card admin-form"
          onSubmit={handleSubmit}
          style={{
            padding: "14px",
            marginBottom: "12px",
            borderRadius: "7px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "14px",
              }}
            >
              {form.id
                ? "Edit Menu Item"
                : "Create Menu Item"}
            </h3>

            <button
              type="button"
              className="btn-ghost"
              onClick={closeForm}
              style={{
                fontSize: "14px",
                padding: "2px 7px",
              }}
            >
              ×
            </button>
          </div>

          {error && (
            <div
              className="form-error-banner"
              style={{
                marginBottom: "14px",
                fontSize: "10px",
              }}
            >
              {error}
            </div>
          )}

          {/* NAME + CATEGORY */}

          <div className="field-row">
            <div className="field">
              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Food name"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="field">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the dish..."
            />
          </div>

          {/* INGREDIENTS */}

          <div className="field">
            <label htmlFor="ingredients">
              Ingredients
            </label>

            <input
              id="ingredients"
              name="ingredients"
              value={form.ingredients}
              onChange={handleChange}
              placeholder="Ingredients..."
            />

            <small>
              Separate ingredients with commas.
            </small>
          </div>

          {/* IMAGE */}

          <div className="field">
            <label htmlFor="image">
              Food Image
            </label>

            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
            />

            <small>
              JPG, PNG or WebP.
            </small>

            {form.currentImage &&
              !form.image && (
                <div
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      margin:
                        "0 0 5px",
                    }}
                  >
                    Current image
                  </p>

                  <img
                    src={form.currentImage}
                    alt={form.name}
                    style={{
                      width: "125px",
                      height: "75px",
                      objectFit: "cover",
                      borderRadius: "7px",
                    }}
                  />
                </div>
              )}

            {form.image && (
              <div
                style={{
                  marginTop: "10px",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    margin:
                      "0 0 5px",
                  }}
                >
                  New image preview
                </p>

                <img
                  src={URL.createObjectURL(
                    form.image
                  )}
                  alt="Selected food"
                  style={{
                    width: "125px",
                    height: "75px",
                    objectFit: "cover",
                    borderRadius: "7px",
                  }}
                />
              </div>
            )}
          </div>

          {/* PRICE + SPICE / TEMPERATURE */}

          <div className="field-row">
            <div className="field">
              <label htmlFor="price">
                Price (₹)
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="spice_level">
                Spice / Temperature
              </label>

              <select
                id="spice_level"
                name="spice_level"
                value={form.spice_level}
                onChange={handleChange}
              >
                {SPICE_LEVELS.map(
                  (level) => (
                    <option
                      key={level}
                      value={level}
                    >
                      {formatLevel(level)}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* FOOD TYPE + AVAILABILITY */}

          <div
            className="field-row"
            style={{
              gap: "20px",
              marginTop: "5px",
              alignItems: "end",
            }}
          >
            <div className="field">
              <label>Food Type</label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "18px",
                  alignItems: "center",
                  minHeight: "38px",
                  padding: "7px 10px",
                  border: "1px solid rgba(0,0,0,0.14)",
                  borderRadius: "7px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    margin: 0,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  <input
                    type="radio"
                    name="food_type"
                    value="veg"
                    checked={form.food_type === "veg"}
                    onChange={() => handleFoodTypeChange("veg")}
                  />
                  Veg
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    margin: 0,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  <input
                    type="radio"
                    name="food_type"
                    value="nonveg"
                    checked={form.food_type === "nonveg"}
                    onChange={() => handleFoodTypeChange("nonveg")}
                  />
                  Non-Veg
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    margin: 0,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  <input
                    type="radio"
                    name="food_type"
                    value="sweet"
                    checked={form.food_type === "sweet"}
                    onChange={() => handleFoodTypeChange("sweet")}
                  />
                  Sweet
                </label>
              </div>
            </div>

            <div className="field">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "38px",
                  margin: 0,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                />
                Available
              </label>
            </div>
          </div>

          {/* ACTIONS */}

          <div
            className="admin-form-actions"
            style={{
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={closeForm}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
            >
              {form.id
                ? "Save Changes"
                : "Create Item"}
            </button>
          </div>
        </form>
      )}

      {/* ================= MENU TITLE ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "19px",
            }}
          >
            Your Menu
          </h2>

          <p
            style={{
              margin: "2px 0 0",
              fontSize: "10px",
              opacity: 0.6,
            }}
          >
            Showing {filteredItems.length}{" "}
            of {items.length} items
          </p>
        </div>
      </div>

      {/* ================= MENU CARDS ================= */}

      {filteredItems.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "35px 15px",
            textAlign: "center",
            borderRadius: "7px",
          }}
        >
          <div
            style={{
              fontSize: "35px",
              marginBottom: "7px",
            }}
          >
            🍽️
          </div>

          <h3
            style={{
              margin: "0 0 5px",
            }}
          >
            No menu items found
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "10px",
              opacity: 0.65,
            }}
          >
            Try changing your filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(190px, 1fr))",
            gap: "9px",
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                overflow: "hidden",
                borderRadius: "13px",
                padding: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >

              {/* FOOD IMAGE */}

              <div
                style={{
                  height: "105px",
                  position: "relative",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #f3f3f3, #e9e9e9)",
                }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                    }}
                  >
                    🍛
                  </div>
                )}

                {/* BADGES */}

                <div
                  style={{
                    position: "absolute",
                    top: "7px",
                    left: "7px",
                    display: "flex",
                    gap: "5px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      padding: "3px 6px",
                      borderRadius: "999px",
                      background: item.is_veg
                        ? "#e8f7ed"
                        : "#fdecec",
                      fontSize: "9px",
                      fontWeight: 700,
                    }}
                  >
                    {item.is_veg
                      ? "● Veg"
                      : "● Non-Veg"}
                  </span>

                  <span
                    style={{
                      padding: "3px 6px",
                      borderRadius: "999px",
                      background:
                        item.available
                          ? "#e8f7ed"
                          : "#f1f1f1",
                      fontSize: "9px",
                      fontWeight: 700,
                    }}
                  >
                    {item.available
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>
              </div>

              {/* CARD CONTENT */}

              <div
                style={{
                  padding: "9px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >

                {/* CATEGORY */}

                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    opacity: 0.55,
                    marginBottom: "3px",
                  }}
                >
                  {item.category_name}
                </div>

                {/* NAME */}

                <h3
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: 800,
                  }}
                >
                  {item.name}
                </h3>

                {/* DESCRIPTION */}

                <p
                  style={{
                    margin:
                      "5px 0 7px",
                    fontSize: "10px",
                    lineHeight: 1.35,
                    opacity: 0.7,
                    display:
                      "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient:
                      "vertical",
                    overflow: "hidden",
                    minHeight: "30px",
                  }}
                >
                  {item.description ||
                    "No description available."}
                </p>

                {/* PRICE + TEMPERATURE */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "auto",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    ₹
                    {Number(
                      item.price
                    ).toFixed(0)}
                  </strong>

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      opacity: 0.7,
                    }}
                  >
                    {formatLevel(
                      item.spice_level
                    )}
                  </span>
                </div>

                {/* BUTTONS */}

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "9px",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      openEdit(item)
                    }
                    style={{
                      flex: 1,
                      minHeight: "29px",
                      padding: "0 8px",
                      fontSize: "10px",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      handleDelete(
                        item.id
                      )
                    }
                    style={{
                      minHeight: "29px",
                      padding: "0 9px",
                      fontSize: "10px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= RESPONSIVE ================= */}

      <style>{`
        /* =====================================================
           ADMIN MENU - COMPACT MODERN UI
           Small clean boxes, stable layout
           ===================================================== */

        .admin-menu-modern {
          width: 100%;
          color: var(--brown);
          box-sizing: border-box;
        }

        .admin-menu-modern .card {
          border: 1px solid rgba(43, 24, 16, 0.12);
          box-shadow: 0 2px 8px rgba(43, 24, 16, 0.035);
        }

        .admin-menu-modern input,
        .admin-menu-modern select,
        .admin-menu-modern textarea {
          box-sizing: border-box;
          max-width: 100%;
        }

        .admin-menu-modern button,
        .admin-menu-modern .card {
          transform: none !important;
        }

        .admin-menu-modern img {
          max-width: 100%;
        }

        .admin-menu-modern > div {
          min-width: 0;
        }

        @media (max-width: 900px) {
          .admin-menu-modern > div:nth-child(4) {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .admin-menu-modern > div:nth-child(6) > div {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 600px) {
          .admin-menu-modern {
            padding: 8px !important;
          }

          .admin-menu-modern > div:nth-child(4) {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .admin-menu-modern > div:nth-child(5) > div {
            grid-template-columns: 1fr !important;
          }

          .admin-menu-modern > div:nth-child(6) > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";
import * as menuService from "../../services/menuService";

const SPICE_LEVELS = ["mild", "medium", "hot"];

const EMPTY_FORM = {
  id: null,
  category: "",
  name: "",
  description: "",
  ingredients: "",
  price: "",
  is_veg: true,
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
      spice_level: item.spice_level || "medium",
      available: Boolean(item.available),
      image: null,
      currentImage: item.image || "",
    });

    setError("");
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        image: files?.[0] || null,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = new FormData();

    payload.append("category", String(form.category));
    payload.append("name", form.name.trim());
    payload.append("description", form.description || "");
    payload.append("ingredients", form.ingredients || "");
    payload.append("price", String(form.price));
    payload.append("is_veg", String(form.is_veg));
    payload.append("spice_level", form.spice_level);
    payload.append("available", String(form.available));

    // Only send image when the user selected a new image.
    if (form.image) {
      payload.append("image", form.image);
    }

    try {
      if (form.id) {
        await menuService.updateMenuItem(form.id, payload);
        showToast("Menu item updated");
      } else {
        await menuService.createMenuItem(payload);
        showToast("Menu item created");
      }

      setForm(EMPTY_FORM);
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error("Failed to save menu item:", err);

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .flatMap(([field, value]) => {
            const values = Array.isArray(value) ? value : [value];
            return values.map((message) => `${field}: ${message}`);
          })
          .join(" ");

        setError(messages || "Could not save menu item.");
      } else {
        setError("Could not save menu item.");
      }
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this menu item?")) {
      return;
    }

    try {
      await menuService.deleteMenuItem(id);
      showToast("Menu item deleted");
      await loadData();
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      setError("Could not delete menu item.");
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Menu Items</h1>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreate}
        >
          + Add Item
        </button>
      </div>

      {error && !showForm && (
        <div className="form-error-banner">
          {error}
        </div>
      )}

      {showForm && (
        <form className="card admin-form" onSubmit={handleSubmit}>
          <h3>{form.id ? "Edit Item" : "New Item"}</h3>

          {error && (
            <div className="form-error-banner">
              {error}
            </div>
          )}

          <div className="field-row">
            <div className="field">
              <label htmlFor="name">Name</label>

              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="ingredients">
              Ingredients (comma-separated)
            </label>

            <input
              id="ingredients"
              name="ingredients"
              value={form.ingredients}
              onChange={handleChange}
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="field">
            <label htmlFor="image">Food Image</label>

            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
            />

            <small>
              Upload a JPG, PNG, or WebP image.
            </small>

            {form.currentImage && !form.image && (
              <div style={{ marginTop: "12px" }}>
                <p>Current image:</p>

                <img
                  src={form.currentImage}
                  alt={form.name}
                  style={{
                    width: "180px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            )}

            {form.image && (
              <div style={{ marginTop: "12px" }}>
                <p>New image preview:</p>

                <img
                  src={URL.createObjectURL(form.image)}
                  alt="Selected food"
                  style={{
                    width: "180px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            )}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="price">Price (₹)</label>

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
              <label htmlFor="spice_level">Spice Level</label>

              <select
                id="spice_level"
                name="spice_level"
                value={form.spice_level}
                onChange={handleChange}
              >
                {SPICE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row checkboxes">
            <label>
              <input
                type="checkbox"
                name="is_veg"
                checked={form.is_veg}
                onChange={handleChange}
              />
              {" "}Veg
            </label>

            <label>
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
              />
              {" "}Available
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
                setError("");
              }}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              {form.id ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Veg</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>

                <td>{item.category_name}</td>

                <td>
                  ₹{Number(item.price).toFixed(0)}
                </td>

                <td>
                  {item.is_veg ? "Veg" : "Non-Veg"}
                </td>

                <td>
                  {item.available ? "Yes" : "No"}
                </td>

                <td className="admin-table-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => openEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const API_ORIGIN =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://127.0.0.1:8000";

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  // Django API already returned a full URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Django returned a relative media path
  return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
}

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();

    addItem(item, 1);
    showToast(`${item.name} added to cart`);
  }

  const imageUrl = getImageUrl(item.image);

  return (
    <Link
      to={`/menu/${item.id}`}
      className="menu-card card"
    >
      {/* Food Image */}
      <div className="menu-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            loading="lazy"
            className="menu-item-image"
          />
        ) : (
          <div className="menu-card-placeholder">
            🍛
          </div>
        )}
      </div>

      {/* Food Details */}
      <div className="menu-card-body">
        <h3>{item.name}</h3>

        <p className="menu-card-desc">
          {item.description || ""}
        </p>

        {/* Price + Add to Cart */}
        <div className="menu-card-footer">
          <span className="menu-card-price">
            ₹{Number(item.price).toFixed(0)}
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAdd}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
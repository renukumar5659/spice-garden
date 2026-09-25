import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

// =========================================================
// BACKEND URL
// =========================================================

const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_URL ||
  "https://spice-garden-backend-flzi.onrender.com";

// =========================================================
// IMAGE URL HELPER
// =========================================================

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  const imageString = String(image).trim();

  // Already a complete URL
  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://")
  ) {
    return imageString;
  }

  // Django returned a relative path such as:
  // /media/menu/chicken-tikka.jpg
  //
  // or:
  // media/menu/chicken-tikka.jpg

  const path = imageString.startsWith("/")
    ? imageString
    : `/${imageString}`;

  return `${BACKEND_ORIGIN}${path}`;
}

// =========================================================
// MENU ITEM CARD
// =========================================================

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
      {/* =====================================================
          FOOD IMAGE
          ===================================================== */}

      <div className="menu-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            loading="lazy"
            className="menu-item-image"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.classList.add(
                "image-load-error"
              );
            }}
          />
        ) : (
          <div className="menu-card-placeholder">
            🍛
          </div>
        )}
      </div>

      {/* =====================================================
          FOOD DETAILS
          ===================================================== */}

      <div className="menu-card-body">
        <h3>{item.name}</h3>

        <p className="menu-card-desc">
          {item.description || ""}
        </p>

        {/* ===================================================
            PRICE + ADD TO CART
            =================================================== */}

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
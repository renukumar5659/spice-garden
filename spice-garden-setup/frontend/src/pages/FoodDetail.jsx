import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import SpiceMeter from "../components/SpiceMeter";
import VegBadge from "../components/VegBadge";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import * as menuService from "../services/menuService";

export default function FoodDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    menuService
      .fetchMenuItem(id)
      .then(setItem)
      .catch(() => setError("This dish could not be found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (error || !item) {
    return (
      <div className="container section-tight">
        <p>{error || "Dish not found."}</p>
        <Link to="/menu" className="btn btn-outline">Back to Menu</Link>
      </div>
    );
  }

  const ingredients = item.ingredients
    ? item.ingredients.split(",").map((i) => i.trim()).filter(Boolean)
    : [];

  function handleAddToCart() {
    addItem(item, qty);
    showToast(`${qty} × ${item.name} added to cart`);
  }

  return (
    <div className="container section-tight food-detail">
      <div className="food-detail-image">
        {item.image ? <img src={item.image} alt={item.name} /> : <div className="menu-card-placeholder large">🍛</div>}
      </div>
      <div className="food-detail-info">
        <div className="menu-card-top">
          <VegBadge isVeg={item.is_veg} />
          <SpiceMeter level={item.spice_level} />
        </div>
        <h1>{item.name}</h1>
        <p className="food-detail-desc">{item.description}</p>

        {ingredients.length > 0 && (
          <div className="ingredients">
            <h4>Ingredients</h4>
            <ul>
              {ingredients.map((ing) => <li key={ing}>{ing}</li>)}
            </ul>
          </div>
        )}

        <div className="food-detail-price">₹{Number(item.price).toFixed(0)}</div>

        <div className="qty-selector">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
          <span>{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
        </div>

        <div className="food-detail-actions">
          <button className="btn btn-secondary" onClick={handleAddToCart}>Add to Cart</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              handleAddToCart();
              navigate("/cart");
            }}
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}

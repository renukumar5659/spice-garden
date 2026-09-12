import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import SpiceMeter from "../components/SpiceMeter";
import VegBadge from "../components/VegBadge";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import * as menuService from "../services/menuService";

const foodDetailStyles = `
  .food-detail-modern {
    max-width: 980px;
    margin: 0 auto;
    padding: 24px 16px 40px;
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 18px;
    align-items: start;
  }

  .food-detail-photo {
    overflow: hidden;
    min-height: 330px;
    border: 1px solid #dedede;
    border-radius: 12px;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .food-detail-photo img {
    display: block;
    width: 100%;
    height: 330px;
    object-fit: cover;
  }

  .food-detail-placeholder {
    font-size: 80px;
  }

  .food-detail-panel {
    border: 1px solid #dedede;
    border-radius: 12px;
    padding: 18px;
    background: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  .food-detail-badges {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 11px;
  }

  .food-detail-panel h1 {
    margin: 0;
    font-size: 25px;
    line-height: 1.25;
  }

  .food-detail-desc {
    margin: 10px 0 15px;
    font-size: 14px;
    line-height: 1.6;
  }

  .food-detail-ingredients {
    margin-bottom: 16px;
    padding: 11px 12px;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
  }

  .food-detail-ingredients h4 {
    margin: 0 0 7px;
    font-size: 13px;
  }

  .food-detail-ingredients ul {
    margin: 0;
    padding-left: 18px;
  }

  .food-detail-ingredients li {
    margin: 3px 0;
    font-size: 12px;
    line-height: 1.45;
  }

  .food-detail-price {
    margin: 3px 0 14px;
    font-size: 22px;
    font-weight: 700;
  }

  .food-detail-qty {
    display: inline-flex;
    align-items: center;
    margin-bottom: 14px;
    border: 1px solid #d8d8d8;
    border-radius: 7px;
    overflow: hidden;
  }

  .food-detail-qty button {
    width: 36px;
    height: 36px;
    border: 0;
    background: #f7f7f7;
    font-size: 18px;
    cursor: pointer;
  }

  .food-detail-qty span {
    min-width: 38px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
  }

  .food-detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .food-detail-actions .btn {
    min-height: 40px;
    font-size: 13px;
  }

  .food-detail-back {
    display: inline-block;
    margin-bottom: 12px;
    font-size: 12px;
  }

  .food-detail-error {
    max-width: 620px;
    margin: 30px auto;
    padding: 18px;
    border: 1px solid #dedede;
    border-radius: 10px;
  }

  @media (max-width: 760px) {
    .food-detail-modern {
      grid-template-columns: 1fr;
      padding: 18px 12px 30px;
    }

    .food-detail-photo,
    .food-detail-photo img {
      min-height: 230px;
      height: 230px;
    }

    .food-detail-panel {
      padding: 16px;
    }

    .food-detail-panel h1 {
      font-size: 21px;
    }

    .food-detail-actions {
      display: grid;
      grid-template-columns: 1fr;
    }
  }
`;

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
    setError("");

    menuService
      .fetchMenuItem(id)
      .then(setItem)
      .catch(() => setError("This dish could not be found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;

  if (error || !item) {
    return (
      <>
        <style>{foodDetailStyles}</style>
        <div className="food-detail-error">
          <p>{error || "Dish not found."}</p>
          <Link to="/menu" className="btn btn-outline">
            Back to Menu
          </Link>
        </div>
      </>
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
    <>
      <style>{foodDetailStyles}</style>

      <div className="food-detail-modern">
        <div className="food-detail-photo">
          {item.image ? (
            <img src={item.image} alt={item.name} />
          ) : (
            <div className="food-detail-placeholder">🍛</div>
          )}
        </div>

        <div className="food-detail-panel">
          <Link to="/menu" className="food-detail-back">
            ← Back to Menu
          </Link>

          <div className="food-detail-badges">
            <VegBadge isVeg={item.is_veg} />
            <SpiceMeter level={item.spice_level} />
          </div>

          <h1>{item.name}</h1>

          <p className="food-detail-desc">{item.description}</p>

          {ingredients.length > 0 && (
            <div className="food-detail-ingredients">
              <h4>Ingredients</h4>
              <ul>
                {ingredients.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="food-detail-price">
            ₹{Number(item.price).toFixed(0)}
          </div>

          <div className="food-detail-qty" aria-label="Quantity selector">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>{qty}</span>

            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="food-detail-actions">
            <button
              className="btn btn-secondary"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

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
    </>
  );
}

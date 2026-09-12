import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const cartStyles = `
  .cart-page-modern {
    max-width: 1040px;
    margin: 0 auto;
    padding: 24px 16px 40px;
  }

  .cart-heading {
    margin-bottom: 18px;
  }

  .cart-heading .eyebrow {
    display: inline-block;
    margin-bottom: 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.1px;
    text-transform: uppercase;
  }

  .cart-heading h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
  }

  .cart-layout-modern {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(270px, 0.7fr);
    gap: 16px;
    align-items: start;
  }

  .cart-items-modern {
    display: grid;
    gap: 9px;
  }

  .cart-row-modern {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) auto auto auto;
    align-items: center;
    gap: 12px;
    padding: 11px;
    background: #fff;
    border: 1px solid #dedede;
    border-radius: 10px;
  }

  .cart-row-image-modern {
    width: 64px;
    height: 58px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    background: #fafafa;
    font-size: 27px;
  }

  .cart-row-image-modern img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .cart-row-info-modern {
    min-width: 0;
  }

  .cart-row-info-modern h4 {
    margin: 0 0 4px;
    font-size: 14px;
    line-height: 1.35;
  }

  .cart-row-price-modern {
    font-size: 12px;
    opacity: 0.7;
  }

  .cart-qty-modern {
    display: inline-flex;
    align-items: center;
    border: 1px solid #d8d8d8;
    border-radius: 7px;
    overflow: hidden;
  }

  .cart-qty-modern button {
    width: 31px;
    height: 32px;
    border: 0;
    background: #f7f7f7;
    font-size: 16px;
    cursor: pointer;
  }

  .cart-qty-modern span {
    min-width: 31px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
  }

  .cart-row-total-modern {
    min-width: 62px;
    text-align: right;
    font-size: 13px;
    font-weight: 700;
  }

  .cart-remove-modern {
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px solid #ddd;
    border-radius: 7px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
  }

  .cart-summary-modern {
    position: sticky;
    top: 84px;
    padding: 16px;
    background: #fff;
    border: 1px solid #dedede;
    border-radius: 11px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  }

  .cart-summary-modern h3 {
    margin: 0 0 14px;
    font-size: 16px;
  }

  .cart-summary-line {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 9px;
    font-size: 13px;
  }

  .cart-summary-line.total {
    margin-top: 5px;
    padding-top: 11px;
    border-top: 1px solid #ddd;
    font-size: 16px;
    font-weight: 700;
  }

  .cart-checkout-btn {
    width: 100%;
    min-height: 40px;
    margin-top: 10px;
    font-size: 13px;
  }

  @media (max-width: 760px) {
    .cart-page-modern {
      padding: 18px 12px 30px;
    }

    .cart-layout-modern {
      grid-template-columns: 1fr;
    }

    .cart-summary-modern {
      position: static;
    }

    .cart-row-modern {
      grid-template-columns: 55px minmax(0, 1fr) auto;
      gap: 9px;
    }

    .cart-row-image-modern {
      width: 55px;
      height: 52px;
    }

    .cart-qty-modern {
      grid-column: 2;
    }

    .cart-row-total-modern {
      grid-column: 3;
      grid-row: 2;
    }

    .cart-remove-modern {
      grid-column: 3;
      grid-row: 1;
    }
  }
`;

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, deliveryCharge, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <>
        <style>{cartStyles}</style>
        <div className="container section-tight">
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            message="Looks like you haven't added anything yet."
            action={
              <Link to="/menu" className="btn btn-primary">
                Browse Menu
              </Link>
            }
          />
        </div>
      </>
    );
  }

  function handleCheckout() {
    navigate(isAuthenticated ? "/checkout" : "/login", {
      state: !isAuthenticated
        ? { from: { pathname: "/checkout" } }
        : undefined,
    });
  }

  return (
    <>
      <style>{cartStyles}</style>

      <div className="cart-page-modern">
        <div className="cart-heading">
          <span className="eyebrow">Your selection</span>
          <h1>Your Cart</h1>
        </div>

        <div className="cart-layout-modern">
          <div className="cart-items-modern">
            {items.map((item) => (
              <div key={item.id} className="cart-row-modern">
                <div className="cart-row-image-modern">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>🍛</span>
                  )}
                </div>

                <div className="cart-row-info-modern">
                  <h4>{item.name}</h4>
                  <span className="cart-row-price-modern">
                    ₹{Number(item.price).toFixed(0)} each
                  </span>
                </div>

                <div className="cart-qty-modern" aria-label={`Quantity for ${item.name}`}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>
                </div>

                <div className="cart-row-total-modern">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </div>

                <button
                  type="button"
                  className="cart-remove-modern"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary-modern">
            <h3>Order Summary</h3>

            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            <div className="cart-summary-line">
              <span>Delivery Charge</span>
              <span>₹{deliveryCharge.toFixed(0)}</span>
            </div>

            <div className="cart-summary-line total">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary cart-checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

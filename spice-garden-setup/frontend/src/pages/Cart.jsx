import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, deliveryCharge, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container section-tight">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Looks like you haven't added anything yet."
          action={<Link to="/menu" className="btn btn-primary">Browse Menu</Link>}
        />
      </div>
    );
  }

  function handleCheckout() {
    navigate(isAuthenticated ? "/checkout" : "/login", {
      state: !isAuthenticated ? { from: { pathname: "/checkout" } } : undefined,
    });
  }

  return (
    <div className="container section-tight">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-row card">
              <div className="cart-row-image">
                {item.image ? <img src={item.image} alt={item.name} /> : <span>🍛</span>}
              </div>
              <div className="cart-row-info">
                <h4>{item.name}</h4>
                <span className="cart-row-price">₹{item.price.toFixed(0)}</span>
              </div>
              <div className="qty-selector">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-row-total">₹{(item.price * item.quantity).toFixed(0)}</div>
              <button className="cart-remove" onClick={() => removeItem(item.id)} aria-label="Remove item">✕</button>
            </div>
          ))}
        </div>

        <div className="cart-summary card receipt">
          <h3>Order Summary</h3>
          <div className="summary-line"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
          <div className="summary-line"><span>Delivery Charge</span><span>₹{deliveryCharge.toFixed(0)}</span></div>
          <div className="summary-line total"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
          <button className="btn btn-primary btn-block" onClick={handleCheckout}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
}

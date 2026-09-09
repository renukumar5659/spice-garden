import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import * as orderService from "../services/orderService";

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, deliveryCharge, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user ? `${user.first_name} ${user.last_name}`.trim() : "",
    phone: user?.phone || "",
    email: user?.email || "",
    delivery_address: user?.address || "",
    pin_code: "",
    special_instructions: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errs = {};

    if (!form.full_name.trim()) {
      errs.full_name = "Full name is required.";
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      errs.phone = "Enter a valid 10-digit mobile number.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (!form.delivery_address.trim()) {
      errs.delivery_address = "Delivery address is required.";
    }

    if (!/^\d{4,10}$/.test(form.pin_code.trim())) {
      errs.pin_code = "Enter a valid PIN code.";
    }

    return errs;
  }

  function openRazorpay(order, razorpayOrder) {
    if (!window.Razorpay) {
      setFormError(
        "Razorpay could not be loaded. Please refresh the page and try again."
      );
      setSubmitting(false);
      return;
    }

    const options = {
      key: razorpayOrder.key_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Spice Garden",
      description: `Payment for Order ${order.order_id}`,
      order_id: razorpayOrder.razorpay_order_id,

      prefill: {
        name: form.full_name,
        email: form.email,
        contact: form.phone,
      },

      notes: {
        address: form.delivery_address,
      },

      theme: {
        color: "#8b4513",
      },

      handler: async function (response) {
        try {
          setFormError("");

          await orderService.verifyRazorpayPayment(order.id, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          clearCart();
          showToast("Payment successful! Order confirmed.");
          navigate(`/order-confirmation/${order.id}`);
        } catch (err) {
          setFormError(
            err.response?.data?.detail ||
              "Payment verification failed. Please contact support."
          );
        } finally {
          setSubmitting(false);
        }
      },

      modal: {
        ondismiss: function () {
          setSubmitting(false);
          setFormError(
            "Payment was cancelled. Your order is still pending payment."
          );
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      setSubmitting(false);
      setFormError(
        response.error?.description ||
          "Payment failed. Please try again."
      );
    });

    razorpay.open();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      // 1. Create Spice Garden order
      const order = await orderService.placeOrder({
        ...form,
        items: items.map((i) => ({
          menu_item: i.id,
          quantity: i.quantity,
        })),
      });

      // 2. Create Razorpay order
      const razorpayOrder = await orderService.createRazorpayOrder(order.id);

      // 3. Open Razorpay checkout
      openRazorpay(order, razorpayOrder);
    } catch (err) {
      setFormError(
        err.response?.data?.detail ||
          "Could not start payment. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="container section-tight">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form className="card checkout-form" onSubmit={handleSubmit}>
          {formError && (
            <div className="form-error-banner">
              {formError}
            </div>
          )}

          <div className="field">
            <label htmlFor="full_name">Full Name</label>

            <input
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
            />

            {errors.full_name && (
              <p className="field-error">{errors.full_name}</p>
            )}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="phone">Mobile Number</label>

              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />

              {errors.phone && (
                <p className="field-error">{errors.phone}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />

              {errors.email && (
                <p className="field-error">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor="delivery_address">
              Delivery Address
            </label>

            <textarea
              id="delivery_address"
              name="delivery_address"
              rows={3}
              value={form.delivery_address}
              onChange={handleChange}
            />

            {errors.delivery_address && (
              <p className="field-error">
                {errors.delivery_address}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="pin_code">PIN Code</label>

            <input
              id="pin_code"
              name="pin_code"
              value={form.pin_code}
              onChange={handleChange}
            />

            {errors.pin_code && (
              <p className="field-error">{errors.pin_code}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="special_instructions">
              Special Instructions (optional)
            </label>

            <textarea
              id="special_instructions"
              name="special_instructions"
              rows={2}
              value={form.special_instructions}
              onChange={handleChange}
            />
          </div>

          <button
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting
              ? "Opening Payment…"
              : `Pay with Razorpay — ₹${total.toFixed(0)}`}
          </button>
        </form>

        <div className="card receipt">
          <h3>Order Summary</h3>

          {items.map((i) => (
            <div key={i.id} className="summary-line">
              <span>
                {i.name} × {i.quantity}
              </span>

              <span>
                ₹{(i.price * i.quantity).toFixed(0)}
              </span>
            </div>
          ))}

          <hr />

          <div className="summary-line">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="summary-line">
            <span>Delivery Charge</span>
            <span>₹{deliveryCharge.toFixed(0)}</span>
          </div>

          <div className="summary-line total">
            <span>Total</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
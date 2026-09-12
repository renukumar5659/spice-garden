import { useEffect, useRef, useState } from "react";

import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { useCart } from "../context/CartContext";

import { useToast } from "../context/ToastContext";

import * as orderService from "../services/orderService";

const checkoutModernStyles = `
.checkout-modern{max-width:1180px;margin:0 auto;padding:8px 14px 12px;box-sizing:border-box;color:#2d211b}
.checkout-page-title{position:relative;margin-bottom:7px;padding:8px 14px;border:1px solid rgba(113,73,43,.13);border-radius:12px;background:#fffaf2;box-shadow:0 3px 12px rgba(69,42,24,.05);overflow:hidden}
.checkout-page-title:after{content:"";position:absolute;right:-35px;top:-50px;width:110px;height:110px;border-radius:50%;background:rgba(155,72,35,.06)}
.checkout-page-title .checkout-kicker{display:block;margin-bottom:1px;font-size:8px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;color:#a33628}.checkout-page-title h1{margin:0;font-size:23px;line-height:1.08;color:#2a1b14}.checkout-page-title p{margin:2px 0 0;font-size:10px;line-height:1.25;color:#756960}
.checkout-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:7px}.checkout-step{display:flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid rgba(86,54,35,.13);border-radius:8px;background:#fff;font-size:10px;font-weight:800;color:#81756d}.checkout-step.active{border-color:rgba(154,72,35,.28);color:#863a20;background:#fff8ee}.checkout-step-number{width:19px;height:19px;display:grid;place-items:center;border-radius:50%;background:#eee7df;font-size:9px;flex:0 0 auto}.checkout-step.active .checkout-step-number{background:#9b4525;color:#fff}
.checkout-modern .checkout-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.82fr);gap:12px;align-items:start}.checkout-modern .checkout-form,.checkout-modern .checkout-receipt-modern{border:1px solid rgba(86,54,35,.13);border-radius:12px;background:rgba(255,253,249,.98);box-shadow:0 4px 15px rgba(69,42,24,.06)}.checkout-modern .checkout-form{padding:11px}.checkout-section{padding:0 0 8px;margin:0 0 8px;border-bottom:1px solid rgba(86,54,35,.10)}.checkout-section:last-of-type{margin-bottom:3px;border-bottom:0;padding-bottom:0}.checkout-section-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}.checkout-section-head h2{margin:0;font-size:13px;color:#2e211b}.checkout-section-head p{margin:1px 0 0;font-size:8px;color:#7b7069}.checkout-section-title{display:flex;align-items:center;gap:7px}.checkout-section-icon{width:24px;height:24px;display:grid;place-items:center;border-radius:7px;background:#fff0e5;border:1px solid rgba(155,69,35,.14);font-size:12px}
.checkout-modern .field{margin-bottom:6px}.checkout-modern .field label{display:block;margin-bottom:3px;font-size:9px;font-weight:800;color:#4a382e}.checkout-modern .field input,.checkout-modern .field textarea,.checkout-modern .field select{width:100%;box-sizing:border-box;min-height:32px;padding:6px 9px;border:1px solid #dfd3c9;border-radius:7px;font-size:10px;line-height:1.2;background:#fff;color:#33271f}.checkout-modern .field input:focus,.checkout-modern .field textarea:focus{outline:none;border-color:#a86543;box-shadow:0 0 0 2px rgba(168,101,67,.10)}.checkout-modern .field textarea{min-height:48px;height:48px;resize:none}.checkout-modern .field-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.checkout-modern .field-error{margin:2px 0 0;font-size:8px;color:#aa3027}.checkout-modern .field-hint{margin:2px 0 0;font-size:8px;color:#7b7069}
.location-actions{display:flex;gap:7px;align-items:center;margin:0 0 6px}.current-location-btn{border:1px solid #d8b59e;background:#fff6ed;color:#833b20;border-radius:7px;padding:6px 9px;font-size:9px;font-weight:900;cursor:pointer;white-space:nowrap}.current-location-btn:hover{background:#ffeedf}.current-location-btn:disabled{opacity:.65;cursor:wait}.location-status{font-size:8px;color:#5f6f5f}.location-status.error{color:#a52b24}.location-card{margin:0 0 6px;padding:6px 8px;border:1px solid rgba(47,125,50,.18);border-radius:7px;background:#f3faf2;font-size:8px;line-height:1.3;color:#51463f}.location-card strong{display:inline;margin-right:5px;color:#2f6d32}.delivery-fields{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(140px,.65fr);gap:8px}
.checkout-modern .btn-block{width:100%;min-height:38px;margin-top:4px;border-radius:8px;font-size:11px;font-weight:900}.secure-note{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:4px;font-size:8px;color:#766b63}.form-error-banner{margin-bottom:7px;padding:7px 9px;border:1px solid rgba(165,43,36,.18);border-radius:7px;background:#fff1ef;color:#9b2c25;font-size:9px;line-height:1.3}
.checkout-modern .checkout-receipt-modern{position:sticky;top:8px;padding:11px;overflow:hidden}.checkout-modern .checkout-receipt-modern:before{content:"";display:block;height:3px;margin:-11px -11px 9px;background:linear-gradient(90deg,#8f321f,#c4773d,#e6b27b)}.summary-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}.summary-header h3{margin:0;font-size:15px;color:#2d211b}.summary-count{font-size:8px;font-weight:900;padding:4px 6px;border-radius:999px;background:#f7eadc;color:#80502e}.summary-items{max-height:190px;overflow:auto;padding-right:2px}.summary-item{display:flex;align-items:flex-start;justify-content:space-between;gap:7px;padding:6px 0;border-bottom:1px solid rgba(86,54,35,.09)}.summary-item-info{min-width:0}.summary-item-name{font-size:9px;font-weight:800;line-height:1.25}.summary-item-meta{margin-top:1px;font-size:8px;color:#7b7069}.summary-item-price{white-space:nowrap;font-size:9px;font-weight:900}.summary-totals{margin-top:3px}.checkout-modern .checkout-receipt-modern .summary-line{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 0;font-size:9px;border-bottom:1px solid rgba(86,54,35,.08)}.checkout-modern .checkout-receipt-modern .summary-line.total{padding-top:7px;border-bottom:0;font-size:16px;font-weight:900;color:#9b2c25}.delivery-note{margin-top:7px;padding:7px 8px;border-radius:7px;background:#f8f3ec;font-size:8px;line-height:1.3;color:#71665e}.payment-method{margin-top:7px;padding:7px 8px;border:1px solid rgba(139,69,19,.15);border-radius:7px;background:#fff8ef}.payment-method strong{font-size:9px}.payment-method p{margin:2px 0 0;font-size:8px;line-height:1.25;color:#766b63}.checkout-badge-row{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.checkout-badge{padding:4px 5px;border:1px solid rgba(86,54,35,.11);border-radius:5px;background:#fff;font-size:8px;color:#6f625b}
@media(max-width:900px){.checkout-modern{padding:12px 10px 20px}.checkout-modern .checkout-layout{grid-template-columns:1fr}.checkout-modern .checkout-receipt-modern{position:static}.summary-items{max-height:none}}
@media(max-width:700px){.checkout-steps{grid-template-columns:1fr}.checkout-modern .field-row,.delivery-fields{grid-template-columns:1fr;gap:0}.checkout-page-title h1{font-size:21px}.location-actions{align-items:stretch;flex-direction:column}.current-location-btn{width:100%}}
`;






export default function Checkout() {
  const razorpayRef = useRef(null);
  const bodyOverflowRef = useRef("");

  // Clean up only our Razorpay instance when Checkout unmounts.
  // Do not manually remove Razorpay's iframe/container: Razorpay owns that DOM.
  useEffect(() => {
    return () => {
      try {
        razorpayRef.current?.close();
      } catch {
        // Razorpay may already be closed.
      }

      document.body.style.overflow = bodyOverflowRef.current || "";
      razorpayRef.current = null;
    };
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-checkout-modern", "true");
    style.textContent = checkoutModernStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const { user } = useAuth();
  const { items, subtotal, deliveryCharge, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user
      ? `${user.first_name} ${user.last_name}`.trim()
      : "",
    phone: user?.phone || "",
    email: user?.email || "",
    delivery_address: user?.address || "",
    pin_code: "",
    special_instructions: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Pincode location state
  const [location, setLocation] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const pin = form.pin_code.trim();

    // Only look up a complete 6-digit Indian PIN code.
    if (!/^\d{6}$/.test(pin)) {
      setLocation(null);
      setPinMessage("");
      setPinLoading(false);
      return;
    }

    let cancelled = false;

    async function lookupPincode() {
      setPinLoading(true);
      setPinMessage("");
      setLocation(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "/api"}/auth/pincode/${pin}/`
        );

        if (!response.ok) {
          let detail = "";
          try {
            const errorData = await response.json();
            detail = errorData?.detail || "";
          } catch {
            // Ignore non-JSON error responses.
          }

          throw new Error(
            detail || "Unable to look up this PIN code right now."
          );
        }

        const data = await response.json();

        // The backend returns one location object:
        // { pin_code, area, district, state, country }
        if (
          !data ||
          typeof data !== "object" ||
          !data.area ||
          !data.district ||
          !data.state
        ) {
          throw new Error("Invalid PIN code.");
        }

        if (cancelled) return;

        const foundLocation = {
          area: data.area || "",
          district: data.district || "",
          state: data.state || "",
          country: data.country || "India",
        };

        setLocation(foundLocation);

        const locationText = [
          foundLocation.area,
          foundLocation.district,
          foundLocation.state,
          `PIN ${pin}`,
        ]
          .filter(Boolean)
          .join(", ");

        // PIN lookup must never change or erase the delivery address.
        // It only shows the detected area/district/state below the PIN field.
        setPinMessage(
          `${foundLocation.district || foundLocation.state || "Location"} found`
        );
      } catch (error) {
        if (cancelled) return;

        setLocation(null);
        setPinMessage(
          "Location not found. Please check the 6-digit PIN code."
        );
      } finally {
        if (!cancelled) {
          setPinLoading(false);
        }
      }
    }

    lookupPincode();

    return () => {
      cancelled = true;
    };
  }, [form.pin_code]);

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Current location is not supported by this browser.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`,
            { headers: { Accept: "application/json" } }
          );

          if (!response.ok) {
            throw new Error("Unable to read the current location.");
          }

          const data = await response.json();
          const address = data?.address || {};
          const postcode = String(address.postcode || "").match(/\d{6}/)?.[0] || "";

          const addressParts = [
            address.house_number,
            address.road,
            address.neighbourhood,
            address.suburb,
            address.village,
            address.town,
            address.city,
            address.district,
            address.state,
          ].filter(Boolean);

          const detectedAddress = addressParts.join(", ");

          if (!detectedAddress && !postcode) {
            throw new Error("No readable address was returned for this location.");
          }

          setCurrentLocation({
            latitude,
            longitude,
            address: detectedAddress || data?.display_name || "Current location detected",
          });

          setForm((prev) => ({
            ...prev,
            delivery_address: detectedAddress || data?.display_name || prev.delivery_address,
            pin_code: postcode || prev.pin_code,
          }));

          setErrors((prev) => ({
            ...prev,
            delivery_address: "",
            pin_code: "",
          }));

          setPinMessage(postcode ? "Current location detected" : "Current location detected. Enter PIN if needed.");
        } catch (error) {
          setLocationError(error.message || "Could not determine the address from your location.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === 1) {
          setLocationError("Location permission was denied. Allow location access in your browser and try again.");
        } else if (error.code === 2) {
          setLocationError("Your current location could not be detected. Please try again.");
        } else {
          setLocationError("Location detection timed out. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "pin_code"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
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

    if (!/^\d{6}$/.test(form.pin_code.trim())) {
      errs.pin_code = "Enter a valid 6-digit PIN code.";
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
        pin_code: form.pin_code,
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
          window.removeEventListener("scroll", closeOnPageMove);
          window.removeEventListener("wheel", closeOnPageMove, true);
          window.removeEventListener("touchmove", closeOnPageMove, true);
          document.body.style.overflow = bodyOverflowRef.current || "";
          razorpayRef.current = null;
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: function () {
          window.removeEventListener("scroll", closeOnPageMove);
          window.removeEventListener("wheel", closeOnPageMove, true);
          window.removeEventListener("touchmove", closeOnPageMove, true);
          document.body.style.overflow = bodyOverflowRef.current || "";
          razorpayRef.current = null;
          setSubmitting(false);
          setFormError(
            "Payment was cancelled. Your order is still pending payment."
          );
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpayRef.current = razorpay;

    // Allow the Checkout page to keep scrolling while Razorpay is open.
    // If the user scrolls, close the Razorpay window so it does not stay
    // stuck over the page. The user can press Pay again when ready.
    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = bodyOverflowRef.current || "";

    // Close Razorpay as soon as the user starts scrolling/wheeling the page.
    // Razorpay normally uses a fixed overlay, so listening to scroll alone is
    // not reliable while the overlay is open. We also listen for wheel/touch
    // movement in capture mode so the checkout disappears before the page
    // continues scrolling.
    let closedByPageMove = false;

    const closeOnPageMove = () => {
      if (closedByPageMove) return;
      closedByPageMove = true;

      try {
        razorpay.close();
      } catch {
        // Razorpay may already be closed.
      }

      document.body.style.overflow = bodyOverflowRef.current || "";
      razorpayRef.current = null;
      setSubmitting(false);

      window.removeEventListener("scroll", closeOnPageMove);
      window.removeEventListener("wheel", closeOnPageMove, true);
      window.removeEventListener("touchmove", closeOnPageMove, true);
    };

    window.addEventListener("scroll", closeOnPageMove, { passive: true });
    window.addEventListener("wheel", closeOnPageMove, { passive: true, capture: true });
    window.addEventListener("touchmove", closeOnPageMove, { passive: true, capture: true });

    razorpay.on("payment.failed", function (response) {
      window.removeEventListener("scroll", closeOnPageMove);
          window.removeEventListener("wheel", closeOnPageMove, true);
          window.removeEventListener("touchmove", closeOnPageMove, true);
      document.body.style.overflow = bodyOverflowRef.current || "";
      razorpayRef.current = null;
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
      const razorpayOrder = await orderService.createRazorpayOrder(
        order.id
      );

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
    <div className="container section-tight checkout-modern">
      <div className="checkout-page-title">
        <span className="checkout-kicker">SPICE GARDEN</span>
        <h1>Complete your order</h1>
        <p>Confirm your delivery details and pay securely with Razorpay.</p>
      </div>

      <div className="checkout-steps" aria-label="Checkout progress">
        <div className="checkout-step active"><span className="checkout-step-number">1</span>Delivery details</div>
        <div className="checkout-step active"><span className="checkout-step-number">2</span>Review order</div>
        <div className="checkout-step"><span className="checkout-step-number">3</span>Secure payment</div>
      </div>

      <div className="checkout-layout">
        <form className="card checkout-form checkout-form-modern" onSubmit={handleSubmit}>
          {formError && (
            <div className="form-error-banner">{formError}</div>
          )}

          <section className="checkout-section">
            <div className="checkout-section-head">
              <div className="checkout-section-title"><span className="checkout-section-icon">👤</span><div><h2>Contact details</h2><p>We use these details for your order confirmation.</p></div></div>
            </div>
            <div className="field">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              autoComplete="name"
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
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
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
                autoComplete="email"
              />
              {errors.email && (
                <p className="field-error">{errors.email}</p>
              )}
            </div>
          </div>
          </section>

          <section className="checkout-section">
            <div className="checkout-section-head">
              <div className="checkout-section-title"><span className="checkout-section-icon">📍</span><div><h2>Delivery location</h2><p>Use your current location or enter your address manually.</p></div></div>
            </div>

            <div className="location-actions">
              <button type="button" className="current-location-btn" onClick={useCurrentLocation} disabled={locating}>
                {locating ? "📍 Detecting location…" : "📍 Use Current Location"}
              </button>
              <span className={`location-status ${locationError ? "error" : ""}`}>
                {locationError || "Your browser will ask for location permission."}
              </span>
            </div>
            {currentLocation && (
              <div className="location-card">
                <strong>✓ Current location detected</strong>
                {currentLocation.address}
              </div>
            )}

          <div className="delivery-fields">
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
              placeholder="House / Flat / Street / Landmark"
              autoComplete="street-address"
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
              placeholder="Enter 6-digit PIN code"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              aria-describedby="pin-location-message"
            />

            <div
              id="pin-location-message"
              style={{
                marginTop: "8px",
                minHeight: "20px",
                fontSize: "0.82rem",
              }}
            >
              {pinLoading && (
                <span style={{ color: "var(--brown-soft)" }}>
                  🔎 Finding location…
                </span>
              )}

              {!pinLoading && location && (
                <div
                  style={{
                    padding: "11px 13px",
                    borderRadius: "10px",
                    background: "rgba(47, 125, 50, 0.08)",
                    border: "1px solid rgba(47, 125, 50, 0.16)",
                    color: "var(--brown)",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>📍 Location found</strong>
                  <br />
                  {location.area && `${location.area}, `}
                  {location.district}, {location.state}
                </div>
              )}

              {!pinLoading && !location && pinMessage && (
                <span style={{ color: "var(--nonveg)" }}>
                  {pinMessage}
                </span>
              )}
            </div>

            {errors.pin_code && (
              <p className="field-error">{errors.pin_code}</p>
            )}
          </div>
          </div>
          </section>

          <section className="checkout-section">
            <div className="checkout-section-head">
              <div className="checkout-section-title"><span className="checkout-section-icon">📝</span><div><h2>Delivery notes</h2><p>Optional instructions for the delivery partner.</p></div></div>
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
              placeholder="Any delivery instructions?"
            />
          </div>
          </section>

          <button
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting
              ? "Opening Payment…"
              : `Pay with Razorpay — ₹${total.toFixed(0)}`}
          </button>
          <div className="secure-note">🔒 Secure payment powered by Razorpay</div>
        </form>

        <div className="card checkout-receipt-modern">
          <div className="summary-header">
            <h3>Order Summary</h3>
            <span className="summary-count">{items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          </div>

          <div className="summary-items">
            {items.map((i) => (
              <div key={i.id} className="summary-item">
                <div className="summary-item-info">
                  <div className="summary-item-name">{i.name}</div>
                  <div className="summary-item-meta">₹{Number(i.price).toFixed(0)} × {i.quantity}</div>
                </div>
                <span className="summary-item-price">₹{(i.price * i.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
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

          <div className="payment-method">
            <strong>💳 Razorpay Secure Checkout</strong>
            <p>Pay safely using UPI, cards, net banking and supported payment methods.</p>
          </div>

          <div className="checkout-badge-row">
            <span className="checkout-badge">🔒 Secure</span>
            <span className="checkout-badge">✓ Order confirmation</span>
            <span className="checkout-badge">📦 Door delivery</span>
          </div>

          <div className="delivery-note">
            Delivery charge is calculated by your current cart and checkout settings. Your final payable amount is shown above.
          </div>
        </div>
      </div>
    </div>
  );
}

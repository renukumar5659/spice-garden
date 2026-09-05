import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MenuItemCard from "../components/MenuItemCard";
import Loading from "../components/Loading";
import ReviewForm from "../components/ReviewForm";
import * as menuService from "../services/menuService";
import * as reviewService from "../services/reviewService";

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([menuService.fetchMenuItems(), reviewService.fetchReviews().catch(() => [])])
      .then(([items, revs]) => {
        setPopular(items.slice(0, 4));
        setReviews(revs.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Est. in a home kitchen, grown into a garden</span>
            <h1>
              Bold spices.
              <br />
              Honest cooking.
              <br />
              <em>Delivered warm.</em>
            </h1>
            <p className="hero-sub">
              Spice Garden brings authentic Indian and Indo-Chinese dishes to your table —
              slow-simmered gravies, tandoor-charred tikkas, and wok-tossed favorites made
              to order, every single day.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary">Order Now</Link>
              <Link to="/menu" className="btn btn-outline">View Menu</Link>
            </div>
            <div className="hero-hours">
              <span>🕒 Open daily, 11:00 AM – 11:00 PM</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-plate">🍛</div>
            <div className="hero-chip hero-chip-1">🌶️ Fresh spice blends</div>
            <div className="hero-chip hero-chip-2">🔥 Tandoor-fired</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <h2>A family kitchen, grown up</h2>
          <p className="intro-text">
            What started as weekend cooking for neighbors is now Spice Garden — a
            family-run restaurant serving Indian and Indo-Chinese comfort food, made with
            fresh ingredients and spices we grind ourselves. Every dish is cooked to order,
            never rushed.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Fan favourites</span>
            <h2>Popular dishes</h2>
          </div>
          {loading ? <Loading /> : (
            <div className="menu-grid">
              {popular.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container offer-banner">
          <div>
            <span className="eyebrow">Special offer</span>
            <h2>Free delivery on your first order</h2>
            <p>Use code <strong>SPICE50</strong> and get flat ₹50 off orders above ₹300.</p>
          </div>
          <Link to="/menu" className="btn btn-secondary">Claim Offer</Link>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">What guests say</span>
            <h2>Customer reviews</h2>
          </div>
          {reviews.length > 0 ? (
            <div className="review-grid">
              {reviews.map((r) => (
                <div key={r.id} className="review-card card">
                  <div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  <p>"{r.comment}"</p>
                  <span className="review-name">— {r.customer_name}</span>
                </div>
              ))}
            </div>
          ) : (
            !loading && <p className="intro-text">Be the first to share your experience.</p>
          )}
          <div className="review-form-wrap">
            <ReviewForm onSubmitted={(r) => setReviews((prev) => [r, ...prev].slice(0, 3))} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container contact-strip">
          <div>
            <h3>Visit or order in</h3>
            <p>14 Marigold Lane, Mahesana, Gujarat · +91 98765 43210</p>
          </div>
          <Link to="/contact" className="btn btn-outline">Get Directions</Link>
        </div>
      </section>
    </div>
  );
}

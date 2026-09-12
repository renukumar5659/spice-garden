import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MenuItemCard from "../components/MenuItemCard";
import Loading from "../components/Loading";
import ReviewForm from "../components/ReviewForm";
import * as menuService from "../services/menuService";
import * as reviewService from "../services/reviewService";

const homeStyles = `
  .home-modern {
    background: #fff;
  }

  .home-hero {
    border-bottom: 1px solid #e2e2e2;
  }

  .home-hero-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 42px 16px 36px;
    display: grid;
    grid-template-columns: 1.35fr 0.65fr;
    gap: 28px;
    align-items: center;
  }

  .home-eyebrow {
    display: inline-block;
    margin-bottom: 7px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.1px;
    text-transform: uppercase;
  }

  .home-hero-copy h1 {
    margin: 0;
    font-size: 38px;
    line-height: 1.08;
  }

  .home-hero-copy h1 em {
    font-style: normal;
  }

  .home-hero-sub {
    max-width: 670px;
    margin: 15px 0 17px;
    font-size: 14px;
    line-height: 1.65;
  }

  .home-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .home-actions .btn {
    font-size: 13px;
  }

  .home-hours {
    margin-top: 13px;
    font-size: 12px;
    opacity: 0.75;
  }

  .home-hero-visual {
    min-height: 205px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dedede;
    border-radius: 14px;
    background: #fafafa;
  }

  .home-plate {
    font-size: 78px;
    line-height: 1;
  }

  .home-chip {
    position: absolute;
    padding: 7px 9px;
    border: 1px solid #d8d8d8;
    border-radius: 7px;
    background: #fff;
    font-size: 11px;
    font-weight: 600;
  }

  .home-chip-1 {
    left: 10px;
    bottom: 12px;
  }

  .home-chip-2 {
    right: 10px;
    top: 12px;
  }

  .home-section {
    padding: 30px 0;
  }

  .home-section-alt {
    background: #fafafa;
    border-top: 1px solid #ededed;
    border-bottom: 1px solid #ededed;
  }

  .home-container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .home-section-heading {
    margin-bottom: 15px;
  }

  .home-section-heading h2,
  .home-story h2 {
    margin: 0;
    font-size: 22px;
    line-height: 1.3;
  }

  .home-intro {
    max-width: 800px;
    margin: 10px 0 0;
    font-size: 14px;
    line-height: 1.65;
  }

  .home-menu-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .home-offer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 17px;
    border: 1px solid #dedede;
    border-radius: 11px;
    background: #fff;
  }

  .home-offer h2 {
    margin: 0 0 5px;
    font-size: 19px;
  }

  .home-offer p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
  }

  .home-review-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .home-review-card {
    padding: 14px;
    border: 1px solid #dedede;
    border-radius: 10px;
    background: #fff;
  }

  .home-stars {
    margin-bottom: 7px;
    font-size: 14px;
    letter-spacing: 1px;
  }

  .home-review-card p {
    margin: 0 0 9px;
    font-size: 13px;
    line-height: 1.55;
  }

  .home-review-name {
    font-size: 12px;
    font-weight: 600;
  }

  .home-review-empty {
    margin: 0;
    font-size: 13px;
  }

  .home-review-form {
    margin-top: 16px;
  }

  .home-contact-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 16px 17px;
    border: 1px solid #dedede;
    border-radius: 11px;
  }

  .home-contact-strip h3 {
    margin: 0 0 5px;
    font-size: 16px;
  }

  .home-contact-strip p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 900px) {
    .home-hero-inner {
      grid-template-columns: 1fr;
      padding-top: 30px;
    }

    .home-hero-visual {
      min-height: 150px;
    }

    .home-menu-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 700px) {
    .home-hero-inner {
      padding: 24px 12px 28px;
    }

    .home-hero-copy h1 {
      font-size: 29px;
    }

    .home-section {
      padding: 24px 0;
    }

    .home-container {
      padding: 0 12px;
    }

    .home-menu-grid,
    .home-review-grid {
      grid-template-columns: 1fr;
    }

    .home-offer,
    .home-contact-strip {
      align-items: flex-start;
      flex-direction: column;
    }

    .home-offer h2 {
      font-size: 17px;
    }
  }
`;

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      menuService.fetchMenuItems(),
      reviewService.fetchReviews().catch(() => []),
    ])
      .then(([items, revs]) => {
        setPopular(items.slice(0, 4));
        setReviews(revs.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{homeStyles}</style>

      <div className="home-modern">
        <section className="home-hero">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <span className="home-eyebrow">
                Est. in a home kitchen, grown into a garden
              </span>

              <h1>
                Bold spices.
                <br />
                Honest cooking.
                <br />
                <em>Delivered warm.</em>
              </h1>

              <p className="home-hero-sub">
                Spice Garden brings authentic Indian and Indo-Chinese dishes to your table —
                slow-simmered gravies, tandoor-charred tikkas, and wok-tossed favorites made
                to order, every single day.
              </p>

              <div className="home-actions">
                <Link to="/menu" className="btn btn-primary">Order Now</Link>
                <Link to="/menu" className="btn btn-outline">View Menu</Link>
              </div>

              <div className="home-hours">
                🕒 Open daily, 11:00 AM – 11:00 PM
              </div>
            </div>

            <div className="home-hero-visual">
              <div className="home-plate">🍛</div>
              <div className="home-chip home-chip-1">🌶️ Fresh spice blends</div>
              <div className="home-chip home-chip-2">🔥 Tandoor-fired</div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-container home-story">
            <span className="home-eyebrow">Our story</span>
            <h2>A family kitchen, grown up</h2>
            <p className="home-intro">
              What started as weekend cooking for neighbors is now Spice Garden — a
              family-run restaurant serving Indian and Indo-Chinese comfort food, made with
              fresh ingredients and spices we grind ourselves. Every dish is cooked to order,
              never rushed.
            </p>
          </div>
        </section>

        <section className="home-section home-section-alt">
          <div className="home-container">
            <div className="home-section-heading">
              <span className="home-eyebrow">Fan favourites</span>
              <h2>Popular dishes</h2>
            </div>

            {loading ? (
              <Loading />
            ) : (
              <div className="home-menu-grid">
                {popular.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="home-section">
          <div className="home-container">
            <div className="home-offer">
              <div>
                <span className="home-eyebrow">Special offer</span>
                <h2>Free delivery on your first order</h2>
                <p>
                  Use code <strong>SPICE50</strong> and get flat ₹50 off orders above ₹300.
                </p>
              </div>

              <Link to="/menu" className="btn btn-secondary">Claim Offer</Link>
            </div>
          </div>
        </section>

        <section className="home-section home-section-alt">
          <div className="home-container">
            <div className="home-section-heading">
              <span className="home-eyebrow">What guests say</span>
              <h2>Customer reviews</h2>
            </div>

            {reviews.length > 0 ? (
              <div className="home-review-grid">
                {reviews.map((r) => (
                  <div key={r.id} className="home-review-card">
                    <div className="home-stars">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                    <p>"{r.comment}"</p>
                    <span className="home-review-name">— {r.customer_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <p className="home-review-empty">
                  Be the first to share your experience.
                </p>
              )
            )}

            <div className="home-review-form">
              <ReviewForm
                onSubmitted={(r) =>
                  setReviews((prev) => [r, ...prev].slice(0, 3))
                }
              />
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-container">
            <div className="home-contact-strip">
              <div>
                <h3>Visit or order in</h3>
                <p>
                  14 Marigold Lane, Mahesana, Gujarat · +91 98765 43210
                </p>
              </div>

              <Link to="/contact" className="btn btn-outline">
                Get Directions
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

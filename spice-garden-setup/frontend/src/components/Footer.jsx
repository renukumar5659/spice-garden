import { Link } from "react-router-dom";

const footerStyles = `
  .footer-modern {
    margin-top: 36px;
    background: #fafafa;
    border-top: 1px solid #dedede;
  }

  .footer-modern-grid {
    max-width: 1120px;
    margin: 0 auto;
    padding: 28px 16px 24px;
    display: grid;
    grid-template-columns: 1.5fr repeat(3, 1fr);
    gap: 24px;
  }

  .footer-modern-brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 9px;
  }

  .footer-modern-mark {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d5d5d5;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
  }

  .footer-modern-name {
    font-size: 16px;
    font-weight: 700;
  }

  .footer-modern-tag {
    max-width: 290px;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    opacity: 0.75;
  }

  .footer-modern-column h4 {
    margin: 0 0 9px;
    font-size: 13px;
  }

  .footer-modern-column a {
    display: block;
    width: fit-content;
    margin: 0 0 7px;
    font-size: 12px;
    line-height: 1.4;
  }

  .footer-modern-column a:hover {
    text-decoration: underline;
  }

  .footer-modern-column p {
    margin: 0 0 7px;
    font-size: 12px;
    line-height: 1.45;
  }

  .footer-modern-bottom {
    border-top: 1px solid #e1e1e1;
  }

  .footer-modern-bottom-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 12px 16px;
  }

  .footer-modern-bottom p {
    margin: 0;
    font-size: 11px;
    text-align: center;
    opacity: 0.7;
  }

  @media (max-width: 760px) {
    .footer-modern-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px 16px;
      padding: 24px 12px 20px;
    }

    .footer-modern-brand-block {
      grid-column: 1 / -1;
    }

    .footer-modern-bottom-inner {
      padding: 11px 12px;
    }
  }

  @media (max-width: 460px) {
    .footer-modern-grid {
      grid-template-columns: 1fr;
    }

    .footer-modern-brand-block {
      grid-column: auto;
    }
  }
`;

export default function Footer() {
  return (
    <>
      <style>{footerStyles}</style>

      <footer className="footer-modern">
        <div className="footer-modern-grid">
          <div className="footer-modern-brand-block">
            <div className="footer-modern-brand">
              <span className="footer-modern-mark">SG</span>
              <span className="footer-modern-name">Spice Garden</span>
            </div>

            <p className="footer-modern-tag">
              Family-friendly Indian &amp; Indo-Chinese kitchen, cooked fresh,
              delivered warm.
            </p>
          </div>

          <div className="footer-modern-column">
            <h4>Explore</h4>
            <Link to="/menu">Menu</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-modern-column">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/orders">Track Order</Link>
          </div>

          <div className="footer-modern-column">
            <h4>Visit Us</h4>
            <p>14 Marigold Lane, Mahesana, Gujarat</p>
            <p>+91 98765 43210</p>
            <p>hello@spicegarden.example</p>
            <p>11:00 AM – 11:00 PM, all week</p>
          </div>
        </div>

        <div className="footer-modern-bottom">
          <div className="footer-modern-bottom-inner">
            <p>
              © {new Date().getFullYear()} Spice Garden Restaurant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

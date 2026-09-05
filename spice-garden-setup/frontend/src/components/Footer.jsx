import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">SG</span>
            <span className="brand-name">Spice Garden</span>
          </div>
          <p className="footer-tag">
            Family-friendly Indian &amp; Indo-Chinese kitchen, cooked fresh, delivered warm.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/menu">Menu</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/orders">Track Order</Link>
        </div>
        <div>
          <h4>Visit Us</h4>
          <p>14 Marigold Lane, Mahesana, Gujarat</p>
          <p>+91 98765 43210</p>
          <p>hello@spicegarden.example</p>
          <p>11:00 AM – 11:00 PM, all week</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Spice Garden Restaurant. All rights reserved.</p>
      </div>
    </footer>
  );
}

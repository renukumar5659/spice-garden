import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">SG</span>
          <span className="brand-name">Spice Garden</span>
        </Link>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className="nav-link" onClick={() => setOpen(false)}>
              Admin
            </NavLink>
          )}

          <div className="nav-auth">
            {isAuthenticated ? (
              <>
                <NavLink to="/orders" className="nav-link" onClick={() => setOpen(false)}>
                  My Orders
                </NavLink>
                <NavLink to="/profile" className="nav-link" onClick={() => setOpen(false)}>
                  {user?.first_name || "Profile"}
                </NavLink>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link" onClick={() => setOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </nav>

        <div className="navbar-right">
          <Link to="/cart" className="cart-pill" aria-label="View cart">
            🛒
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
          <button className="hamburger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}

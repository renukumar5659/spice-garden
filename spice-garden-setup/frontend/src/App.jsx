import { Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import FoodDetail from "./pages/FoodDetail";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

// Admin pages
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminOrders from "./pages/admin/AdminOrders";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Navbar />

          <main>
            <Routes>

              {/* =========================
                  PUBLIC PAGES
              ========================== */}

              <Route path="/" element={<Home />} />

              <Route
                path="/menu"
                element={<Menu />}
              />

              <Route
                path="/menu/:id"
                element={<FoodDetail />}
              />

              <Route
                path="/cart"
                element={<Cart />}
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/contact"
                element={<Contact />}
              />

              {/* =========================
                  AUTHENTICATION
              ========================== */}

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />

              {/* =========================
                  PROTECTED CUSTOMER PAGES
              ========================== */}

              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/order-confirmation/:id"
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* =========================
                  ADMIN
              ========================== */}

              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                {/* Admin Dashboard */}
                <Route
                  index
                  element={<AdminDashboard />}
                />

                {/* Menu Management */}
                <Route
                  path="menu"
                  element={<AdminMenu />}
                />

                {/* Order Management */}
                <Route
                  path="orders"
                  element={<AdminOrders />}
                />

                {/* Order Analytics */}
                <Route
                  path="analytics"
                  element={<AdminAnalytics />}
                />

                {/* Customer Management */}
                <Route
                  path="customers"
                  element={<AdminCustomers />}
                />
              </Route>

              {/* =========================
                  404
              ========================== */}

              <Route
                path="*"
                element={<NotFound />}
              />

            </Routes>
          </main>

          <Footer />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
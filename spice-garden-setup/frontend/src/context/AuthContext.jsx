import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "sg_cart";

export const DELIVERY_CHARGE = 40;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Clear cart immediately when user logs out
  useEffect(() => {
    function handleLogout() {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
    }

    window.addEventListener("sg_logout", handleLogout);

    return () => {
      window.removeEventListener("sg_logout", handleLogout);
    };
  }, []);

  function addItem(menuItem, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);

      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          image: menuItem.image,
          is_veg: menuItem.is_veg,
          quantity,
        },
      ];
    });
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity } : i
      )
    );
  }

  function clearCart() {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const total = items.length
    ? subtotal + DELIVERY_CHARGE
    : 0;

  const itemCount = items.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryCharge: items.length ? DELIVERY_CHARGE : 0,
    total,
    itemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return ctx;
}

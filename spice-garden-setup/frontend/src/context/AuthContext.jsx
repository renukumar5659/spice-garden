import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "sg_cart";

export const DELIVERY_CHARGE = 40;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Save cart whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage errors
    }
  }, [items]);

  // Clear cart immediately when user logs out
  useEffect(() => {
    function handleLogout() {
      setItems([]);

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore localStorage errors
      }
    }

    window.addEventListener("sg_logout", handleLogout);

    return () => {
      window.removeEventListener("sg_logout", handleLogout);
    };
  }, []);

  function addItem(menuItem, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.id === menuItem.id
      );

      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
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
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryCharge = items.length
    ? DELIVERY_CHARGE
    : 0;

  const total = items.length
    ? subtotal + DELIVERY_CHARGE
    : 0;

  const itemCount = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity),
    0
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryCharge,
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
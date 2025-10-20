import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart_v1", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // helper to compare item identity (id + selectedSize)
  const itemKey = (item) => `${item.id}::${item.selectedSize ?? "default"}`;
  const findIndex = (id, selectedSize) =>
    (cart || []).findIndex((i) => i.id === id && (i.selectedSize ?? "default") === (selectedSize ?? "default"));

  const addItem = (item) => {
    // item: { id, title, price, imageUrls, quantity, selectedSize }
    setCart((prev = []) => {
      const idx = prev.findIndex((p) => p.id === item.id && (p.selectedSize ?? "default") === (item.selectedSize ?? "default"));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 1) + (item.quantity || 1) };
        return copy;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeItem = (id, selectedSize) => {
    setCart((prev = []) => prev.filter((p) => !(p.id === id && ((selectedSize ?? null) == null || (p.selectedSize ?? "default") === (selectedSize ?? "default")))));
  };

  const updateQuantity = (id, selectedSize, quantity) => {
    setCart((prev = []) =>
      prev.map((p) =>
        p.id === id && (p.selectedSize ?? "default") === (selectedSize ?? "default") ? { ...p, quantity: Math.max(1, Number(quantity || 1)) } : p
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartItemsCount = () => (cart || []).reduce((s, p) => s + (p.quantity || 0), 0);

  const getCartTotal = () => (cart || []).reduce((s, p) => s + (Number(p.price || 0) * (p.quantity || 0)), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCartItemsCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
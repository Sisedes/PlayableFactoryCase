"use client";
import React, { createContext, useContext, useState } from "react";

interface CartModalContextType {
  isCartModalOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;
  refreshCart: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(
  undefined
);

export const useCartModalContext = () => {
  const context = useContext(CartModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
};

export const CartModalProvider = ({ children }) => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const openCartModal = () => {
    setIsCartModalOpen(true);
  };

  const closeCartModal = () => {
    setIsCartModalOpen(false);
  };

  const refreshCart = () => {
    // Bu fonksiyon sepet yenileme işlemini tetikleyecek
    // Custom event ile sepet yenileme işlemini tetikleyeceğiz
    window.dispatchEvent(new CustomEvent('refreshCart'));
  };

  return (
    <CartModalContext.Provider
      value={{ isCartModalOpen, openCartModal, closeCartModal, refreshCart }}
    >
      {children}
    </CartModalContext.Provider>
  );
};

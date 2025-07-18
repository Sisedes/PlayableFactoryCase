"use client"
import React, { createContext, useContext, useState } from "react";
import { Product } from "@/types";

interface ModalContextType {
  isOpen: boolean;
  product: Product | null;
  openModal: (product: Product) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const openModal = (productData: Product) => {
    setProduct(productData);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setProduct(null);
  };

  return (
    <ModalContext.Provider value={{ isOpen, product, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}; 
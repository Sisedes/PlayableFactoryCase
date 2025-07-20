"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import ErrorBoundary from "@/components/Common/ErrorBoundary";
import { useAuthStore } from "@/store/authStore";
import AuthDebug from "@/components/AuthDebug";
import "@/utils/clearAuth";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const stopTokenValidation = useAuthStore((state) => state.stopTokenValidation);

  useEffect(() => {
    initializeAuth();
    
    setTimeout(() => setLoading(false), 1000);

    // Cleanup function - component unmount olduğunda timer'ları temizle
    return () => {
      stopTokenValidation();
    };
  }, [initializeAuth, stopTokenValidation]);

  return (
    <ErrorBoundary>
      {loading ? (
        <PreLoader />
      ) : (
        <>
          <ReduxProvider>
            <CartModalProvider>
              <ModalProvider>
                <PreviewSliderProvider>
                  <Header />
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>

                  <QuickViewModal />
                  <CartSidebarModal />
                  <PreviewSliderModal />
                </PreviewSliderProvider>
              </ModalProvider>
            </CartModalProvider>
          </ReduxProvider>
          <ScrollToTop />
          <Footer />
          {/* <AuthDebug /> */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </>
      )}
    </ErrorBoundary>
  );
} 
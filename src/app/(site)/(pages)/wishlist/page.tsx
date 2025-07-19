"use client";
import React, { useEffect } from "react";
import { Wishlist } from "@/components/Wishlist";
import { useAuth } from "@/store/authStore";
import { useRouter } from "next/navigation";

const WishlistPage = () => {
  const { isAuthenticated, accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      router.push('/signin?returnTo=/wishlist');
    }
  }, [isAuthenticated, accessToken, router]);

  if (!isAuthenticated || !accessToken) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;

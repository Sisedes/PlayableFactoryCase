"use client";

import MyAccount from "@/components/MyAccount";
import ErrorBoundary from "@/components/Common/ErrorBoundary";
import { useAuth } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const MyAccountPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main>
      <ErrorBoundary preserveAuth={true}>
        <MyAccount />
      </ErrorBoundary>
    </main>
  );
};

export default MyAccountPage;

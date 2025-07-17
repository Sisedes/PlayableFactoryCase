"use client";
import { useAuth } from "@/store/authStore";
import { useEffect, useState } from "react";

const AuthDebug = () => {
  const { user, isAuthenticated, accessToken, isLoading } = useAuth();
  const [localToken, setLocalToken] = useState<string | null>(null);
  const [cookieToken, setCookieToken] = useState<string | null>(null);

  useEffect(() => {
    // LocalStorage token'ını kontrol et
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      setLocalToken(storedToken);
      
      // Cookie token'ını kontrol et
      const tokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='));
      setCookieToken(tokenCookie ? tokenCookie.split('=')[1] : null);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>
        <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
        <p>isLoading: {isLoading ? 'true' : 'false'}</p>
        <p>User: {user ? `${user.firstName} (${user.role})` : 'null'}</p>
        <p>Store Token: {accessToken ? 'exists' : 'null'}</p>
        <p>LocalStorage Token: {localToken ? 'exists' : 'null'}</p>
        <p>Cookie Token: {cookieToken ? 'exists' : 'null'}</p>
      </div>
    </div>
  );
};

export default AuthDebug; 
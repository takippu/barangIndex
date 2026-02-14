"use client";

import React, { useEffect, useState } from "react";
import { AppBottomNav } from "./AppBottomNav";

interface ClientBottomNavProps {
  forceShow?: boolean;
}

export const ClientBottomNav: React.FC<ClientBottomNavProps> = ({ forceShow = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/v1/auth/session", {
          credentials: "include",
        });
        const data = await res.json();
        setIsAuthenticated(!!data.data?.user);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show nothing while checking (prevents flash)
  if (isAuthenticated === null) return null;

  // Show bottom nav only if authenticated or forced
  if (!isAuthenticated && !forceShow) return null;

  return <AppBottomNav />;
};

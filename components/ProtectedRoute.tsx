// components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect AFTER we've finished checking localStorage.
    // If we redirected while isLoading is still true, we'd wrongly kick out
    // users who ARE logged in but whose session just hasn't loaded yet.
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // While checking, or while redirecting, show a loader instead of a flash
  // of the protected page content.
  if (isLoading || !isAuthenticated) {
    return <Loader/>;
  }

  return <>{children}</>;
}
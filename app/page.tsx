// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // wait until we know for sure
    router.replace(isAuthenticated ? "/products" : "/login");
  }, [isLoading, isAuthenticated, router]);

  return <Loader />;
}
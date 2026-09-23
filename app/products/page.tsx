// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, Product } from "@/lib/products";
import { useAuth } from "@/context/AuthContext";

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout, user } = useAuth();

  async function loadProducts() {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchProducts({ limit: 20, skip: 0 });
      setProducts(data.products);
    } catch {
  setError("Failed to load products.");
} finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch from the API on mount; no data-fetching library is allowed per the assignment
  loadProducts();
}, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-gray-600">Hi, {user.firstName}</span>}
          <button
            onClick={logout}
            className="text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </div>

      {isLoading && <Loader />}
      {!isLoading && error && <ErrorState message={error} onRetry={loadProducts} />}
      {!isLoading && !error && products.length === 0 && <EmptyState />}
      {!isLoading && !error && products.length > 0 && (
        <>
          {/* Table on desktop (md and up), hidden on small screens */}
          <div className="hidden md:block overflow-x-auto">
            <ProductTable products={products} />
          </div>
          {/* Cards on mobile, hidden on md and up */}
          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <ProductsPageContent />
    </ProtectedRoute>
  );
}
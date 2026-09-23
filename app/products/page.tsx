// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { fetchProducts, Product } from "@/lib/products";
import { useAuth } from "@/context/AuthContext";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { Suspense } from "react";

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout, user } = useAuth();
  const { query, setQuery } = useProductsQuery();

  async function loadProducts() {
    setIsLoading(true);
    setError("");
    try {
      const skip = (query.page - 1) * query.limit;
      const data = await fetchProducts({
        limit: query.limit,
        skip,
        sortBy: query.sortBy || undefined,
        order: query.order,
        category: query.category || undefined,
      });
      setProducts(data.products);
      setTotal(data.total);

      // Guard: if ?page=999 points past the last real page (now that we
      // know `total`), snap back to the last valid page instead of
      // showing a permanently empty screen.
      const totalPages = Math.max(1, Math.ceil(data.total / query.limit));
      if (query.page > totalPages) {
        setQuery({ page: totalPages });
      }
    } catch {
      setError("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetching from the API whenever the URL query state changes; required since we can't use a data-fetching library
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadProducts is redefined each render but only reads query/setQuery, both already listed
  }, [query.page, query.limit, query.sortBy, query.order, query.category]);

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
          <div className="hidden md:block overflow-x-auto">
            <ProductTable products={products} />
          </div>
          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <Pagination
            page={query.page}
            limit={query.limit}
            total={total}
            onPageChange={(page) => setQuery({ page })}
            onLimitChange={(limit) => setQuery({ limit, page: 1 })}
          />
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loader />}>
        <ProductsPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
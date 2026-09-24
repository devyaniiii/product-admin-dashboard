// app/products/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import FilterSortBar from "@/components/FilterSortBar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { fetchProducts, searchProducts, deleteProduct, Product } from "@/lib/products";
import { useAuth } from "@/context/AuthContext";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { useDebounce } from "@/hooks/useDebounce";
import {
  applyOverlay,
  getCreatedProducts,
  addDeletedId,
  isLocallyCreated,
  removeCreatedProduct,
} from "@/lib/localOverlay";

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout, user } = useAuth();
  const { query, setQuery } = useProductsQuery();

  const debouncedSearch = useDebounce(query.search, 400);
  const requestIdRef = useRef(0);

  const loadProducts = useCallback(async () => {
    const thisRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError("");
    try {
      const skip = (query.page - 1) * query.limit;

      let data;
      if (debouncedSearch.trim()) {
        data = await searchProducts(debouncedSearch.trim(), {
          limit: query.limit,
          skip,
        });

        if (query.sortBy) {
          const dir = query.order === "desc" ? -1 : 1;
          data = {
            ...data,
            products: [...data.products].sort((a, b) => {
              const field = query.sortBy as "price" | "rating" | "title";
              if (typeof a[field] === "string") {
                return dir * String(a[field]).localeCompare(String(b[field]));
              }
              return dir * ((a[field] as number) - (b[field] as number));
            }),
          };
        }
      } else {
        data = await fetchProducts({
          limit: query.limit,
          skip,
          sortBy: query.sortBy || undefined,
          order: query.order,
          category: query.category || undefined,
        });
      }

      if (thisRequestId !== requestIdRef.current) return;

      const merged = applyOverlay(data.products, data.total);
      let finalProducts = merged.products;
      const finalTotal = merged.total;

      const isDefaultView = !debouncedSearch.trim() && !query.category;
      if (isDefaultView && query.page === 1) {
        const created = getCreatedProducts();
        finalProducts = [...created, ...finalProducts].slice(0, query.limit);
      }

      setProducts(finalProducts);
      setTotal(finalTotal);

      const totalPages = Math.max(1, Math.ceil(finalTotal / query.limit));
      if (query.page > totalPages) {
        setQuery({ page: totalPages });
      }
    } catch {
      if (thisRequestId !== requestIdRef.current) return;
      setError("Failed to load products.");
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [query.page, query.limit, query.sortBy, query.order, query.category, debouncedSearch, setQuery]);

   useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadProducts is wrapped in useCallback and calls setState internally; refetches on URL/debounced-search change, not state-syncing
    loadProducts();
  }, [loadProducts]);

  function handleSearchChange(value: string) {
    setQuery({ search: value, page: 1 });
  }

  function handleCategoryChange(category: string) {
    setQuery({ category, page: 1 });
  }

  function handleSortChange(sortBy: string, order: "asc" | "desc") {
    setQuery({ sortBy, order, page: 1 });
  }

  async function handleDelete() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      if (isLocallyCreated(deleteTarget.id)) {
        removeCreatedProduct(deleteTarget.id);
      } else {
        await deleteProduct(deleteTarget.id);
        addDeletedId(deleteTarget.id);
      }
      setDeleteTarget(null);
      loadProducts();
    } catch {
      setError("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

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

      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar initialValue={query.search} onSearch={handleSearchChange} />
        <FilterSortBar
          category={query.category}
          sortBy={query.sortBy}
          order={query.order}
          searchActive={!!debouncedSearch.trim()}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
        />
      </div>

      {isLoading && <Loader />}
      {!isLoading && error && <ErrorState message={error} onRetry={loadProducts} />}
      {!isLoading && !error && products.length === 0 && (
        <EmptyState
          message={query.search ? `No products found for "${query.search}".` : "No products found."}
        />
      )}
      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto">
            <ProductTable products={products} onDeleteClick={setDeleteTarget} />
          </div>
          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onDeleteClick={setDeleteTarget} />
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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
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
// app/products/page.tsx
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import { fetchProducts, searchProducts, Product } from "@/lib/products";
import { useAuth } from "@/context/AuthContext";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { useDebounce } from "@/hooks/useDebounce";
import FilterSortBar from "@/components/FilterSortBar";
import { applyOverlay, getCreatedProducts } from "@/lib/localOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";
import { deleteProduct } from "@/lib/products";
import { addDeletedId, isLocallyCreated, removeCreatedProduct } from "@/lib/localOverlay";

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout, user } = useAuth();
  const { query, setQuery } = useProductsQuery();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

  // Debounce the search term coming from the URL. We don't debounce the
  // URL write itself (that happens instantly, per requirement: "keep
  // search in the URL") — we debounce WHEN we act on it for the API call.
  const debouncedSearch = useDebounce(query.search, 400);

  // The race-condition guard: every time we start a new fetch, we bump
  // this counter and remember "this fetch's number". When the response
  // comes back, we only apply it if no NEWER fetch has started since.
  // A ref (not state) is correct here because we need the LATEST value
  // synchronously inside async callbacks, without triggering re-renders.
  const requestIdRef = useRef(0);

  async function loadProducts() {
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

  
  // The search endpoint doesn't support server-side sorting, so if the
  // user has a sort selected, we sort just this page's results client-side.
  // This is a deliberate, documented limitation: it only sorts within the
  // current page, not across the full search result set, since we only
  // ever fetch one page of data at a time (true full-dataset sorting
  // would require fetching everything, which defeats pagination).
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

      // THE GUARD: if a newer request has started since this one began,
      // this response is stale — discard it silently. This is what
      // guarantees "old search results must never replace new ones",
      // regardless of network timing/order.
      if (thisRequestId !== requestIdRef.current) return;

      // Merge our local overlay (edits/deletes) on top of the API's
      // response for this page. Locally-created products only get
      // prepended on page 1 of the default, unfiltered, unsearched
      // view — they aren't really part of DummyJSON's pagination, so
      // showing them on every page would be confusing and would break
      // the "Showing X-Y of Z" math.
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
      if (thisRequestId !== requestIdRef.current) return; // stale error too
      setError("Failed to load products.");
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on URL/debounced-search change; no data-fetching library allowed
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadProducts reads query/debouncedSearch, both listed below
  }, [query.page, query.limit, query.sortBy, query.order, query.category, debouncedSearch]);

  function handleSearchChange(value: string) {
    // Write to the URL immediately (so the URL always reflects exactly
    // what's typed), and reset to page 1 — a NEW search should never
    // stay on, say, page 5 of the old result set.
    setQuery({ search: value, page: 1 });
  }
  function handleCategoryChange(category: string) {
  setQuery({ category, page: 1 });
}

function handleSortChange(sortBy: string, order: "asc" | "desc") {
  setQuery({ sortBy, order, page: 1 });
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
// hooks/useProductsQuery.ts
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface ProductsQueryState {
  page: number;
  limit: number;
  search: string;
  category: string; // "" means "all categories"
  sortBy: string;    // "" | "price" | "rating" | "title"
  order: "asc" | "desc";
}

const ALLOWED_LIMITS = [10, 20, 50];
const ALLOWED_SORT_FIELDS = ["price", "rating", "title", ""];
const ALLOWED_ORDERS = ["asc", "desc"];
const DEFAULT_LIMIT = 20;

// Turns a raw URL string into a safe positive integer, or a fallback.
// Handles ?page=abc, ?page=-5, ?page=3.7, missing param, etc.
function parseIntSafe(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

export function useProductsQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse + validate everything from the URL on every render.
  // useMemo avoids recalculating this object identity unless the actual
  // URL params changed, which matters because this object feeds a
  // useEffect dependency array elsewhere (Step 7) — an unstable object
  // reference there would cause an infinite fetch loop.
  const query: ProductsQueryState = useMemo(() => {
    const rawLimit = parseIntSafe(searchParams.get("limit"), DEFAULT_LIMIT);
    const limit = ALLOWED_LIMITS.includes(rawLimit) ? rawLimit : DEFAULT_LIMIT;

    const page = parseIntSafe(searchParams.get("page"), 1);
    // Note: we can't clamp "page too high" here yet, because we don't know
    // the total product count until AFTER the API responds. The page
    // component (Step 6.4) clamps it down once it knows `total`.

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const rawSortBy = searchParams.get("sortBy") || "";
    const sortBy = ALLOWED_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : "";

    const rawOrder = searchParams.get("order") || "asc";
    const order = (ALLOWED_ORDERS.includes(rawOrder) ? rawOrder : "asc") as "asc" | "desc";

    return { page, limit, search, category, sortBy, order };
  }, [searchParams]);

  // Merges partial changes into the URL. Any field you don't pass stays
  // as-is. Pages using this never construct URLSearchParams by hand.
  const setQuery = useCallback(
    (changes: Partial<ProductsQueryState>) => {
      const params = new URLSearchParams(searchParams.toString());

      const next = { ...query, ...changes };

      // Write every field back into the URL. We always include all of
      // them (rather than omitting defaults) so a shared link is fully
      // self-describing regardless of what the user changed.
      params.set("page", String(next.page));
      params.set("limit", String(next.limit));
      if (next.search) params.set("search", next.search);
      else params.delete("search");
      if (next.category) params.set("category", next.category);
      else params.delete("category");
      if (next.sortBy) params.set("sortBy", next.sortBy);
      else params.delete("sortBy");
      params.set("order", next.order);

      router.push(`${pathname}?${params.toString()}`);
    },
    [query, searchParams, router, pathname]
  );

  return { query, setQuery };
}
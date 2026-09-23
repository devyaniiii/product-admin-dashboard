// components/FilterSortBar.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/products";

interface FilterSortBarProps {
  category: string;
  sortBy: string;
  order: "asc" | "desc";
  searchActive: boolean; // true when a search term is currently applied
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: string, order: "asc" | "desc") => void;
}

export default function FilterSortBar({
  category,
  sortBy,
  order,
  searchActive,
  onCategoryChange,
  onSortChange,
}: FilterSortBarProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch {
        // Non-critical: if categories fail to load, the dropdown is just
        // empty. We don't block the whole page with an error state for
        // this — the product list itself still works fine.
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // sortBy + order are combined into one dropdown value like "price-asc"
  // for a simpler single control, then split back apart on change.
  const sortValue = sortBy ? `${sortBy}-${order}` : "";

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val) {
      onSortChange("", "asc");
      return;
    }
    const [field, dir] = val.split("-");
    onSortChange(field, dir as "asc" | "desc");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={searchActive}
          title={
            searchActive
              ? "Category filter is disabled while searching (the API doesn't support both at once)"
              : undefined
          }
          className="border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {loadingCategories && (
          <span className="text-xs text-gray-400 ml-2">Loading categories…</span>
        )}
      </div>

      <select
        value={sortValue}
        onChange={handleSortChange}
        className="border rounded px-3 py-2"
      >
        <option value="">Sort by...</option>
        <option value="title-asc">Title (A–Z)</option>
        <option value="title-desc">Title (Z–A)</option>
        <option value="price-asc">Price (Low to High)</option>
        <option value="price-desc">Price (High to Low)</option>
        <option value="rating-asc">Rating (Low to High)</option>
        <option value="rating-desc">Rating (High to Low)</option>
      </select>

      {searchActive && (
        <p className="text-xs text-amber-600 self-center">
          Category filter is disabled while a search is active.
        </p>
      )}
    </div>
  );
}
// app/products/new/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductForm, { ProductFormValues } from "@/components/ProductForm";
import { createProduct, fetchCategories } from "@/lib/products";
import { addCreatedProduct } from "@/lib/localOverlay";
import ErrorState from "@/components/ErrorState";
import Loader from "@/components/Loader";

function NewProductContent() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const router = useRouter();

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    setCategoriesError("");
    try {
      setCategories(await fetchCategories());
    } catch {
      setCategoriesError("Failed to load categories.");
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleSubmit(values: ProductFormValues) {
    const created = await createProduct({
      title: values.title,
      category: values.category,
      price: Number(values.price),
      stock: Number(values.stock),
      rating: values.rating ? Number(values.rating) : 0,
      description: values.description,
      thumbnail: values.thumbnail || "https://placehold.co/300x300?text=No+Image",
      images: values.thumbnail ? [values.thumbnail] : [],
    });

    addCreatedProduct(created);
    router.push("/products");
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Add Product</h1>
      {isLoadingCategories && <Loader />}
      {!isLoadingCategories && categoriesError && (
        <ErrorState message={categoriesError} onRetry={loadCategories} />
      )}
      {!isLoadingCategories && !categoriesError && (
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          submitLabel="Add Product"
        />
      )}
    </div>
  );
}

export default function NewProductPage() {
  return (
    <ProtectedRoute>
      <NewProductContent />
    </ProtectedRoute>
  );
}
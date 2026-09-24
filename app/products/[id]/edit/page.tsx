// app/products/[id]/edit/page.tsx
"use client";

import { useEffect, useState, use as usePromise, useCallback } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import ProductForm, { ProductFormValues } from "@/components/ProductForm";
import { fetchProductById, updateProduct, fetchCategories, Product } from "@/lib/products";
import { setEditedProduct, applyOverlayToSingle, getDeletedIds } from "@/lib/localOverlay";
import { AxiosError } from "axios";
import ErrorState from "@/components/ErrorState";

interface PageProps {
  params: Promise<{ id: string }>;
}

function EditProductContent({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setNotFoundFlag(false);
    try {
      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId <= 0 || getDeletedIds().includes(numericId)) {
        setNotFoundFlag(true);
        return;
      }
      const [data, cats] = await Promise.all([
        fetchProductById(numericId),
        fetchCategories(),
      ]);
      setProduct(applyOverlayToSingle(data));
      setCategories(cats);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 404) {
        setNotFoundFlag(true);
      } else {
        setError("Failed to load product for editing.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFoundFlag) notFound();
  if (isLoading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!product) return null;

  async function handleSubmit(values: ProductFormValues) {
    const numericId = Number(id);
    const changes: Partial<Product> = {
      title: values.title,
      category: values.category,
      price: Number(values.price),
      stock: Number(values.stock),
      rating: values.rating ? Number(values.rating) : 0,
      description: values.description,
      thumbnail: values.thumbnail || product!.thumbnail,
    };

    await updateProduct(numericId, changes);
    setEditedProduct(numericId, changes);

    router.push(`/products/${numericId}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>
      <ProductForm
        categories={categories}
        initialValues={{
          title: product.title,
          category: product.category,
          price: String(product.price),
          stock: String(product.stock),
          rating: String(product.rating),
          description: product.description,
          thumbnail: product.thumbnail,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = usePromise(params);
  return (
    <ProtectedRoute>
      <EditProductContent id={id} />
    </ProtectedRoute>
  );
}
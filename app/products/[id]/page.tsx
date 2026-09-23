// app/products/[id]/page.tsx
"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import { fetchProductById, Product } from "@/lib/products";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { deleteProduct } from "@/lib/products";
import { applyOverlayToSingle, getDeletedIds, getCreatedProducts, addDeletedId, isLocallyCreated, removeCreatedProduct } from "@/lib/localOverlay";
interface PageProps {
  params: Promise<{ id: string }>;
}

function ProductDetailsContent({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const router = useRouter();

  async function loadProduct() {
    setIsLoading(true);
    setError("");
    setNotFoundFlag(false);
    try {
            const numericId = Number(id);
      // Guard bad ids like /products/abc before even calling the API.
      if (!Number.isInteger(numericId) || numericId <= 0) {
        setNotFoundFlag(true);
        return;
      }

      // If this id was locally deleted, treat it as not-found even
      // though the API would still happily return it.
      if (getDeletedIds().includes(numericId)) {
        setNotFoundFlag(true);
        return;
      }

      // If this id belongs to a locally-created product (the API never
      // saw it and doesn't know about it), read it straight from the
      // overlay instead of calling the API at all.
      const created = getCreatedProducts().find((p) => p.id === numericId);
      if (created) {
        setProduct(created);
        setActiveImage(0);
        return;
      }

      const data = await fetchProductById(numericId);
      setProduct(applyOverlayToSingle(data));
      setActiveImage(0);
    } catch (err) {
      // DummyJSON returns a 404 for an id that doesn't exist.
      if (err instanceof AxiosError && err.response?.status === 404) {
        setNotFoundFlag(true);
      } else {
        setError("Failed to load product.");
      }
    } finally {
      setIsLoading(false);
    }
  }

 async function handleDelete() {
  if (isDeleting || !product) return;
  setIsDeleting(true);
  try {
    if (isLocallyCreated(product.id)) {
      // This product was never real on the server (DummyJSON just
      // echoed back a fake id when we "added" it) — there's nothing
      // to actually delete via the API, so we just remove it from
      // our own local overlay.
      removeCreatedProduct(product.id);
    } else {
      // A real API product: call the real endpoint, then mark it
      // deleted locally so it stays gone across refreshes.
      await deleteProduct(product.id);
      addDeletedId(product.id);
    }
    router.push("/products");
  } catch {
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    setError("Failed to delete product. Please try again.");
  }
}
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount / id change
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only `id` should trigger a refetch
  }, [id]);

  if (notFoundFlag) {
    // Delegates to app/not-found.tsx — Next.js's convention for a
    // proper 404 response (not just a locally-rendered message).
    notFound();
  }

  if (isLoading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={loadProduct} />;
  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Link href="/products" className="text-sm text-blue-600 hover:underline">
        ← Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        {/* Images */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images?.[activeImage] || product.thumbnail}
            alt={product.title}
            className="w-full aspect-square object-cover rounded-lg border"
          />
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 shrink-0 rounded border-2 overflow-hidden ${
                    i === activeImage ? "border-blue-600" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
          <h1 className="text-2xl font-semibold mt-1">{product.title}</h1>
          <p className="text-gray-600 mt-3">{product.description}</p>

          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="text-xl font-bold">${product.price}</span>
            <span>⭐ {product.rating}</span>
            <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

                    <div className="flex gap-3 mt-6">
            <Link
              href={`/products/${product.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">
            Reviews ({product.reviews.length})
          </h2>
          <div className="space-y-4">
            {product.reviews.map((review, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.reviewerName}</span>
                  <span className="text-sm">⭐ {review.rating}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

export default function ProductDetailsPage({ params }: PageProps) {
  // In Next.js 15+, `params` is a Promise in Client Components and must
  // be unwrapped with React's `use()` hook rather than awaited directly.
  const { id } = usePromise(params);

  return (
    <ProtectedRoute>
      <ProductDetailsContent id={id} />
    </ProtectedRoute>
  );
}
// components/ProductForm.tsx
"use client";

import { useState, FormEvent } from "react";


export interface ProductFormValues {
  title: string;
  category: string;
  price: string; // kept as string in the form, converted to number on submit
  stock: string;
  rating: string;
  description: string;
  thumbnail: string;
}

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  categories: string[];
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel: string;
}

const emptyValues: ProductFormValues = {
  title: "",
  category: "",
  price: "",
  stock: "",
  rating: "",
  description: "",
  thumbnail: "",
};

export default function ProductForm({
  initialValues,
  categories,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(v: ProductFormValues) {
    const e: Partial<Record<keyof ProductFormValues, string>> = {};

    if (!v.title.trim()) e.title = "Title is required.";
    else if (v.title.trim().length < 3) e.title = "Title must be at least 3 characters.";

    if (!v.category) e.category = "Category is required.";

    const priceNum = Number(v.price);
    if (!v.price) e.price = "Price is required.";
    else if (Number.isNaN(priceNum) || priceNum <= 0) e.price = "Price must be a positive number.";

    const stockNum = Number(v.stock);
    if (!v.stock) e.stock = "Stock is required.";
    else if (!Number.isInteger(stockNum) || stockNum < 0)
      e.stock = "Stock must be a whole number, 0 or more.";

    if (v.rating) {
      const ratingNum = Number(v.rating);
      if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)
        e.rating = "Rating must be between 0 and 5.";
    }

    if (!v.description.trim()) e.description = "Description is required.";
    else if (v.description.trim().length < 10)
      e.description = "Description must be at least 10 characters.";

    return e;
  }

  function handleChange<K extends keyof ProductFormValues>(field: K, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear that field's error as soon as the user edits it again —
    // better UX than making them re-submit to see the error go away.
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Same double-submit guard pattern as the login form (Step 4):
    // both a state check here AND a disabled button below.
    if (isSubmitting) return;

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          disabled={isSubmitting}
          className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
        />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={values.category}
          onChange={(e) => handleChange("category", e.target.value)}
          disabled={isSubmitting}
          className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={values.price}
            onChange={(e) => handleChange("price", e.target.value)}
            disabled={isSubmitting}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
          />
          {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            value={values.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            disabled={isSubmitting}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
          />
          {errors.stock && <p className="text-sm text-red-600 mt-1">{errors.stock}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rating (0–5, optional)</label>
        <input
          type="number"
          step="0.1"
          value={values.rating}
          onChange={(e) => handleChange("rating", e.target.value)}
          disabled={isSubmitting}
          className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
        />
        {errors.rating && <p className="text-sm text-red-600 mt-1">{errors.rating}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail URL (optional)</label>
        <input
          type="text"
          value={values.thumbnail}
          onChange={(e) => handleChange("thumbnail", e.target.value)}
          disabled={isSubmitting}
          placeholder="https://..."
          className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          disabled={isSubmitting}
          rows={4}
          className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-5 py-2 rounded font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
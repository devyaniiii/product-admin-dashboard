// lib/products.ts
import api from "./axios";

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  reviews?: Review[];
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

interface FetchProductsParams {
  limit: number;
  skip: number;
  sortBy?: string;   // "price" | "rating" | "title"
  order?: "asc" | "desc";
  category?: string;
}

// Plain paginated list, used when there's no active search.
export async function fetchProducts(
  params: FetchProductsParams
): Promise<ProductsResponse> {
  const { limit, skip, sortBy, order, category } = params;

  // DummyJSON has a separate endpoint per category: /products/category/{name}
  // so we branch the URL here rather than passing category as a query param.
  const basePath = category
    ? `/products/category/${encodeURIComponent(category)}`
    : "/products";

  const response = await api.get<ProductsResponse>(basePath, {
    params: {
      limit,
      skip,
      ...(sortBy ? { sortBy, order: order || "asc" } : {}),
    },
  });
  return response.data;
}

// Search endpoint — used when the user has typed something in the search box.
// NOTE: DummyJSON's /products/search does NOT support a category filter.
// We handle that limitation explicitly in the page logic (Step 6), not here.
export async function searchProducts(
  query: string,
  params: { limit: number; skip: number }
): Promise<ProductsResponse> {
  const response = await api.get<ProductsResponse>("/products/search", {
    params: {
      q: query,
      limit: params.limit,
      skip: params.skip,
    },
  });
  return response.data;
}

export async function fetchCategories(): Promise<string[]> {
  const response = await api.get<Array<{ slug: string; name: string; url: string }>>(
    "/products/categories"
  );
  // DummyJSON returns objects like { slug, name, url }. We use the slug
  // as the value (it's what /products/category/{slug} expects) but could
  // show `name` in the dropdown label.
  return response.data.map((c) => c.slug);
}

export async function fetchProductById(id: number): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const response = await api.post<Product>("/products/add", data);
  return response.data;
}

export async function updateProduct(
  id: number,
  data: Partial<Product>
): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}
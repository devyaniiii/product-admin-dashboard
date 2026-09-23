// lib/localOverlay.ts
import { Product } from "./products";

// DummyJSON's write endpoints (add/edit/delete) don't actually persist
// data server-side. To make the app FEEL real across refreshes, we keep
// a small "overlay" of local-only changes in localStorage, and merge it
// on top of whatever the API returns. This file is the only place that
// touches this overlay, so the rest of the app doesn't need to know
// this workaround exists.

const CREATED_KEY = "overlay_created_products";
const EDITED_KEY = "overlay_edited_products";
const DELETED_KEY = "overlay_deleted_ids";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Created products (added via the Add form) ----
// Stored as a full array of Product objects, since the API doesn't
// remember them at all — we own this data entirely.
export function getCreatedProducts(): Product[] {
  return readJSON<Product[]>(CREATED_KEY, []);
}

export function addCreatedProduct(product: Product) {
  const current = getCreatedProducts();
  writeJSON(CREATED_KEY, [product, ...current]);
}

export function removeCreatedProduct(id: number) {
  const current = getCreatedProducts();
  writeJSON(CREATED_KEY, current.filter((p) => p.id !== id));
}

// Lets callers check "is this id one we created locally?" before
// deciding whether to call the real DELETE endpoint at all.
export function isLocallyCreated(id: number): boolean {
  return getCreatedProducts().some((p) => p.id === id);
}

// ---- Edited products (existing API products the user changed) ----
// Stored as a map of id -> partial changes, so we can merge them onto
// whatever the API returns for that id, without losing fields we
// didn't touch.
export function getEditedProducts(): Record<number, Partial<Product>> {
  return readJSON<Record<number, Partial<Product>>>(EDITED_KEY, {});
}

export function setEditedProduct(id: number, changes: Partial<Product>) {
  const current = getEditedProducts();
  writeJSON(EDITED_KEY, { ...current, [id]: { ...current[id], ...changes } });
}

// ---- Deleted product ids ----
// Just a list of ids to hide, since the API "deletes" them but they
// reappear on the next fetch (nothing was really removed server-side).
export function getDeletedIds(): number[] {
  return readJSON<number[]>(DELETED_KEY, []);
}

export function addDeletedId(id: number) {
  const current = getDeletedIds();
  if (!current.includes(id)) writeJSON(DELETED_KEY, [...current, id]);
}

// ---- The merge function every list/detail fetch runs through ----
// Applies: remove deleted, patch edited, prepend created.
// `total` is adjusted to reflect the net change so pagination math
// ("Showing X-Y of Z") stays roughly accurate.
export function applyOverlay(
  apiProducts: Product[],
  apiTotal: number
): { products: Product[]; total: number } {
  const deletedIds = getDeletedIds();
  const editedMap = getEditedProducts();
  const created = getCreatedProducts();

  const withoutDeleted = apiProducts.filter((p) => !deletedIds.includes(p.id));
  const withEdits = withoutDeleted.map((p) =>
    editedMap[p.id] ? { ...p, ...editedMap[p.id] } : p
  );

  // Only show locally-created products on page 1 of an unfiltered,
  // unsearched view — otherwise they'd confusingly appear on every
  // page since they aren't really part of the API's pagination.
  // (Handled by the caller deciding whether to pass `created` in —
  // see products page wiring below.)

  return {
    products: withEdits,
    total: apiTotal - deletedIds.length + created.length,
  };
}

export function applyOverlayToSingle(product: Product): Product {
  const deletedIds = getDeletedIds();
  if (deletedIds.includes(product.id)) {
    // Caller should treat this as not-found; we still return something
    // so TypeScript's happy, but the page will check deletedIds itself.
  }
  const editedMap = getEditedProducts();
  return editedMap[product.id] ? { ...product, ...editedMap[product.id] } : product;
}
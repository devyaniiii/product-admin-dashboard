// components/ProductCard.tsx
import { Product } from "@/lib/products";
import Link from "next/link";
interface ProductCardProps {
  product: Product;
  onDeleteClick: (product: Product) => void;
}

export default function ProductCard({ product, onDeleteClick }: ProductCardProps) {
    return (
    <div className="flex gap-3 border rounded-lg p-3 hover:bg-gray-50 relative">
      <Link href={`/products/${product.id}`} className="flex gap-3 flex-1 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-16 h-16 object-cover rounded shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{product.title}</p>
          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
          <div className="flex items-center justify-between mt-1 text-sm">
            <span className="font-semibold">${product.price}</span>
            <span>⭐ {product.rating}</span>
            <span className="text-gray-500">Stock: {product.stock}</span>
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault(); // stop the parent Link from navigating
          onDeleteClick(product);
        }}
        className="text-red-600 text-sm hover:underline self-start"
      >
        Delete
      </button>
    </div>
  );
}
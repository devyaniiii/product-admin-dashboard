// components/ProductTable.tsx
import { Product } from "@/lib/products";
import Link from "next/link";

interface ProductTableProps {
  products: Product[];
  onDeleteClick: (product: Product) => void;
}

export default function ProductTable({ products, onDeleteClick }: ProductTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
          <th className="p-3">Image</th>
          <th className="p-3">Title</th>
          <th className="p-3">Category</th>
          <th className="p-3">Price</th>
          <th className="p-3">Rating</th>
          <th className="p-3">Stock</th>
          <th className="p-3"></th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="border-b hover:bg-gray-50">
            <td className="p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-12 h-12 object-cover rounded"
              />
            </td>
            <td className="p-3">
              <Link
                href={`/products/${product.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {product.title}
              </Link>
            </td>
            <td className="p-3 capitalize text-sm text-gray-600">
              {product.category}
            </td>
            <td className="p-3">${product.price}</td>
            <td className="p-3">⭐ {product.rating}</td>
                       <td className="p-3">{product.stock}</td>
            <td className="p-3">
              <button
                onClick={() => onDeleteClick(product)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-600 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/products"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Back to Products
      </Link>
    </div>
  );
}
// components/EmptyState.tsx
export default function EmptyState({ message = "No products found." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <p className="text-lg">{message}</p>
    </div>
  );
}
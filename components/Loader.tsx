// components/Loader.tsx
export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
}
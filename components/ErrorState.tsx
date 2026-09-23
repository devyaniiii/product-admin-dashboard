// components/ErrorState.tsx
export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-red-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
}
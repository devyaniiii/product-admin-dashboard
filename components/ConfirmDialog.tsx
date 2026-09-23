// components/ConfirmDialog.tsx
"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    // The dark overlay: clicking it also cancels, which is standard
    // modal UX (an "escape hatch" outside the box itself).
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onCancel}
    >
      <div
        // Stop the click from bubbling up to the overlay above — without
        // this, clicking anywhere INSIDE the dialog would also trigger
        // the overlay's onCancel and close it.
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6"
      >
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {isConfirming ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
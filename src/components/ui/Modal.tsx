import * as React from 'react';

interface ModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({ title, description, onConfirm, onCancel, confirmLabel = "Confirm", cancelLabel = "Cancel" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-6">{description}</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

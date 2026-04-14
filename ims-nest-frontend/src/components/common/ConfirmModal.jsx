const ConfirmModal = ({
  title = "Confirm Action",
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed min-h-screen inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-lg">

        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

        <p className="text-gray-600 text-sm">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
          >
            Yes, Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

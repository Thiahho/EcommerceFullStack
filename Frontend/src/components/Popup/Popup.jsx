import React from "react";

const Popup = ({ orderPopup = false, handleOrderPopup = () => {} }) => {
  if (!orderPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Orden rápida</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Este es un ejemplo de popup. Integra aquí tu flujo de compra.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleOrderPopup}
            className="px-4 py-2 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;


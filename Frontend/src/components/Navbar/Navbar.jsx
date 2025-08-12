import React from "react";

const Navbar = ({ handleOrderPopup = () => {} }) => {
  return (
    <header className="w-full sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="font-bold text-xl">E-shop</a>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
            onClick={handleOrderPopup}
          >
            Comprar
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;


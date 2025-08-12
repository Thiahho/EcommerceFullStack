import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-10 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>
        © {new Date().getFullYear()} E-shop by TCJ. Todos los derechos reservados.
      </p>
    </footer>
  );
};

export default Footer;


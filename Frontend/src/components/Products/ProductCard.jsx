import React from "react";

const ProductCard = ({ title = "Producto", price = "$0.00" }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">{price}</p>
    </div>
  );
};

export default ProductCard;


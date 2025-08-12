import React from "react";
import Heading from "../Shared/Heading";

const Products = () => {
  const items = Array.from({ length: 6 }).map((_, idx) => ({ id: idx + 1 }));
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Heading title="Productos destacados" subtitle="Explora nuestras ofertas" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-sm"
            >
              Producto #{item.id}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;


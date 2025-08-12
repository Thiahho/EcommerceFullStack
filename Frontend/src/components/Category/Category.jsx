import React from "react";
import Heading from "../Shared/Heading";

const Category = () => {
  const cats = ["Audio", "Smartwatch", "Gaming", "Macbook", "VR", "Speakers"];
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Heading title="Categorías" subtitle="Explora por categoría" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((c) => (
            <div key={c} className="border border-gray-200 dark:border-gray-700 rounded-lg h-20 flex items-center justify-center">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;


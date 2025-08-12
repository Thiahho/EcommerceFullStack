import React from "react";
import Heading from "../Shared/Heading";

const Blogs = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Heading title="Blogs" subtitle="Últimas noticias y artículos" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <article key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Entrada {i}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Contenido de ejemplo para la tarjeta de blog.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blogs;


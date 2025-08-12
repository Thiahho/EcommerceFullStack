import React from "react";
import Heading from "../Shared/Heading";

const Services = () => {
  const services = [
    { id: 1, title: "Envío gratis" },
    { id: 2, title: "Soporte 24/7" },
    { id: 3, title: "Pago seguro" },
  ];
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Heading title="Servicios" subtitle="Lo que ofrecemos" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <h4 className="font-semibold">{s.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;


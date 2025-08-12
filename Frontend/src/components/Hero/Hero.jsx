import React from "react";
import Button from "../Shared/Button";

const Hero = ({ handleOrderPopup = () => {} }) => {
  return (
    <section className="hero-bg-color py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">
          Bienvenido a E-shop
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          Encuentra productos increíbles con descuentos únicos.
        </p>
        <Button
          text="Ordenar ahora"
          bgColor="bg-black dark:bg-white"
          textColor="text-white dark:text-black"
          handler={handleOrderPopup}
        />
      </div>
    </section>
  );
};

export default Hero;


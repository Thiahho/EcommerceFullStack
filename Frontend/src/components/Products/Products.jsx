import React, { useEffect, useRef, useState } from "react";
import Heading from "../Shared/Heading";
import ProductCard from "./ProductCard";
import useProductStore from "../../stores/productStore";

const Products = () => {
  const { 
    products, 
    isLoading, 
    error, 
    fetchProducts 
  } = useProductStore();
  
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cargar productos al montar el componente (evitar doble llamada en StrictMode)
  const loadedOnceRef = useRef(false);
  useEffect(() => {
    if (loadedOnceRef.current) return;
    loadedOnceRef.current = true;
    fetchProducts();
  }, []);

  // Manejar click en producto
  const handleProductClick = (producto) => {
    setSelectedProduct(producto);
    // Aquí puedes agregar lógica para mostrar modal de detalles
    // o navegar a página de detalle del producto
    console.log('Producto seleccionado:', producto);
  };

  // Mostrar solo los primeros 6 productos en la sección de destacados
  const featuredProducts = products.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Heading title="Productos destacados" subtitle="Explora nuestras ofertas" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Heading title="Productos destacados" subtitle="Explora nuestras ofertas" />
          <div className="text-center py-8">
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">
                Error al cargar productos: {error}
              </p>
              <button
                onClick={() => fetchProducts()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Heading title="Productos destacados" subtitle="Explora nuestras ofertas" />
        
        {featuredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No hay productos disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredProducts.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}

        {/* Botón para ver todos los productos */}
        {products.length > 6 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Ver todos los productos ({products.length})
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;


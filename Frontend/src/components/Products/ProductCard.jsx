import React from "react";
import placeholderProduct from "../../assets/product/p-1.jpg";

const ProductCard = ({ 
  producto = {},
  onProductClick = () => {},
  className = ""
}) => {
  const {
    id,
    nombre,
    descripcion,
    images,
    categoria = null,
    marca,
    // Para mostrar el precio de la primera variante disponible
    variantes = []
  } = producto;

  // Obtener el precio más bajo de las variantes
  const getMinPrice = () => {
    if (!variantes || variantes.length === 0) return "$0.00";
    
    const minPrice = Math.min(...variantes.map(v => v.precio || 0));
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(minPrice);
  };

  // Obtener imagen principal
  const getMainImage = () => {
    if (!images) return placeholderProduct;

    // Si viene una lista separada por comas, tomar la primera
    if (typeof images === 'string' && images.includes(',')) {
      const imageList = images.split(',');
      const first = imageList[0]?.trim();
      return first || placeholderProduct;
    }

    // Si parece URL absoluta o relativa
    if (typeof images === 'string' && (images.startsWith('http') || images.startsWith('/'))) {
      return images;
    }

    // Asumir base64 desde backend
    return `data:image/jpeg;base64,${images}`;
  };

  const handleClick = () => {
    onProductClick(producto);
  };

  return (
    <div 
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 
                  hover:shadow-lg transition-all duration-300 cursor-pointer 
                  hover:border-primary dark:hover:border-primary ${className}`}
      onClick={handleClick}
    >
      {/* Imagen del producto */}
      <div className="aspect-square mb-3 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
        <img
          src={getMainImage()}
          alt={nombre}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null; // evita bucle de reintentos
            e.currentTarget.src = placeholderProduct;
          }}
        />
      </div>

      {/* Información del producto */}
      <div className="space-y-2">
        {/* Categoría/Marca */}
        {(categoria?.nombre || marca) && (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {marca || categoria?.nombre}
          </p>
        )}

        {/* Nombre del producto */}
        <h4 className="font-semibold text-sm leading-tight line-clamp-2">
          {nombre}
        </h4>

        {/* Descripción */}
        {descripcion && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
            {descripcion}
          </p>
        )}

        {/* Precio */}
        <div className="flex items-center justify-between">
          <p className="text-primary font-bold text-lg">
            {getMinPrice()}
          </p>
          
          {/* Indicador de variantes */}
          {variantes && variantes.length > 1 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{variantes.length} opciones
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {variantes && variantes.length > 0 && (
          <div className="flex items-center">
            {variantes.some(v => v.stock > 0) ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                             bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ● En stock
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                             bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                ● Sin stock
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;


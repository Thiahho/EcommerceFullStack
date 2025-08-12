import React from "react";

const ProductCard = ({ 
  producto = {},
  onProductClick = () => {},
  className = ""
}) => {
  const {
    id,
    name = "Producto",
    description = "",
    images = "",
    category = "",
    brand = "",
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
    if (images) {
      const imageList = images.split(',');
      return imageList[0]?.trim() || "/placeholder-product.jpg";
    }
    return "/placeholder-product.jpg";
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
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "/placeholder-product.jpg";
          }}
        />
      </div>

      {/* Información del producto */}
      <div className="space-y-2">
        {/* Categoría/Marca */}
        {(category || brand) && (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {brand || category}
          </p>
        )}

        {/* Nombre del producto */}
        <h4 className="font-semibold text-sm leading-tight line-clamp-2">
          {name}
        </h4>

        {/* Descripción */}
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
            {description}
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


'use client'
import { useProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';

export default function ProductList() {
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (productsError || categoriesError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg font-semibold mb-4">
          Error al cargar datos
        </div>
        {productsError && <p className="text-red-500">{productsError}</p>}
        {categoriesError && <p className="text-red-500">{categoriesError}</p>}
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Categorías */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-800">{category.nombre}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Productos ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {product.imagenUrl && (
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.imagenUrl} 
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  {product.nombre}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.descripcion}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">
                    ${product.precio}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estado vacío */}
      {products.length === 0 && !productsLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}

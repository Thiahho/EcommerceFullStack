import ProductList from '@/components/ProductList';

export default function ProductsExamplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Productos del Backend
          </h1>
          <p className="text-gray-600 mt-2">
            Esta página muestra productos y categorías obtenidos directamente del backend ASP.NET Core
          </p>
        </div>
      </div>
      
      <ProductList />
    </div>
  );
}

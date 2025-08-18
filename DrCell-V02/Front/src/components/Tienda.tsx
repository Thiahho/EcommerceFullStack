import React, { useEffect, useState, useMemo } from 'react';
import { Menu, X, Filter } from 'lucide-react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import SidebarFilters from './SidebarFilters';

const Shop: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    marcas: [] as string[],
    categorias: [] as string[],
    precio: [0, 0] as [number, number],
  });
  const [rangoPrecio, setRangoPrecio] = useState<[number, number]>([0, 0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('/Productos/GetAll')
      .then(res => {
        setProductos(res.data);
        // Calcular rango de precios inicial
        const precios = res.data.flatMap((p: any) => p.variantes?.map((v: any) => v.precio) || []);
        const min = precios.length ? Math.min(...precios) : 0;
        const max = precios.length ? Math.max(...precios) : 0;
        setRangoPrecio([min, max]);
        setFiltros(f => ({ ...f, precio: [min, max] }));
      })
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, []);

  // Obtener marcas y categorías únicas
  const marcas = useMemo(() => Array.from(new Set(productos.map(p => p.marca))).sort(), [productos]);
  const categorias = useMemo(() => Array.from(new Set(productos.map(p => p.categoria))).sort(), [productos]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      // Marca
      if (filtros.marcas.length && !filtros.marcas.includes(p.marca)) return false;
      // Categoría
      if (filtros.categorias.length && !filtros.categorias.includes(p.categoria)) return false;
      // Precio (al menos una variante en rango)
      if (p.variantes && p.variantes.length > 0) {
        const algunaEnRango = p.variantes.some((v: any) => v.precio >= filtros.precio[0] && v.precio <= filtros.precio[1]);
        if (!algunaEnRango) return false;
      } else {
        return false;
      }
      return true;
    });
  }, [productos, filtros]);

  const handleFiltrosChange = (nuevo: typeof filtros) => {
    setFiltros(nuevo);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      marcas: [],
      categorias: [],
      precio: [...rangoPrecio] as [number, number],
    });
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header con título y botón de filtros móvil */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Tienda</h1>

        {/* Botón de filtros para móvil */}
        <button
          onClick={handleSidebarToggle}
          className="lg:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Filter className="h-5 w-5" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de filtros - Desktop */}
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <SidebarFilters
            marcas={marcas}
            categorias={categorias}
            precioMin={rangoPrecio[0]}
            precioMax={rangoPrecio[1]}
            filtros={filtros}
            onChange={handleFiltrosChange}
            onClear={handleLimpiarFiltros}
          />
        </div>

        {/* Sidebar de filtros - Móvil */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={handleSidebarClose}
            />

            {/* Sidebar */}
            <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button
                  onClick={handleSidebarClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto h-full">
                <SidebarFilters
                  marcas={marcas}
                  categorias={categorias}
                  precioMin={rangoPrecio[0]}
                  precioMax={rangoPrecio[1]}
                  filtros={filtros}
                  onChange={handleFiltrosChange}
                  onClear={handleLimpiarFiltros}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-1">
          {/* Información de resultados */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
            </p>

            {/* Botón limpiar filtros */}
            {(filtros.marcas.length > 0 || filtros.categorias.length > 0 ||
              filtros.precio[0] !== rangoPrecio[0] || filtros.precio[1] !== rangoPrecio[1]) && (
                <button
                  onClick={handleLimpiarFiltros}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
          </div>

          {/* Grid de productos */}
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg mb-4">
                No se encontraron productos con los filtros seleccionados.
              </div>
              <button
                onClick={handleLimpiarFiltros}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {productosFiltrados.map((p: any) => (
                <div key={p.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border overflow-hidden">
                  {/* Imagen del producto */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${p.img}`}
                      alt={`${p.marca} ${p.modelo}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                        {p.marca} {p.modelo}
                      </h3>
                      <p className="text-gray-600 text-sm">{p.categoria}</p>
                    </div>

                    <div className="text-green-600 font-semibold text-lg">
                      {p.variantes && p.variantes.length > 0
                        ? `$${Math.min(...p.variantes.map((v: any) => v.precio)).toLocaleString()}`
                        : 'Sin stock'}
                    </div>

                    <button
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      onClick={() => navigate(`/tienda/${p.id}`)}
                    >
                      Ver más
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SidebarFiltersProps {
  marcas: string[];
  categorias: string[];
  precioMin: number;
  precioMax: number;
  filtros: {
    marcas: string[];
    categorias: string[];
    precio: [number, number];
  };
  onChange: (filtros: {
    marcas: string[];
    categorias: string[];
    precio: [number, number];
  }) => void;
  onClear: () => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  marcas,
  categorias,
  precioMin,
  precioMax,
  filtros,
  onChange,
  onClear
}) => {
  const [precio, setPrecio] = useState<[number, number]>([precioMin, precioMax]);

  useEffect(() => {
    setPrecio(filtros.precio);
  }, [filtros.precio]);

  const handleMarcaChange = (marca: string) => {
    const nuevasMarcas = filtros.marcas.includes(marca)
      ? filtros.marcas.filter(m => m !== marca)
      : [...filtros.marcas, marca];
    onChange({ ...filtros, marcas: nuevasMarcas });
  };

  const handleCategoriaChange = (categoria: string) => {
    const nuevasCategorias = filtros.categorias.includes(categoria)
      ? filtros.categorias.filter(c => c !== categoria)
      : [...filtros.categorias, categoria];
    onChange({ ...filtros, categorias: nuevasCategorias });
  };

  const handlePrecioChange = (idx: 0 | 1, value: number) => {
    const nuevo = [...precio] as [number, number];
    nuevo[idx] = value;
    if (nuevo[0] > nuevo[1]) {
      // No permitir rango invertido
      return;
    }
    setPrecio(nuevo);
    onChange({ ...filtros, precio: nuevo });
  };

  const hasActiveFilters = filtros.marcas.length > 0 || 
                          filtros.categorias.length > 0 || 
                          filtros.precio[0] !== precioMin || 
                          filtros.precio[1] !== precioMax;

  return (
    <aside className="w-full bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filtros</h2>
        {hasActiveFilters && (
          <button
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-1"
            onClick={onClear}
            aria-label="Limpiar filtros"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Marcas */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Marca</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {marcas.map(marca => (
              <label key={marca} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filtros.marcas.includes(marca)}
                  onChange={() => handleMarcaChange(marca)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  tabIndex={0}
                  aria-label={`Filtrar por marca ${marca}`}
                />
                <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors">
                  {marca}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Categorías */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Categoría</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {categorias.map(cat => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filtros.categorias.includes(cat)}
                  onChange={() => handleCategoriaChange(cat)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  tabIndex={0}
                  aria-label={`Filtrar por categoría ${cat}`}
                />
                <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors capitalize">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Rango de Precio</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                <input
                  type="number"
                  min={precioMin}
                  max={precio[1]}
                  value={precio[0]}
                  onChange={e => handlePrecioChange(0, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Precio mínimo"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                <input
                  type="number"
                  min={precio[0]}
                  max={precioMax}
                  value={precio[1]}
                  onChange={e => handlePrecioChange(1, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Precio máximo"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Rango disponible: ${precioMin.toLocaleString()} - ${precioMax.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2 text-sm">Filtros activos:</h4>
            <div className="flex flex-wrap gap-2">
              {filtros.marcas.map(marca => (
                <span key={marca} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {marca}
                  <button
                    onClick={() => handleMarcaChange(marca)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                    aria-label={`Quitar filtro ${marca}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filtros.categorias.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {cat}
                  <button
                    onClick={() => handleCategoriaChange(cat)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                    aria-label={`Quitar filtro ${cat}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarFilters; 
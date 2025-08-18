import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface ReparacionInfo {
  arreglomodulo?: number;
  arreglobateria?: number;
  arreglopin?: number;
  colormodulo?: string;
  tipo?: string;
  marco?: boolean;
  version?: string;
  id?: number;
  marca?: string;
  modelo?: string;
}

interface BuscadorDispositivosProps {
  onSeleccionar: (item: ReparacionInfo) => void;
  placeholder?: string;
  className?: string;
}

import api from '@/config/axios';

const BuscadorDispositivos: React.FC<BuscadorDispositivosProps> = ({
  onSeleccionar,
  placeholder = "Escribe marca o modelo (ej: Samsung Galaxy, iPhone)...",
  className = ""
}) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ReparacionInfo[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Buscador en tiempo real
  useEffect(() => {
    if (terminoBusqueda.trim().length >= 2) {
      setBuscando(true);
      const timeoutId = setTimeout(() => {
        const params = new URLSearchParams();
        params.append('termino', terminoBusqueda.trim());
        
        api.get(`/Celulares/buscar?${params}`)
          .then(response => {
            const resultados: ReparacionInfo[] = response.data.data || [];
            setResultadosBusqueda(resultados);
            setMostrarResultados(true);
          })
          .catch(() => {
            setResultadosBusqueda([]);
            setMostrarResultados(false);
          })
          .finally(() => setBuscando(false));
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setResultadosBusqueda([]);
      setMostrarResultados(false);
      setBuscando(false);
    }
  }, [terminoBusqueda]);

  const handleSeleccionar = (item: ReparacionInfo) => {
    onSeleccionar(item);
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
    setMostrarResultados(false);
  };

  const handleInputFocus = () => {
    if (resultadosBusqueda.length > 0) {
      setMostrarResultados(true);
    }
  };

  const handleInputBlur = () => {
    // Pequeño delay para permitir que el click en los resultados funcione
    setTimeout(() => setMostrarResultados(false), 200);
  };

  // Función para obtener el valor o mensaje de "Sin presupuesto"
  const getPrecioOMensaje = (precio: number | undefined | null) => {
    if (precio === null || precio === undefined) {
      return 'Sin presupuesto';
    }
    return `$${precio}`;
  };

  // Función para obtener la clase CSS según si hay precio o no
  const getPrecioClass = (precio: number | undefined | null) => {
    if (precio === null || precio === undefined) {
      return 'text-red-600 font-semibold bg-red-50 border-red-200';
    }
    return 'text-green-600 font-semibold bg-green-50 border-green-200';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full pr-10"
        />
        {buscando && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      
      {/* Resultados de búsqueda */}
      {mostrarResultados && resultadosBusqueda.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {resultadosBusqueda.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSeleccionar(item)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">
                    {item.marca} {item.modelo}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.colormodulo && <span className="mr-2">Color: {item.colormodulo}</span>}
                    {item.tipo && <span className="mr-2">Tipo: {item.tipo}</span>}
                    {item.version && <span className="mr-2">Versión: {item.version}</span>}
                    <span>{item.marco ? 'Con marco' : 'Sin marco'}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {item.arreglomodulo && <span className="text-green-600 mr-1">M:${item.arreglomodulo}</span>}
                  {item.arreglobateria && <span className="text-green-600 mr-1">B:${item.arreglobateria}</span>}
                  {item.arreglopin && <span className="text-green-600">P:${item.arreglopin}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {mostrarResultados && terminoBusqueda.trim().length >= 2 && !buscando && resultadosBusqueda.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="text-center text-gray-500">
            No se encontraron dispositivos con "{terminoBusqueda}"
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscadorDispositivos; 
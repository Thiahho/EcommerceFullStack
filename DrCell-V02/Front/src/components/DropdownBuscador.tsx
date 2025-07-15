import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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

interface DropdownBuscadorProps {
  onSeleccionar: (item: ReparacionInfo) => void;
  placeholder?: string;
  className?: string;
  marcas?: string[];
  modelos?: string[];
  marcaSeleccionada?: string;
  modeloSeleccionado?: string;
  onMarcaChange?: (marca: string) => void;
  onModeloChange?: (modelo: string) => void;
}

const API_URL = 'http://localhost:5015';

const DropdownBuscador: React.FC<DropdownBuscadorProps> = ({
  onSeleccionar,
  placeholder = "Buscar dispositivo...",
  className = "",
  marcas = [],
  modelos = [],
  marcaSeleccionada = "",
  modeloSeleccionado = "",
  onMarcaChange,
  onModeloChange
}) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ReparacionInfo[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [modoBusqueda, setModoBusqueda] = useState<'dropdown' | 'busqueda'>('dropdown');
  const containerRef = useRef<HTMLDivElement>(null);

  // Buscador en tiempo real
  useEffect(() => {
    if (terminoBusqueda.trim().length >= 2) {
      setBuscando(true);
      const timeoutId = setTimeout(() => {
        const params = new URLSearchParams();
        params.append('termino', terminoBusqueda.trim());
        
        fetch(`${API_URL}/celulares/buscar?${params}`)
          .then(res => res.json())
          .then(data => {
            const resultados: ReparacionInfo[] = data.data || [];
            setResultadosBusqueda(resultados);
            setMostrarDropdown(true);
          })
          .catch(() => {
            setResultadosBusqueda([]);
            setMostrarDropdown(false);
          })
          .finally(() => setBuscando(false));
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setResultadosBusqueda([]);
      setMostrarDropdown(false);
      setBuscando(false);
    }
  }, [terminoBusqueda]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeleccionar = (item: ReparacionInfo) => {
    onSeleccionar(item);
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
    setMostrarDropdown(false);
    setModoBusqueda('dropdown');
  };

  const handleInputFocus = () => {
    if (terminoBusqueda.trim().length >= 2) {
      setMostrarDropdown(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerminoBusqueda(value);
    if (value.trim().length >= 2) {
      setModoBusqueda('busqueda');
    } else {
      setModoBusqueda('dropdown');
    }
  };

  const handleMarcaChange = (marca: string) => {
    if (onMarcaChange) {
      onMarcaChange(marca);
    }
    setModoBusqueda('dropdown');
  };

  const handleModeloChange = (modelo: string) => {
    if (onModeloChange) {
      onModeloChange(modelo);
    }
    setModoBusqueda('dropdown');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Modo Dropdown */}
      {modoBusqueda === 'dropdown' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
            <Select value={marcaSeleccionada} onValueChange={handleMarcaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
            <Select value={modeloSeleccionado} onValueChange={handleModeloChange} disabled={!marcaSeleccionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelos.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Modo Búsqueda */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {modoBusqueda === 'dropdown' ? 'O busca escribiendo:' : 'Buscar dispositivo'}
          </label>
          <div className="relative">
            <Input
              placeholder={placeholder}
              value={terminoBusqueda}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="w-full pr-10"
            />
            {buscando && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Resultados de búsqueda */}
        {mostrarDropdown && (resultadosBusqueda.length > 0 || terminoBusqueda.trim().length >= 2) && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {resultadosBusqueda.length > 0 ? (
              resultadosBusqueda.map((item, index) => (
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
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                {buscando ? 'Buscando...' : `No se encontraron dispositivos con "${terminoBusqueda}"`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón para cambiar modo */}
      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setModoBusqueda(modoBusqueda === 'dropdown' ? 'busqueda' : 'dropdown')}
          className="w-full"
        >
          {modoBusqueda === 'dropdown' ? '🔍 Cambiar a búsqueda por texto' : '📋 Cambiar a selección por dropdown'}
        </Button>
      </div>
    </div>
  );
};

export default DropdownBuscador; 
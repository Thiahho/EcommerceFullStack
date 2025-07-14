import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ReparacionInfo {
  marca: string;
  modelo: string;
  arreglomodulo?: number;
  arreglobateria?: number;
  arreglopin?: number;
  colormodulo?: string;
  tipo?: string;
  marco?: boolean;
  version?: string;
}

const API_URL = 'http://localhost:5015';

const BusquedaReparaciones: React.FC = () => {
  const [termino, setTermino] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [resultados, setResultados] = useState<ReparacionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [marcas, setMarcas] = useState<string[]>([]);

  // Obtener marcas para el filtro
  useEffect(() => {
    axios.get(`${API_URL}/celulares/marcas`)
      .then(res => setMarcas(res.data))
      .catch(() => setMarcas([]));
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (termino) params.append('termino', termino);
      if (marca) params.append('marca', marca);
      if (modelo) params.append('modelo', modelo);

      const response = await axios.get(`${API_URL}/celulares/buscar?${params}`);
      setResultados(response.data.data || []);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setTermino('');
    setMarca('');
    setModelo('');
    setResultados([]);
  };

  const getPrecioOMensaje = (precio: number | undefined | null) => {
    if (precio === null || precio === undefined) {
      return 'Sin presupuesto';
    }
    return `$${precio}`;
  };

  const getPrecioClass = (precio: number | undefined | null) => {
    if (precio === null || precio === undefined) {
      return 'text-red-600 font-semibold';
    }
    return 'text-green-600 font-semibold';
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Búsqueda de Reparaciones</h2>
      
      {/* Filtros de búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Término de búsqueda</label>
          <Input
            placeholder="Buscar por marca o modelo..."
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Marca</label>
          <Select value={marca} onValueChange={setMarca}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las marcas</SelectItem>
              {marcas.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo</label>
          <Input
            placeholder="Filtrar por modelo..."
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-end space-x-2">
          <Button 
            onClick={handleBuscar} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
          <Button 
            onClick={handleLimpiar} 
            variant="outline"
            className="px-4"
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Resultados ({resultados.length})
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {resultados.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                <div className="mb-3">
                  <h4 className="font-semibold text-lg text-gray-900">
                    {item.marca} {item.modelo}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {item.colormodulo && <p>Color: {item.colormodulo}</p>}
                    {item.tipo && <p>Tipo: {item.tipo}</p>}
                    {item.version && <p>Versión: {item.version}</p>}
                    <p>Marco: {item.marco ? 'Con marco' : 'Sin marco'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Módulo:</span>
                    <span className={getPrecioClass(item.arreglomodulo)}>
                      {getPrecioOMensaje(item.arreglomodulo)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Batería:</span>
                    <span className={getPrecioClass(item.arreglobateria)}>
                      {getPrecioOMensaje(item.arreglobateria)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Pin:</span>
                    <span className={getPrecioClass(item.arreglopin)}>
                      {getPrecioOMensaje(item.arreglopin)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && resultados.length === 0 && (termino || marca || modelo) && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron resultados para tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default BusquedaReparaciones; 
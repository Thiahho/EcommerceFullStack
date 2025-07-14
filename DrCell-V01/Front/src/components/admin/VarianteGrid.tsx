import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Cpu, DollarSign, Package, Pencil } from 'lucide-react';

interface Variante {
  id: number;
  ram: string;
  almacenamiento: string;
  color: string;
  precio: number;
  stock: number;
  productoId: number;
}

interface VarianteGridProps {
  variantes: Variante[];
  onEdit: (variante: Variante) => void;
  onDelete: (variante: Variante) => void;
}

const VarianteGrid: React.FC<VarianteGridProps> = ({ variantes, onEdit, onDelete }) => {
  if (variantes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Cpu className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay variantes</h3>
        <p className="text-gray-500 max-w-md">
          Aún no se han creado variantes para este producto. 
          Crea la primera variante para comenzar a gestionar las especificaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Variantes del Producto
            </h3>
            <p className="text-sm text-gray-600">
              {variantes.length} variante{variantes.length !== 1 ? 's' : ''} configurada{variantes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-green-600">
                ${variantes.reduce((sum, v) => sum + v.precio, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">Stock:</span>
              <span className="font-semibold text-blue-600">
                {variantes.reduce((sum, v) => sum + v.stock, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de variantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {variantes.map((variante) => (
          <div key={variante.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            {/* Header de la card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {variante.ram} - {variante.almacenamiento}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: variante.color.toLowerCase() === 'negro' ? '#000' : 
                               variante.color.toLowerCase() === 'blanco' ? '#fff' : 
                               variante.color.toLowerCase() === 'azul' ? '#3b82f6' : 
                               variante.color.toLowerCase() === 'rojo' ? '#ef4444' : 
                               variante.color.toLowerCase() === 'verde' ? '#10b981' : '#6b7280' }}
                    ></div>
                    <span className="text-xs text-gray-600 capitalize">{variante.color}</span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(variante)}
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Editar variante"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(variante)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Eliminar variante"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Contenido de la card */}
            <div className="p-4 space-y-3">
              {/* Especificaciones */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Cpu className="w-3 h-3" />
                  <span>Especificaciones</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">RAM:</span>
                    <p className="font-medium text-gray-800">{variante.ram}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Almacenamiento:</span>
                    <p className="font-medium text-gray-800">{variante.almacenamiento}</p>
                  </div>
                </div>
              </div>

              {/* Información comercial */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <DollarSign className="w-3 h-3" />
                  <span>Comercial</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Precio:</span>
                    <span className="font-bold text-lg text-green-600">
                      ${variante.precio.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`font-semibold text-sm px-2 py-1 rounded-full ${
                      variante.stock > 10 ? 'bg-green-100 text-green-700' :
                      variante.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {variante.stock} unidad{variante.stock !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con estado */}
            <div className={`px-4 py-2 text-xs font-medium ${
              variante.stock > 10 ? 'bg-green-50 text-green-700 border-t border-green-100' :
              variante.stock > 0 ? 'bg-yellow-50 text-yellow-700 border-t border-yellow-100' :
              'bg-red-50 text-red-700 border-t border-red-100'
            }`}>
              {variante.stock > 10 ? '✅ Disponible' :
               variante.stock > 0 ? '⚠️ Stock bajo' :
               '❌ Sin stock'}
            </div>
          </div>
        ))}
      </div>

      {/* Vista de tabla para pantallas grandes */}
      <div className="hidden xl:block">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especificaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {variantes.map((variante) => (
                  <tr key={variante.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {variante.ram} - {variante.almacenamiento}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: variante.color.toLowerCase() === 'negro' ? '#000' : 
                                   variante.color.toLowerCase() === 'blanco' ? '#fff' : 
                                   variante.color.toLowerCase() === 'azul' ? '#3b82f6' : 
                                   variante.color.toLowerCase() === 'rojo' ? '#ef4444' : 
                                   variante.color.toLowerCase() === 'verde' ? '#10b981' : '#6b7280' }}
                        ></div>
                        <span className="text-sm text-gray-900 capitalize">{variante.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        ${variante.precio.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        variante.stock > 10 ? 'bg-green-100 text-green-800' :
                        variante.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {variante.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        variante.stock > 10 ? 'bg-green-100 text-green-800' :
                        variante.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {variante.stock > 10 ? 'Disponible' :
                         variante.stock > 0 ? 'Stock bajo' :
                         'Sin stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(variante)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(variante)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VarianteGrid;

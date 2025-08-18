import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus } from 'lucide-react';
import axios from '../../config/axios';
import { toast } from 'sonner';
import VarianteForm from '@/components/admin/VarianteForm';
import EditVarianteForm from '@/components/admin/EditVarianteForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Producto {
  id: number;
  marca: string;
  modelo: string;
  categoria: string;
  img: string;
}

interface Variante {
  id: number;
  ram: string;
  almacenamiento: string;
  color: string;
  precio: number;
  stock: number;
  productoId: number;
}

const Variantes = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVariante, setSelectedVariante] = useState<Variante | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [varianteToDelete, setVarianteToDelete] = useState<Variante | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProductos = useCallback(async () => {
    try {
      const response = await axios.get('/Productos/GetAll');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      toast.error('Error al cargar los productos');
    }
  }, []);

  const fetchVariantes = useCallback(async (productoId: number) => {
    try {
      const response = await axios.get(`/Productos/${productoId}/variantes`);
      setVariantes(response.data || []);
    } catch (error) {
      console.error('Error al obtener variantes:', error);
      toast.error('Error al cargar las variantes');
    }
  }, []);

  // Efecto para cargar productos al montar el componente
  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Efecto para cargar variantes cuando cambia el producto seleccionado
  useEffect(() => {
    if (selectedProductoId) {
      fetchVariantes(selectedProductoId);
      const producto = productos.find(p => p.id === selectedProductoId);
      setSelectedProducto(producto || null);
    } else {
      setVariantes([]);
      setSelectedProducto(null);
    }
  }, [selectedProductoId, productos, fetchVariantes]);

  const handleProductoChange = (productoId: string) => {
    setSelectedProductoId(Number(productoId));
  };

  const handleEdit = (variante: Variante) => {
    setSelectedVariante(variante);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (variante: Variante) => {
    setVarianteToDelete(variante);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!varianteToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`/admin/productos/variante/${varianteToDelete.id}`);
      toast.success('Variante eliminada exitosamente');
      if (selectedProductoId) {
        await fetchVariantes(selectedProductoId);
      }
    } catch (error) {
      console.error('Error al eliminar variante:', error);
      toast.error('Error al eliminar la variante');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setVarianteToDelete(null);
    }
  };

  const handleSuccess = () => {
    if (selectedProductoId) {
      fetchVariantes(selectedProductoId);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Gestión de Variantes</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <Label htmlFor="producto">Seleccionar Producto</Label>
              <Select
                value={selectedProductoId?.toString() || ''}
                onValueChange={handleProductoChange}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id.toString()}>
                      {producto.marca} {producto.modelo} - {producto.categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProducto && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={`data:image/jpeg;base64,${selectedProducto.img}`}
                  alt={`${selectedProducto.marca} ${selectedProducto.modelo}`}
                  className="h-16 w-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedProducto.marca} {selectedProducto.modelo}
                  </h3>
                  <p className="text-gray-600 capitalize">{selectedProducto.categoria}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProducto && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Variantes del Producto</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Nueva Variante
            </Button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {variantes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No hay variantes para este producto.</p>
                <p className="text-sm mt-2">Haz clic en Nueva Variante para agregar la primera.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Especificaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {variantes.map((variante) => (
                    <tr key={variante.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {variante.ram} - {variante.almacenamiento}
                        </div>
                        <div className="text-sm text-gray-500">{variante.color}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${variante.precio.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${variante.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {variante.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(variante)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(variante)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {selectedProducto && (
        <VarianteForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleSuccess}
          productoId={selectedProductoId!}
        />
      )}

      {selectedVariante && (
        <EditVarianteForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedVariante(null);
          }}
          onSuccess={handleSuccess}
          variante={selectedVariante}
          productoId={selectedProductoId!}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <AlertDialogHeader className="bg-red-50 -mx-6 -mt-6 px-6 py-4 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-red-800">
                  Confirmar Eliminación
                </AlertDialogTitle>
                <p className="text-sm text-red-600 mt-1">
                  Esta acción es irreversible
                </p>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="px-6 py-6 space-y-4">
            {/* Información de la variante a eliminar */}
            {varianteToDelete && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Variante a eliminar:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Especificaciones:</span>
                    <span className="font-medium text-gray-800">
                      {varianteToDelete.ram} - {varianteToDelete.almacenamiento}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium text-gray-800 capitalize">
                      {varianteToDelete.color}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-medium text-green-600">
                      ${varianteToDelete.precio.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock actual:</span>
                    <span className={`font-medium ${varianteToDelete.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {varianteToDelete.stock} unidad{varianteToDelete.stock !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Advertencia prominente */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-red-800 mb-1">¡Atención!</h5>
                  <p className="text-sm text-red-700">
                    Esta acción eliminará permanentemente la variante del sistema.
                    Todos los datos asociados se perderán y no se podrán recuperar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel
              disabled={loading}
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Eliminando...
                </div>
              ) : (
                'Eliminar Variante'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Variantes;

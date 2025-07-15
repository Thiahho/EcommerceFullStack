import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import axios from '@/lib/axios';
import ProductForm from '@/components/admin/ProductForm';
import EditProductForm from '@/components/admin/EditProductForm';
import { toast } from 'sonner';
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

const ProductosAdmin = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProductos = async () => {
    try {
      const response = await axios.get('/api/Producto');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      toast.error('Error al cargar los productos');
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (producto: Producto) => {
    setProductoToDelete(producto);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productoToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`api/producto/${productoToDelete.id}`);
      toast.success('Producto eliminado exitosamente');
      await fetchProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setProductoToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={`data:image/jpeg;base64,${producto.img}`}
                    alt={`${producto.marca} ${producto.modelo}`}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{producto.marca}</div>
                  <div className="text-sm text-gray-500">{producto.modelo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{producto.categoria}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(producto)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(producto)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProductos}
      />

      {selectedProducto && (
        <EditProductForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProducto(null);
          }}
          onSuccess={fetchProductos}
          producto={selectedProducto}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md bg-white border-2 border-red-200 shadow-2xl">
          <AlertDialogHeader className="bg-red-50 -mx-6 -mt-6 px-6 py-4 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-red-800">
                  Confirmar Eliminación
                </AlertDialogTitle>
                <p className="text-sm text-red-600 mt-1">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-6 px-6">
            {/* Información del producto a eliminar */}
            {productoToDelete && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Producto a eliminar:</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={`data:image/jpeg;base64,${productoToDelete.img}`}
                    alt={`${productoToDelete.marca} ${productoToDelete.modelo}`}
                    className="h-16 w-16 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {productoToDelete.marca} {productoToDelete.modelo}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      Categoría: {productoToDelete.categoria}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Advertencia */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    ⚠️ Acción Irreversible
                  </p>
                  <p className="text-sm text-red-700">
                    Al confirmar, el producto será eliminado permanentemente del sistema. 
                    Esta acción no se puede deshacer.
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
                'Eliminar Producto'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductosAdmin;
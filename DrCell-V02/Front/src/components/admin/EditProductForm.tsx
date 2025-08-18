import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from '../../config/axios';
import { toWebpBase64 } from '@/lib/utils';

interface EditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  producto: {
    id: number;
    marca: string;
    modelo: string;
    categoria: string;
    img: string;
  };
}

const EditProductForm: React.FC<EditProductFormProps> = ({ isOpen, onClose, onSuccess, producto }) => {
  const [editedProducto, setEditedProducto] = useState({
    marca: producto.marca,
    modelo: producto.modelo,
    categoria: producto.categoria,
    img: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setEditedProducto({
      marca: producto.marca,
      modelo: producto.modelo,
      categoria: producto.categoria,
      img: null
    });
    setImagePreview(null);
  }, [producto]);

  const handleProductoChange = (field: keyof typeof editedProducto, value: string) => {
    setEditedProducto(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditedProducto(prev => ({ ...prev, img: file }));

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!editedProducto.marca || !editedProducto.modelo || !editedProducto.categoria) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      setLoading(true);

      let imgBase64 = "";
      if (editedProducto.img) {
        imgBase64 = await toWebpBase64(editedProducto.img, 600, 0.7);
      } else {
        imgBase64 = producto.img;
      }

      const productoData = {
        id: producto.id,
        marca: editedProducto.marca,
        modelo: editedProducto.modelo,
        categoria: editedProducto.categoria,
        img: imgBase64
      };

      await axios.put(`/admin/productos/${producto.id}`, productoData);

      toast.success('¡Producto actualizado exitosamente!', {
        description: 'El producto se ha actualizado en el sistema.',
        duration: 4000,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al actualizar el producto:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el producto';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEditedProducto({
      marca: producto.marca,
      modelo: producto.modelo,
      categoria: producto.categoria,
      img: null
    });
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader className="bg-gray-50 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800">
            Editar Producto
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Modifica la información del producto seleccionado
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sección: Información Básica */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Información Básica
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca" className="text-sm font-semibold text-gray-700">
                  Marca *
                </Label>
                <Input
                  id="marca"
                  value={editedProducto.marca}
                  onChange={(e) => handleProductoChange('marca', e.target.value)}
                  placeholder="Ej: Samsung"
                  className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo" className="text-sm font-semibold text-gray-700">
                  Modelo *
                </Label>
                <Input
                  id="modelo"
                  value={editedProducto.modelo}
                  onChange={(e) => handleProductoChange('modelo', e.target.value)}
                  placeholder="Ej: Galaxy S21"
                  className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="categoria" className="text-sm font-semibold text-gray-700">
                Categoría *
              </Label>
              <Select
                value={editedProducto.categoria}
                onValueChange={(value) => handleProductoChange('categoria', value)}
              >
                <SelectTrigger className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celular">📱 Celular</SelectItem>
                  <SelectItem value="tablet">📱 Tablet</SelectItem>
                  <SelectItem value="laptop">💻 Laptop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sección: Imagen del Producto */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Imagen del Producto
            </h3>

            <div className="space-y-4">
              {/* Imagen actual */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Imagen Actual
                </Label>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <img
                      src={`data:image/jpeg;base64,${producto.img}`}
                      alt={`${producto.marca} ${producto.modelo}`}
                      className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Nueva imagen */}
              <div className="space-y-3">
                <Label htmlFor="img" className="text-sm font-semibold text-gray-700">
                  Cambiar Imagen (Opcional)
                </Label>
                <Input
                  id="img"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-600 bg-white px-3 py-2 rounded border">
                  📋 Deja vacío para mantener la imagen actual. Formatos: JPG, PNG, WebP. Máx: 5MB
                </p>
              </div>

              {/* Vista previa de nueva imagen */}
              {imagePreview && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Vista Previa de Nueva Imagen
                  </Label>
                  <div className="flex justify-center">
                    <div className="relative bg-white p-4 rounded-lg border-2 border-green-200">
                      <img
                        src={imagePreview}
                        alt="Vista previa nueva imagen"
                        className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setEditedProducto(prev => ({ ...prev, img: null }));
                          setImagePreview(null);
                        }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors shadow-lg"
                        aria-label="Eliminar nueva imagen"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Indicador de cambios 
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-800">Cambios realizados</span>
              <span className="text-sm font-bold text-yellow-600">
                {[
                  editedProducto.marca !== producto.marca ? 1 : 0,
                  editedProducto.modelo !== producto.modelo ? 1 : 0,
                  editedProducto.categoria !== producto.categoria ? 1 : 0,
                  editedProducto.img ? 1 : 0
                ].reduce((a, b) => a + b, 0)} cambios
              </span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${[
                    editedProducto.marca !== producto.marca ? 1 : 0,
                    editedProducto.modelo !== producto.modelo ? 1 : 0,
                    editedProducto.categoria !== producto.categoria ? 1 : 0,
                    editedProducto.img ? 1 : 0
                  ].reduce((a, b) => a + b, 0) * 25}%` 
                }}
              ></div>
            </div>
          </div>*/}
        </div>

        <DialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !editedProducto.marca || !editedProducto.modelo || !editedProducto.categoria}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Actualizando...
              </div>
            ) : (
              'Actualizar Producto'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductForm;
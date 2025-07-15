import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from '@/lib/axios';
import { toast } from 'sonner';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Producto {
  marca: string;
  modelo: string;
  categoria: string;
  img: File | null;
}

export async function toWebpBase64(file: File, size = 400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crear canvas cuadrado
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No se pudo obtener el contexto del canvas');

        // Calcular tamaño y posición para centrar la imagen
        const scale = Math.min(size / img.width, size / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const x = (size - newWidth) / 2;
        const y = (size - newHeight) / 2;

        ctx.fillStyle = '#fff'; // Fondo blanco (opcional)
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, x, y, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject('Error al convertir la imagen a WebP');
            const reader2 = new FileReader();
            reader2.onloadend = () => {
              const base64data = reader2.result as string;
              resolve(base64data.split(',')[1]);
            };
            reader2.readAsDataURL(blob);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject('Error al cargar la imagen');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject('Error al leer el archivo');
    reader.readAsDataURL(file);
  });
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [producto, setProducto] = useState<Producto>({
    marca: '',
    modelo: '',
    categoria: '',
    img: null
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleProductoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProducto(prev => ({ ...prev, img: file }));
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!producto.marca || !producto.modelo || !producto.categoria) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      setLoading(true);

      let imgBase64 = "";
      if (producto.img) {
        imgBase64 = await toWebpBase64(producto.img, 600, 0.7);
      }

      const productoPayload = {
        marca: producto.marca,
        modelo: producto.modelo,
        categoria: producto.categoria,
        img: imgBase64
      };

      await axios.post('/api/Producto', productoPayload);
      
      toast.success('¡Producto creado exitosamente!', {
        description: 'El producto se ha guardado en el sistema.',
        duration: 4000,
      });
      
      // Reset form
      setProducto({
        marca: '',
        modelo: '',
        categoria: '',
        img: null
      });
      setImagePreview(null);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al crear el producto:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el producto';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProducto({
      marca: '',
      modelo: '',
      categoria: '',
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
            Crear Nuevo Producto
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Completa la información del producto que deseas agregar al catálogo
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
                  name="marca"
                  value={producto.marca}
                  onChange={handleProductoChange}
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
                  name="modelo"
                  value={producto.modelo}
                  onChange={handleProductoChange}
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
                value={producto.categoria}
                onValueChange={(value) => setProducto(prev => ({ ...prev, categoria: value }))}
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
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="img" className="text-sm font-semibold text-gray-700">
                  Seleccionar Imagen
                </Label>
                <Input
                  id="img"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-600 bg-white px-3 py-2 rounded border">
                  📋 Formatos soportados: JPG, PNG, WebP. Tamaño máximo: 5MB
                </p>
              </div>

              {/* Vista previa de imagen */}
              {imagePreview && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Vista Previa
                  </Label>
                  <div className="flex justify-center">
                    <div className="relative bg-white p-4 rounded-lg border-2 border-green-200">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setProducto(prev => ({ ...prev, img: null }));
                          setImagePreview(null);
                        }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors shadow-lg"
                        aria-label="Eliminar imagen"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Indicador de progreso 
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso del formulario</span>
              <span className="text-sm font-bold text-blue-600">
                {[
                  producto.marca ? 1 : 0,
                  producto.modelo ? 1 : 0,
                  producto.categoria ? 1 : 0,
                  producto.img ? 1 : 0
                ].reduce((a, b) => a + b, 0)}/4
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${[
                    producto.marca ? 1 : 0,
                    producto.modelo ? 1 : 0,
                    producto.categoria ? 1 : 0,
                    producto.img ? 1 : 0
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
            disabled={loading || !producto.marca || !producto.modelo || !producto.categoria}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando...
              </div>
            ) : (
              'Crear Producto'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm; 
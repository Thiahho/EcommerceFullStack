import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from '@/lib/axios';
import { toast } from 'sonner';

interface EditVarianteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  variante: {
    id: number;
    ram: string;
    almacenamiento: string;
    color: string;
    precio: number;
    stock: number;
    productoId: number;
  };
  productoId: number;
}

interface Variante {
  ram: string;
  almacenamiento: string;
  color: string;
  precio: number;
  stock: number;
}

const EditVarianteForm: React.FC<EditVarianteFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  variante, 
  productoId 
}) => {
  const [formData, setFormData] = useState<Variante>({
    ram: '',
    almacenamiento: '',
    color: '',
    precio: 0,
    stock: 0
  });
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState<Variante>({
    ram: '',
    almacenamiento: '',
    color: '',
    precio: 0,
    stock: 0
  });

  useEffect(() => {
    if (variante) {
      const varianteData = {
        ram: variante.ram,
        almacenamiento: variante.almacenamiento,
        color: variante.color,
        precio: variante.precio,
        stock: variante.stock
      };
      setFormData(varianteData);
      setOriginalData(varianteData);
    }
  }, [variante]);

  const handleChange = (field: keyof Variante, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return (
      formData.ram !== originalData.ram ||
      formData.almacenamiento !== originalData.almacenamiento ||
      formData.color !== originalData.color ||
      formData.precio !== originalData.precio ||
      formData.stock !== originalData.stock
    );
  };

  const handleSubmit = async () => {
    if (!formData.ram || !formData.almacenamiento || !formData.color || !formData.precio || !formData.stock) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    if (formData.precio <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    if (formData.stock < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    try {
      setLoading(true);

      const variantePayload = {
        productoId: productoId,
        ram: formData.ram,
        almacenamiento: formData.almacenamiento,
        color: formData.color,
        precio: Number(formData.precio),
        stock: Number(formData.stock)
      };

      await axios.put(`/api/Producto/variante/${variante.id}`, variantePayload);
      
      toast.success('¡Variante actualizada exitosamente!', {
        description: 'La variante se ha actualizado en el sistema.',
        duration: 4000,
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al actualizar la variante:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar la variante';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader className="bg-gray-50 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800">
            Editar Variante
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Modifica las especificaciones y datos comerciales de la variante
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Indicador de cambios */}
          {hasChanges() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-800">
                  Se han detectado cambios en la variante
                </span>
              </div>
            </div>
          )}

          {/* Sección: Especificaciones Técnicas */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Especificaciones Técnicas
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ram" className="text-sm font-semibold text-gray-700">
                  RAM *
                </Label>
                <Input
                  id="ram"
                  value={formData.ram}
                  onChange={(e) => handleChange('ram', e.target.value)}
                  placeholder="Ej: 8GB"
                  className={`w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    formData.ram !== originalData.ram ? 'ring-2 ring-yellow-200' : ''
                  }`}
                />
                {formData.ram !== originalData.ram && (
                  <p className="text-xs text-yellow-600">
                    Anterior: {originalData.ram}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="almacenamiento" className="text-sm font-semibold text-gray-700">
                  Almacenamiento *
                </Label>
                <Input
                  id="almacenamiento"
                  value={formData.almacenamiento}
                  onChange={(e) => handleChange('almacenamiento', e.target.value)}
                  placeholder="Ej: 128GB"
                  className={`w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    formData.almacenamiento !== originalData.almacenamiento ? 'ring-2 ring-yellow-200' : ''
                  }`}
                />
                {formData.almacenamiento !== originalData.almacenamiento && (
                  <p className="text-xs text-yellow-600">
                    Anterior: {originalData.almacenamiento}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="color" className="text-sm font-semibold text-gray-700">
                Color *
              </Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Ej: Negro, Blanco, Azul"
                className={`w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  formData.color !== originalData.color ? 'ring-2 ring-yellow-200' : ''
                }`}
              />
              {formData.color !== originalData.color && (
                <p className="text-xs text-yellow-600">
                  Anterior: {originalData.color}
                </p>
              )}
            </div>
          </div>

          {/* Sección: Información Comercial */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Información Comercial
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio" className="text-sm font-semibold text-gray-700">
                  Precio *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => handleChange('precio', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`w-full bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 pl-8 ${
                      formData.precio !== originalData.precio ? 'ring-2 ring-yellow-200' : ''
                    }`}
                  />
                </div>
                {formData.precio !== originalData.precio && (
                  <p className="text-xs text-yellow-600">
                    Anterior: ${originalData.precio.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Precio en pesos argentinos
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">
                  Stock Disponible *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-full bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 ${
                    formData.stock !== originalData.stock ? 'ring-2 ring-yellow-200' : ''
                  }`}
                />
                {formData.stock !== originalData.stock && (
                  <p className="text-xs text-yellow-600">
                    Anterior: {originalData.stock}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Cantidad disponible en inventario
                </p>
              </div>
            </div>
          </div>

          {/* Resumen de cambios */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Resumen de la Variante
            </h3>
            
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Especificaciones:</p>
                  <p className="font-semibold text-gray-800">
                    {formData.ram || 'N/A'} - {formData.almacenamiento || 'N/A'}
                  </p>
                  <p className="text-gray-600 mt-1">Color: <span className="font-semibold text-gray-800">{formData.color || 'N/A'}</span></p>
                </div>
                <div>
                  <p className="text-gray-600">Comercial:</p>
                  <p className="font-semibold text-green-600">
                    ${formData.precio ? formData.precio.toLocaleString() : '0'}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Stock: <span className={`font-semibold ${formData.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.stock || '0'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
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
            disabled={loading || !formData.ram || !formData.almacenamiento || !formData.color || !formData.precio || !formData.stock}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Actualizando...
              </div>
            ) : (
              'Actualizar Variante'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVarianteForm; 
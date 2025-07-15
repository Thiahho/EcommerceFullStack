import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/axios';
import EditProductForm from './EditProductForm';

interface Producto {
    id: number;
    marca: string;
    modelo: string;
    categoria: string;
    img: string;
    variantes: Variante[];
}

interface Variante {
    id: number;
    ram: string;
    almacenamiento: string;
    color: string;
    precio: number;
    stock: number;
}

const ProductosGrid = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { isAdmin } = useAuthStore();

    const fetchProductos = async () => {
        try {
            const response = await api.get('/api/Producto');
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
        setIsEditDialogOpen(true);
    };

    const handleEditSuccess = () => {
        fetchProductos();
        setIsEditDialogOpen(false);
    };

    const filteredProductos = productos.filter(producto =>
        producto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
                <div className="text-red-600 mb-4 text-center">{error}</div>
                <Button onClick={() => fetchProductos()}>Reintentar</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            {/* Header con título y buscador */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Productos</h1>
                <div className="flex gap-2 sm:gap-4">
                    <div className="relative flex-1 sm:flex-none">
                        <Input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProductos.map((producto) => (
                    <div key={producto.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
                        {/* Imagen del producto */}
                        <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
                            <img
                                src={`data:image/jpeg;base64,${producto.img}`}
                                alt={`${producto.marca} ${producto.modelo}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        
                        {/* Información del producto */}
                        <div className="space-y-3">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-2">
                                {producto.marca} {producto.modelo}
                            </h2>
                            <p className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                                {producto.categoria}
                            </p>
                            
                            {/* Variantes */}
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm text-gray-700">Variantes:</h3>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {producto.variantes.map((variante) => (
                                        <div key={variante.id} className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                            <div className="font-medium">
                                                {variante.ram} - {variante.almacenamiento} - {variante.color}
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-green-600 font-semibold">
                                                    ${variante.precio.toLocaleString()}
                                                </span>
                                                <span className="text-gray-500">
                                                    Stock: {variante.stock}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botón de editar */}
                            {isAdmin() && (
                                <Button
                                    onClick={() => handleEdit(producto)}
                                    className="w-full mt-4"
                                >
                                    Editar Producto
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mensaje cuando no hay productos */}
            {filteredProductos.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                        {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'No hay productos disponibles.'}
                    </div>
                    {searchTerm && (
                        <Button 
                            onClick={() => setSearchTerm('')}
                            variant="outline"
                            className="mt-4"
                        >
                            Limpiar búsqueda
                        </Button>
                    )}
                </div>
            )}

            {/* Diálogo de edición */}
            {selectedProducto && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Producto</DialogTitle>
                        </DialogHeader>
                        <EditProductForm
                            isOpen={isEditDialogOpen}
                            producto={selectedProducto}
                            onSuccess={handleEditSuccess}
                            onClose={() => setIsEditDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ProductosGrid; 
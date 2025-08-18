import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { toast } from 'sonner';
import api from '../../config/axios';

// Interfaces unificadas para los diferentes tipos de registros
interface BaseRecord {
    id: number;
    marca: string;
    modelo: string;
    costo: number;
    arreglo: number;
    tipo: string;
}

interface Pin extends BaseRecord {
    placa?: number;
}

interface Modulo extends BaseRecord {
    color?: string;
    marco?: boolean;
    version?: string;
}

type RecordType = 'baterias' | 'pines' | 'modulos';

interface EditableRecord extends BaseRecord {
    isEditing: boolean;
    originalData: BaseRecord;
    placa?: number;
    color?: string;
    marco?: boolean;
    version?: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

const ReparacionesConfig = () => {
    const [records, setRecords] = useState<EditableRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<RecordType>('baterias');
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    
    // Filtros adicionales
    const [filtroMarca, setFiltroMarca] = useState('all');
    const [filtroTipo, setFiltroTipo] = useState('all');
    const [ordenarPor, setOrdenarPor] = useState('id');
    const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
    
    // Estado para creación de nuevos registros
    const [isCreating, setIsCreating] = useState(false);
    const [newRecord, setNewRecord] = useState<Partial<EditableRecord>>({
        marca: '',
        modelo: '',
        tipo: '',
        arreglo: 0,
        costo: 0
    });

    // Estado para el diálogo de eliminación
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<EditableRecord | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    const { isAdmin } = useAuthStore();

    // Configuración de columnas por tipo
    const getColumnConfig = (type: RecordType) => {
        const baseColumns = [
            { key: 'id', label: 'ID', sortable: true },
            { key: 'marca', label: 'Marca', sortable: true, editable: true },
            { key: 'modelo', label: 'Modelo', sortable: true, editable: true },
            { key: 'tipo', label: 'Tipo', sortable: true, editable: true },
            { key: 'arreglo', label: 'Precio Reparación', sortable: true, editable: true },
            { key: 'costo', label: 'Costo', sortable: true, editable: true }
        ];

        switch (type) {
            case 'pines':
                return [...baseColumns, { key: 'placa', label: 'Placa', sortable: true, editable: true }];
            case 'modulos':
                return [
                    ...baseColumns,
                    { key: 'color', label: 'Color', sortable: true, editable: true },
                    { key: 'marco', label: 'Marco', sortable: true, editable: true },
                    { key: 'version', label: 'Versión', sortable: true, editable: true }
                ];
            default:
                return baseColumns;
        }
    };

    const getApiEndpoint = (type: RecordType) => {
        switch (type) {
            case 'baterias':
                return '/Baterias/all';
            case 'pines':
                return '/Pines/all';
            case 'modulos':
                return '/Modulos/all';
            default:
                return '/Baterias/all';
        }
    };

    const getUpdateEndpoint = (type: RecordType, id: number) => {
        switch (type) {
            case 'baterias':
                return `/Baterias/${id}`;
            case 'pines':
                return `/Pines/${id}`;
            case 'modulos':
                return `/Modulos/${id}`;
            default:
                return `/Baterias/${id}`;
        }
    };

    const getDeleteEndpoint = (type: RecordType, id: number) => {
        return getUpdateEndpoint(type, id);
    };

    const getCreateEndpoint = (type: RecordType) => {
        switch (type) {
            case 'baterias':
                return '/Baterias/create';
            case 'pines':
                return '/Pines/create';
            case 'modulos':
                return '/Modulos/create';
            default:
                return '/Baterias/create';
        }
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            const endpoint = getApiEndpoint(selectedType);
            const response = await api.get(endpoint);
            
            let data;
            if (selectedType === 'baterias') {
                data = response.data.success ? response.data.data : response.data;
            } else {
                // Para pines y módulos, verificar si tienen la estructura { success: true, data: [...] }
                data = response.data.success ? response.data.data : response.data;
            }
            
            // Verificar que data sea un array
            if (!Array.isArray(data)) {
                console.error(`Data is not an array for ${selectedType}:`, data);
                setError(`Formato de datos inválido para ${selectedType}`);
                setRecords([]);
                return;
            }
            
            const recordsWithEditing = data.map((record: any) => ({
                ...record,
                isEditing: false,
                originalData: { ...record }
            }));
            setRecords(recordsWithEditing);
            
            // Calcular paginación
            const totalItems = recordsWithEditing.length;
            const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
            setPagination(prev => ({
                ...prev,
                totalItems,
                totalPages
            }));
        } catch (error: any) {
            console.error(`Error al obtener ${selectedType}:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Error al cargar los ${selectedType}`;
            setError(errorMessage);
            toast.error(errorMessage);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [selectedType]);

    // Obtener valores únicos para filtros
    const marcasUnicas = records
        .map(r => r.marca)
        .filter((marca, index, arr) => marca && arr.indexOf(marca) === index)
        .sort();
    const tiposUnicos = records
        .map(r => r.tipo)
        .filter((tipo, index, arr) => tipo && arr.indexOf(tipo) === index)
        .sort();

    // Filtrar y ordenar registros
    const filteredRecords = records
        .filter(record => {
            const matchesSearch = 
                record.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.tipo.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesMarca = filtroMarca === 'all' || !filtroMarca || record.marca === filtroMarca;
            const matchesTipo = filtroTipo === 'all' || !filtroTipo || record.tipo === filtroTipo;
            
            return matchesSearch && matchesMarca && matchesTipo;
        })
        .sort((a, b) => {
            let aValue: any = a[ordenarPor as keyof BaseRecord];
            let bValue: any = b[ordenarPor as keyof BaseRecord];
            
            // Manejar valores nulos
            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (orden === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    // Calcular registros para la página actual
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    const currentPage = pagination.currentPage > totalPages ? 1 : pagination.currentPage;
    const startIndex = (currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setPagination(prev => ({
            ...prev,
            itemsPerPage,
            currentPage: 1,
            totalPages: Math.ceil(prev.totalItems / itemsPerPage)
        }));
    };

    const handleSort = (field: string) => {
        if (ordenarPor === field) {
            setOrden(orden === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenarPor(field);
            setOrden('asc');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFiltroMarca('all');
        setFiltroTipo('all');
        setOrdenarPor('id');
        setOrden('asc');
    };

    const handleEdit = (id: number) => {
        if (!isAdmin()) {
            toast.error('No tienes permisos para editar');
            return;
        }

        setRecords(prev => prev.map(record => 
            record.id === id 
                ? { ...record, isEditing: true, originalData: { ...record } }
                : record
        ));
    };

    const handleCancel = (id: number) => {
        setRecords(prev => prev.map(record => 
            record.id === id 
                ? { ...record.originalData, isEditing: false, originalData: record.originalData }
                : record
        ));
    };

    const handleSave = async (id: number) => {
        try {
            const record = records.find(r => r.id === id);
            if (!record) return;

            const endpoint = getUpdateEndpoint(selectedType, id);
            const { isEditing, originalData, ...updateData } = record;

            const response = await api.put(endpoint, updateData);

            if (response.data.success) {
                setRecords(prev => prev.map(r => 
                    r.id === id 
                        ? { ...r, isEditing: false, originalData: { ...r } }
                        : r
                ));
                toast.success(`${selectedType.slice(0, -1)} actualizado correctamente`);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error(`Error al actualizar ${selectedType}:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Error al actualizar el ${selectedType.slice(0, -1)}`;
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin()) {
            toast.error('No tienes permisos para eliminar');
            return;
        }

        try {
            setDeleteLoading(true);
            const endpoint = getDeleteEndpoint(selectedType, id);
            const response = await api.delete(endpoint);
            
            if (response.data.success) {
                setRecords(prev => prev.filter(r => r.id !== id));
                toast.success(`${typeLabels[selectedType]} eliminado correctamente`);
                setIsDeleteDialogOpen(false);
                setRecordToDelete(null);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error(`Error al eliminar ${selectedType}:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Error al eliminar el ${selectedType.slice(0, -1)}`;
            toast.error(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (recordToDelete) {
            await handleDelete(recordToDelete.id);
        }
    };

    const handleInputChange = (id: number, field: string, value: string | number | boolean) => {
        setRecords(prev => prev.map(record => 
            record.id === id 
                ? { ...record, [field]: value }
                : record
        ));
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (ordenarPor !== field) return <span className="text-gray-400">↕</span>;
        return <span className="text-blue-600">{orden === 'asc' ? '↑' : '↓'}</span>;
    };

    const renderCell = (record: EditableRecord, column: any) => {
        const value = record[column.key as keyof EditableRecord];
        
        if (record.isEditing && column.editable) {
            switch (column.key) {
                case 'marco':
                    return (
                        <Select 
                            value={String(value || false)} 
                            onValueChange={(val) => handleInputChange(record.id, column.key, val === 'true')}
                        >
                            <SelectTrigger className="w-20 sm:w-24 text-xs sm:text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Sí</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    );
                case 'arreglo':
                case 'costo':
                case 'placa':
                    return (
                        <Input
                            type="number"
                            step="0.01"
                            value={String(value || 0)}
                            onChange={(e) => handleInputChange(record.id, column.key, parseFloat(e.target.value) || 0)}
                            className="w-20 sm:w-24 text-xs sm:text-sm"
                        />
                    );
                default:
                    return (
                        <Input
                            value={String(value || '')}
                            onChange={(e) => handleInputChange(record.id, column.key, e.target.value)}
                            className="w-24 sm:w-32 text-xs sm:text-sm"
                        />
                    );
            }
        } else {
            if (column.key === 'arreglo' || column.key === 'costo' || column.key === 'placa') {
                return <span className="text-xs sm:text-sm text-gray-900">${String(value || 0)}</span>;
            } else if (column.key === 'marco') {
                return <span className="text-xs sm:text-sm text-gray-900">{value ? 'Sí' : 'No'}</span>;
            } else {
                return <span className="text-xs sm:text-sm text-gray-900">{String(value || '')}</span>;
            }
        }
    };

    const handleCreate = async () => {
        try {
            const endpoint = getCreateEndpoint(selectedType);
            
            // Preparar datos según el tipo
            const dataToSend = { ...newRecord };
            
            // Agregar campos específicos según el tipo
            if (selectedType === 'pines') {
                dataToSend.placa = (newRecord as any).placa || 0;
            } else if (selectedType === 'modulos') {
                dataToSend.color = (newRecord as any).color || '';
                dataToSend.marco = (newRecord as any).marco || false;
                dataToSend.version = (newRecord as any).version || '';
            }
            
            const response = await api.post(endpoint, dataToSend);
            
            if (response.data.success) {
                toast.success(`${typeLabels[selectedType]} creado correctamente`);
                setIsCreating(false);
                setNewRecord({
                    marca: '',
                    modelo: '',
                    tipo: '',
                    arreglo: 0,
                    costo: 0
                });
                fetchRecords(); // Recargar datos
            } else {
                toast.error('Error al crear el registro');
            }
        } catch (error: any) {
            console.error('Error al crear registro:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear el registro';
            toast.error(errorMessage);
        }
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
        setNewRecord({
            marca: '',
            modelo: '',
            tipo: '',
            arreglo: 0,
            costo: 0
        });
    };

    const handleNewRecordChange = (field: string, value: string | number | boolean) => {
        setNewRecord(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={() => fetchRecords()}>Reintentar</Button>
            </div>
        );
    }

    const columnConfig = getColumnConfig(selectedType);
    const typeLabels = {
        baterias: 'Baterías',
        pines: 'Pines',
        modulos: 'Módulos'
    };

    return (
        <div className="container mx-auto p-2 sm:p-4">
            {/* Header responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Configuración de Reparaciones</h1>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Select value={selectedType} onValueChange={(value: RecordType) => setSelectedType(value)}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="baterias">Baterías</SelectItem>
                            <SelectItem value="pines">Pines</SelectItem>
                            <SelectItem value="modulos">Módulos</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={() => setIsCreating(true)} 
                        disabled={!isAdmin()}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                        Agregar {typeLabels[selectedType]}
                    </Button>
                    <Button onClick={clearFilters} variant="outline" className="w-full sm:w-auto">
                        Limpiar Filtros
                    </Button>
                </div>
            </div>

            {/* Filtros responsive */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                        <Input
                            type="text"
                            placeholder={`Buscar ${typeLabels[selectedType].toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <Select value={filtroMarca} onValueChange={setFiltroMarca}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todas las marcas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las marcas</SelectItem>
                                {marcasUnicas.map(marca => (
                                    <SelectItem key={marca} value={marca}>{marca}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos los tipos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                {tiposUnicos.map(tipo => (
                                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registros por página</label>
                        <Select value={pagination.itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Tabla responsive */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columnConfig.map((column) => (
                                    <th 
                                        key={column.key}
                                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span className="hidden sm:inline">{column.label}</span>
                                            <span className="sm:hidden">{column.label.length > 8 ? column.label.substring(0, 8) + '...' : column.label}</span>
                                            {column.sortable && <SortIcon field={column.key} />}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <span className="hidden sm:inline">Acciones</span>
                                    <span className="sm:hidden">Acc</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Fila de creación */}
                            {isCreating && (
                                <tr className="bg-green-50 border-2 border-green-200">
                                    {columnConfig.map((column) => (
                                        <td key={column.key} className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            {column.key === 'id' ? (
                                                <span className="text-green-600 font-medium text-sm">Nuevo</span>
                                            ) : column.key === 'marca' || column.key === 'modelo' || column.key === 'tipo' ? (
                                                <Input
                                                    type="text"
                                                    value={(newRecord as any)[column.key] || ''}
                                                    onChange={(e) => handleNewRecordChange(column.key, e.target.value)}
                                                    className="w-full text-sm"
                                                    placeholder={`Ingrese ${column.label.toLowerCase()}`}
                                                />
                                            ) : column.key === 'arreglo' || column.key === 'costo' || column.key === 'placa' ? (
                                                <Input
                                                    type="number"
                                                    value={(newRecord as any)[column.key] || ''}
                                                    onChange={(e) => handleNewRecordChange(column.key, parseFloat(e.target.value) || 0)}
                                                    className="w-full text-sm"
                                                    placeholder="0"
                                                />
                                            ) : column.key === 'marco' ? (
                                                <Select 
                                                    value={(newRecord as any)[column.key]?.toString() || 'false'} 
                                                    onValueChange={(value) => handleNewRecordChange(column.key, value === 'true')}
                                                >
                                                    <SelectTrigger className="w-full text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Sí</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : column.key === 'color' || column.key === 'version' ? (
                                                <Input
                                                    type="text"
                                                    value={(newRecord as any)[column.key] || ''}
                                                    onChange={(e) => handleNewRecordChange(column.key, e.target.value)}
                                                    className="w-full text-sm"
                                                    placeholder={`Ingrese ${column.label.toLowerCase()}`}
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleCreate}
                                                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs"
                                            >
                                                Crear
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelCreate}
                                                className="w-full sm:w-auto text-xs"
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {currentRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                    {columnConfig.map((column) => (
                                        <td key={column.key} className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            {renderCell(record, column)}
                                        </td>
                                    ))}
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {record.isEditing ? (
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave(record.id)}
                                                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs"
                                                >
                                                    Guardar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCancel(record.id)}
                                                    className="w-full sm:w-auto text-xs"
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEdit(record.id)}
                                                    disabled={!isAdmin()}
                                                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-xs"
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setIsDeleteDialogOpen(true);
                                                        setRecordToDelete(record);
                                                    }}
                                                    disabled={!isAdmin()}
                                                    className="w-full sm:w-auto text-xs"
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {currentRecords.length === 0 && (
                    <div className="text-center py-8 text-gray-500 px-4">
                        <p className="text-sm sm:text-base">
                            {searchTerm || filtroMarca !== 'all' || filtroTipo !== 'all' 
                                ? `No se encontraron ${typeLabels[selectedType].toLowerCase()} que coincidan con los filtros` 
                                : `No hay ${typeLabels[selectedType].toLowerCase()} registrados`}
                        </p>
                    </div>
                )}
            </div>

            {/* Paginación responsive */}
            {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-700 text-center sm:text-left">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, filteredRecords.length)} de {filteredRecords.length} resultados
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="text-xs px-2 sm:px-3"
                        >
                            <span className="hidden sm:inline">Anterior</span>
                            <span className="sm:hidden">←</span>
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    className="text-xs px-2 sm:px-3 min-w-[32px] sm:min-w-[40px]"
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="text-xs px-2 sm:px-3"
                        >
                            <span className="hidden sm:inline">Siguiente</span>
                            <span className="sm:hidden">→</span>
                        </Button>
                    </div>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600 text-center sm:text-left">
                Total de {typeLabels[selectedType].toLowerCase()}: {filteredRecords.length} de {records.length}
            </div>

            {/* Diálogo de eliminación */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="w-[95vw] max-w-md bg-white border-2 border-gray-200 shadow-2xl">
                    <AlertDialogHeader className="bg-red-50 -mx-6 -mt-6 px-6 py-4 border-b border-red-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
                        {/* Información del registro a eliminar */}
                        {recordToDelete && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">
                                    {typeLabels[selectedType]} a eliminar:
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID:</span>
                                        <span className="font-medium text-gray-800">#{recordToDelete.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Marca:</span>
                                        <span className="font-medium text-gray-800">{recordToDelete.marca}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Modelo:</span>
                                        <span className="font-medium text-gray-800">{recordToDelete.modelo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tipo:</span>
                                        <span className="font-medium text-gray-800">{recordToDelete.tipo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Precio Reparación:</span>
                                        <span className="font-medium text-green-600">
                                            ${recordToDelete.arreglo.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Costo:</span>
                                        <span className="font-medium text-blue-600">
                                            ${recordToDelete.costo.toLocaleString()}
                                        </span>
                                    </div>
                                    {/* Campos específicos según el tipo */}
                                    {selectedType === 'pines' && (recordToDelete as any).placa && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Placa:</span>
                                            <span className="font-medium text-gray-800">
                                                ${(recordToDelete as any).placa.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {selectedType === 'modulos' && (
                                        <>
                                            {(recordToDelete as any).color && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Color:</span>
                                                    <span className="font-medium text-gray-800 capitalize">
                                                        {(recordToDelete as any).color}
                                                    </span>
                                                </div>
                                            )}
                                            {(recordToDelete as any).marco !== undefined && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Marco:</span>
                                                    <span className="font-medium text-gray-800">
                                                        {(recordToDelete as any).marco ? 'Sí' : 'No'}
                                                    </span>
                                                </div>
                                            )}
                                            {(recordToDelete as any).version && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Versión:</span>
                                                    <span className="font-medium text-gray-800">
                                                        {(recordToDelete as any).version}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
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
                                        Esta acción eliminará permanentemente el registro del sistema. 
                                        Todos los datos asociados se perderán y no se podrán recuperar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                        <AlertDialogCancel 
                            disabled={deleteLoading}
                            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                        >
                            {deleteLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Eliminando...
                                </div>
                            ) : (
                                `Eliminar ${typeLabels[selectedType].slice(0, -1)}`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ReparacionesConfig;


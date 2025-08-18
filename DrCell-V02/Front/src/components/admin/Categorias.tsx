import React, { useEffect, useState } from 'react';
import axios from '@/config/axios';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCategorias } from '@/hooks/useCategorias';

type Categoria = {
  id: number;
  nombre: string;
};

const Categorias: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [nombreNueva, setNombreNueva] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEdit, setNombreEdit] = useState('');

  // Usar el hook personalizado para categorías
  const { categorias, loading: categoriasLoading, refetch } = useCategorias();

  // Función para recargar categorías después de operaciones CRUD
  const recargarCategorias = () => {
    refetch();
  };

  const crearCategoria = async () => {
    if (!nombreNueva.trim()) {
      toast.warning('Ingresa un nombre');
      return;
    }
    try {
      setLoading(true);
      await axios.post('/admin/categorias', { nombre: nombreNueva.trim() });
      setNombreNueva('');
      toast.success('Categoría creada');
      recargarCategorias();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data || 'Error al crear categoría';
      toast.error(typeof msg === 'string' ? msg : 'Error al crear categoría');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (cat: Categoria) => {
    setEditandoId(cat.id);
    setNombreEdit(cat.nombre);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreEdit('');
  };

  const guardarEdicion = async () => {
    if (editandoId == null) return;
    if (!nombreEdit.trim()) {
      toast.warning('Ingresa un nombre');
      return;
    }
    try {
      setLoading(true);
      await axios.put(`/admin/categorias/${editandoId}`, { id: editandoId, nombre: nombreEdit.trim() });
      toast.success('Categoría actualizada');
      cancelarEdicion();
      recargarCategorias();
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar categoría');
    } finally {
      setLoading(false);
    }
  };

  const eliminarCategoria = async (cat: Categoria) => {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    try {
      setLoading(true);
      await axios.delete(`/admin/categorias/${cat.id}`);
      toast.success('Categoría eliminada');
      recargarCategorias();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorías</h1>
      </div>

      {/* Crear */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 border">
        <h2 className="font-semibold mb-3">Crear nueva categoría</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={nombreNueva}
            onChange={(e) => setNombreNueva(e.target.value)}
            placeholder="Nombre de la categoría"
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <Button onClick={crearCategoria} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" /> Crear
          </Button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categorias.map((cat) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 text-sm text-gray-700">{cat.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editandoId === cat.id ? (
                    <input
                      type="text"
                      value={nombreEdit}
                      onChange={(e) => setNombreEdit(e.target.value)}
                      className="border rounded-lg px-3 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    cat.nombre
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editandoId === cat.id ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="default" size="sm" onClick={guardarEdicion} disabled={loading}>
                        <Save className="h-4 w-4 mr-1" /> Guardar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={cancelarEdicion} disabled={loading}>
                        <X className="h-4 w-4 mr-1" /> Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => iniciarEdicion(cat)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => eliminarCategoria(cat)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                  {categoriasLoading ? 'Cargando...' : 'Sin categorías'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categorias;


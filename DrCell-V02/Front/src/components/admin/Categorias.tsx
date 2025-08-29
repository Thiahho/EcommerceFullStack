import React, { useEffect, useState } from "react";
import axios from "@/config/axios";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Save, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCategorias } from "@/hooks/useCategorias";
import { useAuthStore } from "@/store/auth-store";
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

type Categoria = {
  id: number;
  nombre: string;
};

const Categorias: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Usar el hook personalizado para categorías
  const { categorias, loading: categoriasLoading, refetch } = useCategorias();

  // Función para recargar categorías después de operaciones CRUD
  const recargarCategorias = () => {
    refetch();
  };

  const crearCategoria = async () => {
    if (!nombreNueva.trim()) {
      toast.warning("Ingresa un nombre");
      return;
    }
    try {
      setLoading(true);
      await axios.post("/admin/categorias", { nombre: nombreNueva.trim() });
      setNombreNueva("");
      toast.success("Categoría creada");
      recargarCategorias();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data || "Error al crear categoría";
      toast.error(typeof msg === "string" ? msg : "Error al crear categoría");
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
    setNombreEdit("");
  };

  const guardarEdicion = async () => {
    if (editandoId == null) return;
    if (!nombreEdit.trim()) {
      toast.warning("Ingresa un nombre");
      return;
    }
    try {
      setLoading(true);
      await axios.put(`/admin/categorias/${editandoId}`, {
        id: editandoId,
        nombre: nombreEdit.trim(),
      });
      toast.success("Categoría actualizada");
      cancelarEdicion();
      recargarCategorias();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: Categoria) => {
    setCategoriaToDelete(cat);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoriaToDelete) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`/admin/categorias/${categoriaToDelete.id}`);
      toast.success("Categoría eliminada exitosamente");
      recargarCategorias();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar categoría");
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
      setCategoriaToDelete(null);
    }
  };

  const { isAdmin } = useAuthStore();

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
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
                      <Button
                        variant="default"
                        size="sm"
                        onClick={guardarEdicion}
                        disabled={loading}
                      >
                        <Save className="h-4 w-4 mr-1" /> Guardar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelarEdicion}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-1" /> Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => iniciarEdicion(cat)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cat)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  {categoriasLoading ? "Cargando..." : "Sin categorías"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* AlertDialog para confirmación de eliminación */}
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
            {/* Información de la categoría a eliminar */}
            {categoriaToDelete && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Categoría a eliminar:</h4>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {categoriaToDelete.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {categoriaToDelete.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {categoriaToDelete.id}
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
                    Al confirmar, la categoría será eliminada permanentemente del sistema.
                    Esta acción no se puede deshacer.
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
                'Eliminar Categoría'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categorias;
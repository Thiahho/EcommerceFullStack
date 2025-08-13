import { useState, useEffect } from 'react';
import { categoriasService } from '@/lib/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriasService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error al obtener categorías:', err);
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const category = await categoriasService.getById(id);
      return category;
    } catch (err) {
      console.error(`Error al obtener categoría ${id}:`, err);
      setError('Error al cargar la categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoryById,
    refetch: fetchCategories
  };
};

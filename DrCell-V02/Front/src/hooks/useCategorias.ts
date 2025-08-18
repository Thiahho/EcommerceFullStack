import { useState, useEffect } from 'react';
import axios from '../config/axios';

interface Categoria {
  id: number;
  nombre: string;
}

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasNombres, setCategoriasNombres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/Categorias');
      const categoriasData = response.data || [];
      
      setCategorias(categoriasData);
      
      // Extraer solo los nombres ordenados para filtros
      const nombres = categoriasData
        .map((cat: Categoria) => cat.nombre)
        .sort();
      setCategoriasNombres(nombres);
      
    } catch (err) {
      console.error('Error al obtener categorías:', err);
      setError('Error al cargar las categorías');
      setCategorias([]);
      setCategoriasNombres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return {
    categorias,
    categoriasNombres,
    loading,
    error,
    refetch: fetchCategorias
  };
};

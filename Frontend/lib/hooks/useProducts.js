import { useState, useEffect } from 'react';
import { productosService } from '@/lib/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productosService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const product = await productosService.getById(id);
      return product;
    } catch (err) {
      console.error(`Error al obtener producto ${id}:`, err);
      setError('Error al cargar el producto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProductVariants = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const variants = await productosService.getVariantesByProduct(productId);
      return variants;
    } catch (err) {
      console.error(`Error al obtener variantes del producto ${productId}:`, err);
      setError('Error al cargar las variantes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
    getProductVariants,
    refetch: fetchProducts
  };
};

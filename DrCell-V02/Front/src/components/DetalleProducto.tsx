import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import { useParams } from 'react-router-dom';
import { useCartStore } from '@/store/cart-store';
import Toast from '@/components/ui/toast';

const ProductDetalle: React.FC = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState<any>(null);
  const [ram, setRam] = useState('');
  const [almacenamiento, setAlmacenamiento] = useState('');
  const [color, setColor] = useState('');
  const [variante, setVariante] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);

  const { addToCart } = useCartStore();

  useEffect(() => {
    axios.get(`/Productos/GetById/${id}`)
      .then(res => setProducto(res.data))
      .catch(() => setProducto(null));
  }, [id]);

  useEffect(() => {
    if (producto && ram && almacenamiento && color) {
      const v = producto.variantes.find(
        (v: any) => v.ram === ram && v.almacenamiento === almacenamiento && v.color === color
      );
      setVariante(v || null);
    }
  }, [producto, ram, almacenamiento, color]);

  const handleAddToCart = () => {
    if (!variante || !producto) return;

    addToCart({
      productoId: producto.id,
      marca: producto.marca,
      modelo: producto.modelo,
      ram: variante.ram,
      almacenamiento: variante.almacenamiento,
      color: variante.color,
      precio: variante.precio,
      stock: variante.stock,
      img: producto.img
    });

    // Mostrar notificación
    setShowNotification(true);
  };

  if (!producto) return <div className="p-8">Cargando...</div>;

  // Opciones únicas
  const rams = Array.from(new Set(producto.variantes.map((v: any) => v.ram))) as string[];
  const almacenamientos = ram
    ? Array.from(new Set(producto.variantes.filter((v: any) => v.ram === ram).map((v: any) => v.almacenamiento))) as string[]
    : [];
  const colores = ram && almacenamiento
    ? Array.from(new Set(producto.variantes.filter((v: any) => v.ram === ram && v.almacenamiento === almacenamiento).map((v: any) => v.color))) as string[]
    : [];

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      {/* Notificación mejorada */}
      <Toast
        message="¡Producto agregado al carrito exitosamente!"
        type="success"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        duration={3000}
      />

      <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-6 p-2">
        {/* Galería de imágenes */}
        <div className="flex flex-col items-center gap-2 w-full md:w-1/2">
          <img
            src={`data:image/webp;base64,${producto.img}`}
            alt={producto.modelo}
            className="w-100 h-100 object-contain mx-auto"
          />
        </div>
        {/* Info del producto */}
        <div className="flex-1 w-full md:w-1/2 flex flex-col items-start justify-center">
          <h2 className="text-2xl font-bold mb-2 text-[#17436b]">{producto.marca} {producto.modelo}</h2>
          <div className="mb-2 text-gray-600">{producto.categoria}</div>
          {/* Selector RAM */}
          <div className="mb-2 w-full">
            <label className="block font-semibold mb-1">RAM</label>
            <select
              className="border rounded p-2 w-full"
              value={ram}
              onChange={e => { setRam(e.target.value); setAlmacenamiento(''); setColor(''); }}
              disabled={rams.length === 0}
            >
              <option value="">Selecciona RAM</option>
              {rams.map((r: string) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {/* Selector Almacenamiento */}
          <div className="mb-2 w-full">
            <label className="block font-semibold mb-1">Almacenamiento</label>
            <select
              className="border rounded p-2 w-full"
              value={almacenamiento}
              onChange={e => { setAlmacenamiento(e.target.value); setColor(''); }}
              disabled={!ram || almacenamientos.length === 0}
            >
              <option value="">Selecciona almacenamiento</option>
              {almacenamientos.map((a: string) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {/* Selector Color */}
          <div className="mb-2 w-full">
            <label className="block font-semibold mb-1">Color</label>
            <select
              className="border rounded p-2 w-full"
              value={color}
              onChange={e => setColor(e.target.value)}
              disabled={!ram || !almacenamiento || colores.length === 0}
            >
              <option value="">Selecciona color</option>
              {colores.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {variante && (
            <div className="mb-2 w-full">
              <div className="text-lg font-bold text-green-700">Precio: ${variante.precio.toLocaleString()}</div>
              <div className="text-gray-700">Stock: {variante.stock}</div>
            </div>
          )}
          <button
            className="w-full bg-[#111] text-white py-3 px-6 rounded hover:bg-[#333] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-lg mt-2"
            disabled={!variante}
            onClick={handleAddToCart}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetalle;

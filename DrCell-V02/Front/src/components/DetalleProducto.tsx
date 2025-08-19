import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '@/components/ui/toast';
import { useCartStore } from '@/store/cart-store';

const ProductDetalle: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<any>(null);
  const [ram, setRam] = useState('');
  const [almacenamiento, setAlmacenamiento] = useState('');
  const [color, setColor] = useState('');
  const [variante, setVariante] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

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
      varianteId: variante.id,
      marca: producto.marca,
      modelo: producto.modelo,
      ram: variante.ram,
      almacenamiento: variante.almacenamiento,
      color: variante.color,
      precio: variante.precio,
      stock: variante.stock,
      img: producto.img
    });

    setNotificationMessage('¡Producto agregado al carrito exitosamente!');
    setShowNotification(true);
  };

  const handleProceedToCheckout = () => {
    if (!variante || !producto) return;

    // Agregar el producto al carrito
    addToCart({
      productoId: producto.id,
      varianteId: variante.id,
      marca: producto.marca,
      modelo: producto.modelo,
      ram: variante.ram,
      almacenamiento: variante.almacenamiento,
      color: variante.color,
      precio: variante.precio,
      stock: variante.stock,
      img: producto.img
    });

    setNotificationMessage('¡Producto agregado al carrito! Redirigiendo al checkout...');
    setShowNotification(true);

    // Redireccionar al checkout después de un pequeño delay para mostrar la notificación
    setTimeout(() => {
      navigate('/checkout');
    }, 1500);
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
        message={notificationMessage}
        type={notificationMessage.includes('Error') ? 'error' : 'success'}
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
          {variante && (
            <div className="w-full space-y-3">
              {/* Botón de Agregar al Carrito */}
              <button
                className="w-full bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                disabled={!variante || variante.stock <= 0}
                onClick={handleAddToCart}
              >
                🛒 Agregar al Carrito
              </button>

              {/* Separador */}
              <div className="flex items-center justify-center text-gray-500 text-sm">
                <span className="bg-white px-2">O</span>
              </div>

              {/* Botón para ir al Checkout */}
              <button
                className="w-full bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                disabled={!variante || variante.stock <= 0}
                onClick={handleProceedToCheckout}
              >
                💳 Pagar con Tarjeta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetalle;

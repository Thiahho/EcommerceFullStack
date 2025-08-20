import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from '@/pages/Home';
import Pedidos from '@/pages/admin/Pedidos';
import ProductosAdmin from '@/pages/admin/ProductosAdmin';
import Variantes from '@/pages/admin/Variantes';
import ProductosGrid from '@/components/admin/ProductosGrid';
import Usuarios from '@/pages/admin/Usuarios';
import ConsultaReparacionSection from './components/ConsultaReparacionSection';
import { Login } from '@/pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import LayoutAdmin from '@/components/layout/LayoutAdmin';
import DashboardAdmin from '@/components/admin/DasboardAdmin';
import PrivateRoute from '@/components/admin/PrivateRoute';
import ReparacionesConfig from '@/components/admin/ReparacionesConfig';
import Categorias from '@/components/admin/Categorias';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAuthInit } from '@/hooks/useAuthInit';
import Tienda from '@/components/Tienda';
import ProductDetalle from '@/components/DetalleProducto';
import Cart from '@/components/Cart';
import AboutUs from './components/AboutUs';
import TerminosYCondiciones from './components/TerminosYCondiciones';
import Checkout from '@/pages/Checkout';
import FloatingCheckout from '@/components/FloatingCheckout';

const UserDashboard = () => <div>Panel de Usuario</div>;

// Componente de carga mientras se inicializa la autenticación
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

export default function App() {
  const { isLoading, isInitialized } = useAuthInit();

  // SOLUCIÓN SIMPLIFICADA: Eliminar la lógica problemática de beforeunload
  // La persistencia de sesión se maneja completamente a través de:
  // 1. Cookies httpOnly en el backend (más seguro)
  // 2. sessionStorage para el estado del usuario (persiste en recargas)
  // 3. checkAuthStatus en useAuthInit para verificar cookies al cargar

  // Nota: Removemos el logout automático al cerrar pestaña por las siguientes razones:
  // - beforeunload es impredecible y causa problemas con recargas
  // - Las cookies tienen expiración automática (24 horas)
  // - Es mejor UX mantener la sesión entre recargas
  // - El usuario puede cerrar sesión manualmente si lo desea

  // Mostrar pantalla de carga mientras se inicializa la autenticación
  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<AboutUs />} />
          <Route path="/cotizacion" element={<ConsultaReparacionSection />} />
          <Route path="/TerminosYCondiciones" element={<TerminosYCondiciones />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <LayoutAdmin />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardAdmin />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="productos" element={<ProductosAdmin />} />
            <Route path="variantes" element={<Variantes />} />
            <Route path="reparaciones" element={<ReparacionesConfig />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/tienda/:id" element={<ProductDetalle />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <FloatingCheckout />
        <div className="w-full flex justify-center items-center my-8">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg px-4 py-6">
            <img
              src="/img/marcas2.png"
              alt="Trabajamos con estas marcas"
              className="w-full h-auto object-contain"
              style={{ maxHeight: '120px' }}
            />
          </div>
        </div>
        <Footer />
      </BrowserRouter>
    </>
  );
} 
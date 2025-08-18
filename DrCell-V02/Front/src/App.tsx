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
  const logout = useAuthStore((state) => state.logout);
  const { isLoading, isInitialized } = useAuthInit();

  useEffect(() => {
    let isReloading = false;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Si es una recarga (F5), no hacer nada
      if (isReloading) {
        return;
      }

      // Si no es una recarga, cerrar sesión
      logout();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Detectar si se presiona F5 o Ctrl+R
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        isReloading = true;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        isReloading = true;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logout]);

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
          <Route path="*" element={<Home />} />
        </Routes>
        <Cart />
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
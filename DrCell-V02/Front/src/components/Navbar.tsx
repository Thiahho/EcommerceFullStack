import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home,
  Package,
  Users,
  Clipboard,
  User,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

interface User {
  email: string;
  rol?: 'ADMIN' | 'USER';
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Función para verificar si un enlace está activo
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  // Función para obtener las clases de un enlace
  const getLinkClasses = (path: string, isMobile = false) => {
    const baseClasses = isMobile
      ? "block px-3 py-2 rounded-md transition-colors duration-200"
      : "transition-colors duration-200";

    if (isActiveLink(path)) {
      return `${baseClasses} text-[#17436b] ${isMobile ? 'bg-blue-50 font-semibold' : 'border-b-2 border-[#17436b] font-semibold'}`;
    }

    return `${baseClasses} text-gray-700 hover:text-[#17436b] ${isMobile ? 'hover:bg-gray-50' : ''}`;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Barra informativa */}
      <div className="w-full bg-[#17436b] text-white py-2 px-4 text-center text-xs sm:text-sm">
        <span className="hidden sm:inline">Lunes a Viernes de 09:00 a 19:00.</span>
        <span className="sm:hidden">Lun-Vie 09:00-19:00</span>
        <span className="font-bold ml-1 sm:ml-2">Cotizacion sin cargo.</span>
      </div>

      <nav className="border-b border-gray-200 bg-white relative h-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0 h-full">
              <img
                src="/img/Logo2.png"
                alt="Doctor Cell Logo"
                className="h-full w-auto sm:h-22"
                style={{ maxWidth: 400 }}
              />
              {/* Si quieres mantener el texto, descomenta la línea siguiente */}
              {/* <span className="text-xl sm:text-2xl font-bold text-[#17436b] hidden sm:inline">DrCell</span> */}
            </Link>

            {/* Menú principal - Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
              <Link
                to="/tienda"
                className={getLinkClasses('/tienda')}
              >
                Tienda
              </Link>
              <Link
                to="/nosotros"
                className={getLinkClasses('/nosotros')}
              >
                Sobre nosotros
              </Link>
              <Link
                to="/cotizacion"
                className={getLinkClasses('/cotizacion')}
              >
                Presupuestar
              </Link>
            </div>

            {/* Acciones a la derecha - Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-3 lg:space-x-4">
              {/* Botón del Carrito → Checkout */}
              <button
                onClick={() => navigate('/checkout')}
                disabled={getTotalItems() === 0}
                className="relative p-2 text-gray-700 hover:text-[#17436b] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Ir al checkout"
                title={getTotalItems() > 0 ? `${getTotalItems()} productos - Ir al checkout` : 'Carrito vacío'}
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Button
                      className="bg-[#17436b] text-white hover:bg-[#0d2b4a] text-sm px-3 py-2"
                      onClick={() => navigate('/admin')}
                    >
                      <Clipboard className="mr-1 h-4 w-4 lg:mr-2 lg:h-5 lg:w-5" />
                      <span className="hidden lg:inline">Admin</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50 text-sm px-3 py-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-1 h-4 w-4 lg:mr-2 lg:h-5 lg:w-5" />
                    <span className="hidden lg:inline">Cerrar Sesión</span>
                  </Button>
                </>
              ) : (
                <Button
                  className="bg-[#17436b] text-white hover:bg-[#0d2b4a] text-sm px-3 py-2"
                  onClick={() => navigate('/login')}
                >
                  <User className="mr-1 h-4 w-4 lg:mr-2 lg:h-5 lg:w-5" />
                  <span className="hidden lg:inline">Iniciar Sesión</span>
                </Button>
              )}
            </div>

            {/* Botón menú móvil */}
            <div className="md:hidden">
              <button
                onClick={handleMobileMenuToggle}
                className="p-2 rounded-md text-gray-700 hover:text-[#17436b] hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="px-4 py-2 space-y-1">
              {/* Enlaces de navegación móvil */}
              <Link
                to="/tienda"
                onClick={handleNavLinkClick}
                className={getLinkClasses('/tienda', true)}
              >
                Tienda
              </Link>
              <Link
                to="/AboutUs"
                onClick={handleNavLinkClick}
                className={getLinkClasses('/aboutus', true)}
              >
                Sobre nosotros
              </Link>
              <Link
                to="/cotizacion"
                onClick={handleNavLinkClick}
                className={getLinkClasses('/cotizacion', true)}
              >
                Presupuestar
              </Link>

              {/* Botón de Carrito → Checkout Móvil */}
              <button
                onClick={() => {
                  navigate('/checkout');
                  setIsMobileMenuOpen(false);
                }}
                disabled={getTotalItems() === 0}
                className="w-full flex items-center justify-center space-x-2 px-3 py-3 text-white bg-[#17436b] hover:bg-[#0d2b4a] rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Ir al Checkout</span>
                {getTotalItems() > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Separador */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Acciones de usuario móvil */}
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        handleNavLinkClick();
                      }}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:text-[#17436b] hover:bg-gray-50 rounded-md transition-colors duration-200 flex items-center"
                    >
                      <Clipboard className="mr-2 h-5 w-5" />
                      Admin
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    handleNavLinkClick();
                  }}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-[#17436b] hover:bg-gray-50 rounded-md transition-colors duration-200 flex items-center"
                >
                  <User className="mr-2 h-5 w-5" />
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar; 
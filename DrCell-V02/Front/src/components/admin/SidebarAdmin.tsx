import React from 'react';
import {
  Home,
  Clipboard,
  Users,
  Package,
  User,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', icon: Home },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/variantes', label: 'Variantes', icon: Package },
  { to: '/admin/reparaciones', label: 'Reparaciones', icon: Package },
];

interface SidebarAdminProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ open, setOpen, isMobile }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative z-50 h-full bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out
          ${isMobile 
            ? `top-0 left-0 transform ${open ? 'translate-x-0' : '-translate-x-full'} w-64` 
            : `w-64 my-6 ml-6 rounded-3xl`
          }
          ${!isMobile && !open ? 'w-20' : ''}
        `}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between h-20 border-b px-4 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={`https://ui-avatars.com/api/?name=${usuario.email || 'Admin'}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            {(open || !isMobile) && (
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-800 text-sm truncate">
                  {usuario.rol || 'Admin'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {usuario.email || 'admin@demo.com'}
                </div>
              </div>
            )}
          </div>
          
          {/* Botón de cerrar para móviles */}
          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded hover:bg-gray-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          )}
          
          {/* Botón de toggle para desktop */}
          {!isMobile && (
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded hover:bg-gray-100 hidden lg:block"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex flex-col flex-1 py-6 px-2 space-y-2 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 gap-3
                ${open || isMobile ? 'justify-start' : 'justify-center'}
                ${isActive ? 'bg-blue-100 text-blue-700' : ''}
                ${!open && !isMobile ? 'px-2' : ''}
                `
              }
              style={{ textDecoration: 'none' }}
              title={!open && !isMobile ? label : undefined}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              {(open || isMobile) && (
                <span className="truncate">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="mt-auto p-4 flex-shrink-0">
          <button
            className={`
              flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 gap-3 font-medium transition-colors
              ${open || isMobile ? 'justify-start' : 'justify-center'}
              ${!open && !isMobile ? 'px-2' : ''}
            `}
            onClick={handleLogout}
            title={!open && !isMobile ? 'Logout' : undefined}
          >
            <LogOut className="h-6 w-6 flex-shrink-0" />
            {(open || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarAdmin;
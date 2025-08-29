import React from "react";
import {
  Home,
  Clipboard,
  Users,
  Package,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  ShoppingCart,
  Receipt,
  Tags,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

const links = [
  { to: "/admin", label: "Dashboard", icon: Home },
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/variantes", label: "Variantes", icon: ShoppingCart },
  { to: "/admin/reparaciones", label: "Reparaciones", icon: Settings },
  { to: "/admin/categorias", label: "Categorias", icon: Tags },
  { to: "/admin/ventas", label: "Ventas", icon: Receipt },
  { to: "/admin/analiticas", label: "Analíticas", icon: BarChart3 },
];

interface SidebarAdminProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({
  open,
  setOpen,
  isMobile,
}) => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
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
          ${
            isMobile
              ? `top-0 left-0 transform ${open ? "translate-x-0" : "-translate-x-full"} w-64`
              : `my-6 ml-6 rounded-3xl ${open ? "w-64" : "w-20"}`
          }
        `}
      >
        {/* Header del sidebar */}
        <div className={`flex items-center h-20 border-b flex-shrink-0 ${!open && !isMobile ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {/* Cuando está colapsado, solo mostrar botón de expansión */}
          {!open && !isMobile ? (
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800"
              aria-label="Expand sidebar"
              title="Expandir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
          ) : (
            <>
              {/* Contenido normal cuando está expandido */}
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.email || "Admin"}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                {(open || isMobile) && (
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-800 text-sm truncate">
                      {user?.role?.toUpperCase() || "ADMIN"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user?.email || "admin@drcell.com"}
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

              {/* Botón de colapsar para desktop */}
              {!isMobile && open && (
                <button
                  onClick={() => setOpen(!open)}
                  className="p-2 rounded hover:bg-gray-100 hidden lg:block"
                  aria-label="Collapse sidebar"
                  title="Minimizar menú"
                >
                  <Menu className="h-6 w-6 text-gray-600" />
                </button>
              )}
            </>
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
                ${open || isMobile ? "justify-start" : "justify-center"}
                ${isActive ? "bg-blue-100 text-blue-700" : ""}
                ${!open && !isMobile ? "px-2" : ""}
                `
              }
              style={{ textDecoration: "none" }}
              title={!open && !isMobile ? label : undefined}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              {(open || isMobile) && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="mt-auto p-4 flex-shrink-0">
          <button
            className={`
              flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 gap-3 font-medium transition-colors
              ${open || isMobile ? "justify-start" : "justify-center"}
              ${!open && !isMobile ? "px-2" : ""}
            `}
            onClick={handleLogout}
            title={!open && !isMobile ? "Logout" : undefined}
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

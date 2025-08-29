import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import SidebarAdmin from '../admin/SidebarAdmin';
import Navbar from '../Navbar';
import { Outlet } from 'react-router-dom';

const LayoutAdmin: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Abrir sidebar por defecto en desktop
      } else {
        setSidebarOpen(false); // Cerrar sidebar por defecto en móvil
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleMobileMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header con botón móvil */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">DrCell Admin</h1>
        <button
          onClick={handleMobileMenuToggle}
          className="p-2 rounded-md text-gray-700 hover:text-[#17436b] hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1">
        <SidebarAdmin 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          isMobile={isMobile}
        />
        
        <main
          className={`
            flex-1 p-4 lg:p-8 transition-all duration-300 min-w-0 overflow-hidden
            ${isMobile ? 'w-full' : ''}
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;
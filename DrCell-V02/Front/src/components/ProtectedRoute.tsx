import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    // Redirigir al login si no hay usuario
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirigir al dashboard si el usuario no tiene el rol requerido
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 
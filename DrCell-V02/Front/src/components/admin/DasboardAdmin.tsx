import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  BarChart3,
  ShoppingBag,
  Package,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  dashboardService,
  DashboardStatsDto,
  ActividadRecienteDto,
} from "../../services/dashboardService";
import { formatCurrency, formatNumber } from "../../lib/utils";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [actividades, setActividades] = useState<ActividadRecienteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, actividadesData] = await Promise.allSettled([
        dashboardService.getDashboardStats(),
        dashboardService.getActividadReciente(),
      ]);

      if (statsData.status === "fulfilled") {
        setStats(statsData.value);
      }

      if (actividadesData.status === "fulfilled") {
        setActividades(actividadesData.value);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Analíticas Avanzadas",
      description: "Análisis completo de ventas, proyecciones y KPIs",
      icon: BarChart3,
      color: "blue",
      action: () => navigate("/admin/analiticas"),
    },
    {
      title: "Gestión de Ventas",
      description: "Administrar pedidos y transacciones",
      icon: ShoppingBag,
      color: "green",
      action: () => navigate("/admin/ventas"),
    },
    {
      title: "Inventario",
      description: "Control de productos y stock",
      icon: Package,
      color: "orange",
      action: () => navigate("/admin/productos"),
    },
    {
      title: "Usuarios",
      description: "Gestión de clientes y permisos",
      icon: Users,
      color: "purple",
      action: () => navigate("/admin/usuarios"),
    },
  ];

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case "venta":
        return TrendingUp;
      case "cliente":
        return Users;
      case "alerta":
        return AlertTriangle;
      default:
        return Package;
    }
  };

  const getActivityIconColor = (tipo: string) => {
    switch (tipo) {
      case "venta":
        return "text-green-500";
      case "cliente":
        return "text-blue-500";
      case "alerta":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Bienvenido al sistema de gestión integral de DrCell
            </p>
          </div>
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.ventasHoy)}
              </div>
              <p
                className={`text-xs ${
                  stats.cambioVentasHoy >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatPercentage(stats.cambioVentasHoy)} desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Nuevos Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.clientesNuevos)}
              </div>
              <p
                className={`text-xs ${
                  stats.cambioClientesNuevos >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(stats.cambioClientesNuevos)} desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Productos Activos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.productosActivos)}
              </div>
              <p
                className={`text-xs ${
                  stats.cambioProductosActivos >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(stats.cambioProductosActivos)} vs total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.alertasActivas)}
              </div>
              <p
                className={`text-xs ${
                  stats.cambioAlertas >= 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatPercentage(stats.cambioAlertas)} desde ayer
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="text-center" onClick={action.action}>
                  <div
                    className={`mx-auto p-3 rounded-full bg-${action.color}-100 mb-3 w-fit`}
                  >
                    <Icon className={`h-8 w-8 text-${action.color}-600`} />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={action.action}
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          {actividades.length > 0 ? (
            actividades.map((actividad, index) => {
              const Icon = getActivityIcon(actividad.tipo);
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Icon
                    className={`h-5 w-5 ${getActivityIconColor(actividad.tipo)}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{actividad.titulo}</p>
                    <p className="text-xs text-gray-500">
                      {actividad.descripcion}
                    </p>
                  </div>
                  {actividad.valor && (
                    <span className="text-sm font-bold text-green-600">
                      +{formatCurrency(actividad.valor)}
                    </span>
                  )}
                  {actividad.accion && (
                    <Button variant="outline" size="sm">
                      {actividad.accion}
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No hay actividad reciente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;

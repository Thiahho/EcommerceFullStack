import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
  Activity,
  Target,
  Zap,
  Eye,
} from "lucide-react";
import { analyticsService } from "../../services/analyticsService";
import type {
  DashboardKpiDto,
  MetricasGeneralesDto,
  KpiDto,
  TendenciaDto,
  AlertaDto,
  ProyeccionVentasDto,
  AnalisisClientesDto,
  AnalisisInventarioDto,
} from "../../services/analyticsService";

const AnalyticasAdmin: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardKpiDto | null>(
    null
  );
  const [proyeccion, setProyeccion] = useState<ProyeccionVentasDto | null>(
    null
  );
  const [analisisClientes, setAnalisisClientes] =
    useState<AnalisisClientesDto | null>(null);
  const [analisisInventario, setAnalisisInventario] =
    useState<AnalisisInventarioDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardRes, proyeccionRes, clientesRes, inventarioRes] =
        await Promise.allSettled([
          analyticsService.getDashboardKpis(),
          analyticsService.getProyeccionVentas(30),
          analyticsService.getAnalisisClientes(),
          analyticsService.getAnalisisInventario(),
        ]);

      if (dashboardRes.status === "fulfilled") {
        setDashboardData(dashboardRes.value);
      }
      if (proyeccionRes.status === "fulfilled") {
        setProyeccion(proyeccionRes.value);
      }
      if (clientesRes.status === "fulfilled") {
        setAnalisisClientes(clientesRes.value);
      }
      if (inventarioRes.status === "fulfilled") {
        setAnalisisInventario(inventarioRes.value);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      console.error("Error loading analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("es-AR").format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case "Subiendo":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "Bajando":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (nivel: string) => {
    switch (nivel) {
      case "Critica":
      case "Urgente":
        return "destructive";
      case "Advertencia":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Cargando analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadAllData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  const sections = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "proyecciones", name: "Proyecciones", icon: Target },
    { id: "clientes", name: "Clientes", icon: Users },
    { id: "inventario", name: "Inventario", icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analisis de Ventas
          </h1>
          <p className="text-gray-600">
            Sistema completo de análisis de negocio y métricas de rendimiento
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
              <SelectItem value="90">90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`${
                  activeSection === section.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {section.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dashboard Section */}
      {activeSection === "dashboard" && dashboardData && (
        <div className="space-y-6">
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ventas Hoy
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(dashboardData.metricasGenerales.ventasHoy)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(dashboardData.metricasGenerales.ventasSemana)}{" "}
                  esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ganancias Hoy
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.metricasGenerales.gananciasHoy)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(
                    dashboardData.metricasGenerales.gananciasSemana
                  )}{" "}
                  esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Productos Vendidos
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(
                    dashboardData.metricasGenerales.productosVendidosHoy
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(
                    dashboardData.metricasGenerales.productosVendidosMes
                  )}{" "}
                  este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ticket Promedio
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    dashboardData.metricasGenerales.ticketPromedioMes
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.metricasGenerales.ventasPendientes} ventas
                  pendientes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* KPIs Principales */}
          <Card>
            <CardHeader>
              <CardTitle>KPIs Principales</CardTitle>
              <CardDescription>
                Indicadores clave de rendimiento del negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.kpisPrincipales.map((kpi, index) => (
                  <Card
                    key={index}
                    className={kpi.esCritico ? "border-red-200 bg-red-50" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{kpi.nombre}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">
                              {kpi.unidad === "%"
                                ? `${kpi.valor.toFixed(1)}%`
                                : formatNumber(kpi.valor)}
                            </span>
                            {getTrendIcon(kpi.tendencia)}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span
                              className={`text-xs ${
                                kpi.cambioPorcentual >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatPercentage(kpi.cambioPorcentual)}
                            </span>
                            <span className="text-xs text-gray-500">
                              vs anterior
                            </span>
                          </div>
                        </div>
                      </div>
                      {kpi.descripcion && (
                        <p className="text-xs text-gray-600 mt-2">
                          {kpi.descripcion}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          {dashboardData.alertas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alertas del Sistema</CardTitle>
                <CardDescription>
                  Notificaciones importantes que requieren atención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.alertas.slice(0, 5).map((alerta, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg border"
                    >
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alerta.titulo}</h4>
                          <Badge variant={getAlertColor(alerta.nivel) as any}>
                            {alerta.nivel}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {alerta.mensaje}
                        </p>
                        {alerta.accion && (
                          <p className="text-sm text-blue-600 mt-1">
                            <strong>Acción recomendada:</strong> {alerta.accion}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alerta.fecha).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Proyecciones Section */}
      {activeSection === "proyecciones" && proyeccion && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Ventas</CardTitle>
              <CardDescription>
                Predicciones basadas en datos históricos y tendencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Ventas Proyectadas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(proyeccion.ventasProyectadas)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Ganancias Proyectadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(proyeccion.gananciasProyectadas)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Margen de Confianza</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {proyeccion.margenConfianza.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Escenarios de Proyección</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {proyeccion.escenarios.map((escenario, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{escenario.nombre}</h5>
                          <Badge variant="outline">
                            {escenario.probabilidad.toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {escenario.descripcion}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Ventas:</span>
                            <span className="font-medium">
                              {formatCurrency(escenario.ventasProyectadas)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Ganancias:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(escenario.gananciasProyectadas)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clientes Section */}
      {activeSection === "clientes" && analisisClientes && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Clientes</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(analisisClientes.totalClientes)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Clientes Nuevos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(analisisClientes.clientesNuevos)}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Tasa de Retención</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {analisisClientes.tasaRetencion.toFixed(1)}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Valor de Vida</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(analisisClientes.valorVidaPromedio)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Segmentos de Clientes</CardTitle>
              <CardDescription>
                Análisis de comportamiento y segmentación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analisisClientes.segmentos.map((segmento, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{segmento.nombre}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Cantidad:</span>
                          <span className="font-medium">
                            {formatNumber(segmento.cantidad)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>% del total:</span>
                          <span className="font-medium">
                            {segmento.porcentajeTotal.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ticket promedio:</span>
                          <span className="font-medium">
                            {formatCurrency(segmento.ticketPromedio)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Frecuencia:</span>
                          <span className="font-medium">
                            {segmento.frecuenciaCompra.toFixed(1)}/mes
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {segmento.caracteristicas}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventario Section */}
      {activeSection === "inventario" && analisisInventario && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Productos</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(analisisInventario.productosTotales)}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Stock Bajo</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatNumber(analisisInventario.productosStockBajo)}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Sin Stock</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatNumber(analisisInventario.productosSinStock)}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Valor Inventario</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(analisisInventario.valorInventario)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {analisisInventario.alertas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Inventario</CardTitle>
                <CardDescription>
                  Productos que requieren atención inmediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisisInventario.alertas
                    .slice(0, 10)
                    .map((alerta, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">
                              {alerta.productoNombre}
                            </p>
                            <p className="text-sm text-gray-600">
                              {alerta.mensaje}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Stock: {alerta.stockActual}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mín: {alerta.stockMinimo}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticasAdmin;

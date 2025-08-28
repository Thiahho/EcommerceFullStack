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
  BarChart3,
  Download,
  RefreshCw,
  Activity,
  Target,
  Zap,
  Eye,
  Search,
  Calendar,
  Filter,
} from "lucide-react";
import { Input } from "../ui/input";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ✅ Import flexible: soporta funciones sueltas o un objeto service
import * as AnalyticsApi from "@/services/analyticsService";

/* ================= Tipos locales mínimos usados en el componente ================ */
type KpiDto = {
  nombre: string;
  valor: number;
  unidad?: string; // "%" u otra
  tendencia: "Subiendo" | "Bajando" | "Estable" | string;
  cambioPorcentual: number;
  descripcion?: string;
  esCritico?: boolean;
};

type MetricasGeneralesDto = {
  ventasHoy: number;
  ventasSemana: number;
  gananciasHoy: number;
  gananciasSemana: number;
  productosVendidosHoy: number;
  productosVendidosMes: number;
  ticketPromedioMes: number;
  ventasPendientes: number;
};

type AlertaDto = {
  titulo: string;
  mensaje: string;
  nivel: "Critica" | "Urgente" | "Advertencia" | "Info" | string;
  fecha: string;
  accion?: string;
};

type DashboardKpiDto = {
  metricasGenerales: MetricasGeneralesDto;
  kpisPrincipales: KpiDto[];
  alertas: AlertaDto[];
};

type ProyeccionEscenarioDto = {
  nombre: string;
  descripcion?: string;
  probabilidad: number;
  ventasProyectadas: number;
  gananciasProyectadas: number;
};
type ProyeccionVentasDto = {
  ventasProyectadas: number;
  gananciasProyectadas: number;
  margenConfianza: number;
  escenarios: ProyeccionEscenarioDto[];
};

type SegmentoClienteDto = {
  nombre: string;
  cantidad: number;
  porcentajeTotal: number;
  ticketPromedio: number;
  frecuenciaCompra: number;
  caracteristicas?: string;
};
type AnalisisClientesDto = {
  totalClientes: number;
  clientesNuevos: number;
  tasaRetencion: number;
  valorVidaPromedio: number;
  segmentos: SegmentoClienteDto[];
};

type AlertaInventarioDto = {
  productoNombre: string;
  mensaje: string;
  stockActual: number;
  stockMinimo: number;
};
type AnalisisInventarioDto = {
  productosTotales: number;
  productosStockBajo: number;
  productosSinStock: number;
  valorInventario: number;
  alertas: AlertaInventarioDto[];
};

type ActividadRecienteDto = {
  orderId: string;
  createdAtLocal: string; // ISO local
  customerName?: string | null;
  status: string;
  total: number;
};

type VentaDetalleDto = {
  orderId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  createdAtLocal: string;
  status: string;
  total: number;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod?: string;
};

type VentasResumenDto = {
  totalVentasHoy: number;
  cantidadVentasHoy: number;
  ticketPromedio: number;
  ventasMes: number;
  ventas: VentaDetalleDto[];
};
/* =============================================================================== */

// Helper para tomar función exportada o desde objeto { analyticsService }
function pickFn<T extends (...args: any[]) => any>(name: string): T {
  const anyApi = AnalyticsApi as any;
  if (typeof anyApi[name] === "function") return anyApi[name] as T;
  if (
    anyApi.analyticsService &&
    typeof anyApi.analyticsService[name] === "function"
  ) {
    return anyApi.analyticsService[name] as T;
  }
  throw new Error(`Falta exportar ${name} en "@/services/analyticsService"`);
}

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

  const [actividades, setActividades] = useState<ActividadRecienteDto[]>([]);
  const [loadingRecientes, setLoadingRecientes] = useState<boolean>(true);

  // Estados para la sección de ventas
  const [ventasData, setVentasData] = useState<VentasResumenDto | null>(null);
  const [loadingVentas, setLoadingVentas] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterDate, setFilterDate] = useState<string>("");

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

      // Pick de funciones según lo exportado por tu service
      const getDashboardKpis =
        pickFn<() => Promise<DashboardKpiDto>>("getDashboardKpis");
      const getProyeccionVentas = pickFn<
        (dias: number) => Promise<ProyeccionVentasDto>
      >("getProyeccionVentas");
      const getAnalisisClientes = pickFn<() => Promise<AnalisisClientesDto>>(
        "getAnalisisClientes"
      );
      const getAnalisisInventario = pickFn<
        () => Promise<AnalisisInventarioDto>
      >("getAnalisisInventario");

      const loadRecientes = (async () => {
        try {
          setLoadingRecientes(true);
          const getActividadesRecientesHoy = pickFn<
            (limit?: number) => Promise<ActividadRecienteDto[]>
          >("getActividadesRecientesHoy");
          const res = await getActividadesRecientesHoy(20);
          setActividades(Array.isArray(res) ? res : []);
        } catch {
          setActividades([]);
        } finally {
          setLoadingRecientes(false);
        }
      })();

      // Primero cargamos las actividades recientes
      await loadRecientes;

      const loadVentasData = (async () => {
        try {
          setLoadingVentas(true);
          // Obtener datos reales de ventas desde el backend
          const getVentasResumen =
            pickFn<() => Promise<VentasResumenDto>>("getVentasResumen");
          const ventasReales = await getVentasResumen();
          setVentasData(ventasReales);
        } catch (error) {
          console.error("Error al cargar datos de ventas:", error);
          setVentasData(null);
        } finally {
          setLoadingVentas(false);
        }
      })();

      const [dashboardRes, proyeccionRes, clientesRes, inventarioRes] =
        await Promise.allSettled([
          getDashboardKpis(),
          getProyeccionVentas(30),
          getAnalisisClientes(),
          getAnalisisInventario(),
        ]);

      // Después de cargar las actividades, cargamos los datos de ventas
      await loadVentasData;

      if (dashboardRes.status === "fulfilled")
        setDashboardData(dashboardRes.value);
      if (proyeccionRes.status === "fulfilled")
        setProyeccion(proyeccionRes.value);
      if (clientesRes.status === "fulfilled")
        setAnalisisClientes(clientesRes.value);
      if (inventarioRes.status === "fulfilled")
        setAnalisisInventario(inventarioRes.value);
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

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);

  const formatNumber = (value: number): string =>
    new Intl.NumberFormat("es-AR").format(value);

  const formatPercentage = (value: number): string =>
    `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

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

  const getStatusBadgeVariant = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("confirm")) return "secondary";
    if (s.includes("pend")) return "outline";
    if (s.includes("canc") || s.includes("rech")) return "destructive";
    return "secondary";
  };

  const exportToExcel = () => {
    try {
      const currentDate = new Date().toLocaleDateString("es-AR");

      // Preparar datos según la sección activa
      const exportData: any[] = [];
      const fileName = "";
      const sheetName = "";

      switch (activeSection) {
        case "dashboard":
          if (dashboardData) {
            // Hoja 1: Métricas generales
            const metricas = [
              ["Métrica", "Valor"],
              [
                "Ventas Hoy",
                formatCurrency(dashboardData.metricasGenerales.ventasHoy),
              ],
              [
                "Ventas Semana",
                formatCurrency(dashboardData.metricasGenerales.ventasSemana),
              ],
              [
                "Ganancias Hoy",
                formatCurrency(dashboardData.metricasGenerales.gananciasHoy),
              ],
              [
                "Ganancias Semana",
                formatCurrency(dashboardData.metricasGenerales.gananciasSemana),
              ],
              [
                "Productos Vendidos Hoy",
                dashboardData.metricasGenerales.productosVendidosHoy,
              ],
              [
                "Productos Vendidos Mes",
                dashboardData.metricasGenerales.productosVendidosMes,
              ],
              [
                "Ticket Promedio Mes",
                formatCurrency(
                  dashboardData.metricasGenerales.ticketPromedioMes
                ),
              ],
              [
                "Ventas Pendientes",
                dashboardData.metricasGenerales.ventasPendientes,
              ],
            ];

            // Hoja 2: KPIs
            const kpis = [
              [
                "Nombre",
                "Valor",
                "Unidad",
                "Tendencia",
                "Cambio %",
                "Descripción",
                "Es Crítico",
              ],
              ...dashboardData.kpisPrincipales.map((kpi) => [
                kpi.nombre,
                kpi.valor,
                kpi.unidad || "",
                kpi.tendencia,
                kpi.cambioPorcentual,
                kpi.descripcion || "",
                kpi.esCritico ? "Sí" : "No",
              ]),
            ];

            // Hoja 3: Actividades recientes
            const actividadesData = [
              ["ID Orden", "Cliente", "Estado", "Total", "Fecha"],
              ...actividades.map((act) => [
                act.orderId,
                act.customerName || "N/A",
                act.status,
                formatCurrency(act.total),
                new Date(act.createdAtLocal).toLocaleString("es-AR"),
              ]),
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(metricas),
              "Métricas Generales"
            );
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(kpis),
              "KPIs"
            );
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(actividadesData),
              "Actividades Recientes"
            );

            const excelBuffer = XLSX.write(wb, {
              bookType: "xlsx",
              type: "array",
            });
            const data = new Blob([excelBuffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(
              data,
              `Dashboard_Analytics_${currentDate.replace(/\//g, "-")}.xlsx`
            );
          }
          break;

        case "ventas":
          if (ventasData && ventasData.ventas.length > 0) {
            // Hoja 1: Resumen de ventas
            const resumen = [
              ["Métrica", "Valor"],
              ["Total Ventas Hoy", formatCurrency(ventasData.totalVentasHoy)],
              ["Cantidad Ventas Hoy", ventasData.cantidadVentasHoy],
              ["Ticket Promedio", formatCurrency(ventasData.ticketPromedio)],
              ["Ventas del Mes", formatCurrency(ventasData.ventasMes)],
            ];

            // Hoja 2: Detalle de ventas filtradas
            const ventasFiltradas = ventasData.ventas.filter((venta) => {
              const searchMatch =
                searchTerm === "" ||
                venta.orderId
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                (venta.customerName &&
                  venta.customerName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()));

              const statusMatch =
                filterStatus === "todos" ||
                venta.status.toLowerCase().includes(filterStatus.toLowerCase());

              const dateMatch =
                filterDate === "" ||
                venta.createdAtLocal.startsWith(filterDate);

              return searchMatch && statusMatch && dateMatch;
            });

            const ventasDetalle = [
              [
                "ID Orden",
                "Cliente",
                "Email",
                "Estado",
                "Total",
                "Fecha",
                "Método Pago",
                "Productos",
                "Cantidades",
                "Precios",
              ],
              ...ventasFiltradas.map((venta) => [
                venta.orderId,
                venta.customerName || "No disponible",
                venta.customerEmail || "No disponible",
                venta.status,
                formatCurrency(venta.total),
                new Date(venta.createdAtLocal).toLocaleString("es-AR"),
                venta.paymentMethod || "No disponible",
                venta.items.map((item) => item.productName).join("; "),
                venta.items.map((item) => item.quantity).join("; "),
                venta.items
                  .map((item) => formatCurrency(item.price))
                  .join("; "),
              ]),
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(resumen),
              "Resumen Ventas"
            );
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(ventasDetalle),
              "Detalle Ventas"
            );

            const excelBuffer = XLSX.write(wb, {
              bookType: "xlsx",
              type: "array",
            });
            const data = new Blob([excelBuffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(data, `Ventas_${currentDate.replace(/\//g, "-")}.xlsx`);
          }
          break;

        case "proyecciones":
          if (proyeccion) {
            const proyeccionData = [
              ["Métrica", "Valor"],
              [
                "Ventas Proyectadas",
                formatCurrency(proyeccion.ventasProyectadas),
              ],
              [
                "Ganancias Proyectadas",
                formatCurrency(proyeccion.gananciasProyectadas),
              ],
              [
                "Margen de Confianza",
                `${proyeccion.margenConfianza.toFixed(1)}%`,
              ],
            ];

            const escenariosData = [
              [
                "Escenario",
                "Probabilidad %",
                "Ventas Proyectadas",
                "Ganancias Proyectadas",
                "Descripción",
              ],
              ...proyeccion.escenarios.map((esc) => [
                esc.nombre,
                esc.probabilidad.toFixed(0),
                formatCurrency(esc.ventasProyectadas),
                formatCurrency(esc.gananciasProyectadas),
                esc.descripcion || "",
              ]),
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(proyeccionData),
              "Proyección"
            );
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(escenariosData),
              "Escenarios"
            );

            const excelBuffer = XLSX.write(wb, {
              bookType: "xlsx",
              type: "array",
            });
            const data = new Blob([excelBuffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(
              data,
              `Proyecciones_${currentDate.replace(/\//g, "-")}.xlsx`
            );
          }
          break;

        case "clientes":
          if (analisisClientes) {
            const clientesResumen = [
              ["Métrica", "Valor"],
              ["Total Clientes", analisisClientes.totalClientes],
              ["Clientes Nuevos", analisisClientes.clientesNuevos],
              [
                "Tasa Retención",
                `${analisisClientes.tasaRetencion.toFixed(1)}%`,
              ],
              [
                "Valor Vida Promedio",
                formatCurrency(analisisClientes.valorVidaPromedio),
              ],
            ];

            const segmentosData = [
              [
                "Segmento",
                "Cantidad",
                "% del Total",
                "Ticket Promedio",
                "Frecuencia Compra",
                "Características",
              ],
              ...analisisClientes.segmentos.map((seg) => [
                seg.nombre,
                seg.cantidad,
                `${seg.porcentajeTotal.toFixed(1)}%`,
                formatCurrency(seg.ticketPromedio),
                `${seg.frecuenciaCompra.toFixed(1)}/mes`,
                seg.caracteristicas || "",
              ]),
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(clientesResumen),
              "Resumen Clientes"
            );
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(segmentosData),
              "Segmentos"
            );

            const excelBuffer = XLSX.write(wb, {
              bookType: "xlsx",
              type: "array",
            });
            const data = new Blob([excelBuffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(
              data,
              `Analisis_Clientes_${currentDate.replace(/\//g, "-")}.xlsx`
            );
          }
          break;

        case "inventario":
          if (analisisInventario) {
            const inventarioResumen = [
              ["Métrica", "Valor"],
              ["Total Productos", analisisInventario.productosTotales],
              ["Productos Stock Bajo", analisisInventario.productosStockBajo],
              ["Productos Sin Stock", analisisInventario.productosSinStock],
              [
                "Valor Inventario",
                formatCurrency(analisisInventario.valorInventario),
              ],
            ];

            const alertasData =
              analisisInventario.alertas.length > 0
                ? [
                    ["Producto", "Mensaje", "Stock Actual", "Stock Mínimo"],
                    ...analisisInventario.alertas.map((alerta) => [
                      alerta.productoNombre,
                      alerta.mensaje,
                      alerta.stockActual,
                      alerta.stockMinimo,
                    ]),
                  ]
                : [["No hay alertas de inventario"]];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(inventarioResumen),
              "Resumen Inventario"
            );
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet(alertasData),
              "Alertas"
            );

            const excelBuffer = XLSX.write(wb, {
              bookType: "xlsx",
              type: "array",
            });
            const data = new Blob([excelBuffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(
              data,
              `Analisis_Inventario_${currentDate.replace(/\//g, "-")}.xlsx`
            );
          }
          break;

        default:
          alert("No hay datos disponibles para exportar en esta sección");
          return;
      }
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      alert("Error al generar el archivo Excel");
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
    { id: "ventas", name: "Ventas", icon: ShoppingCart },
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
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
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
                {dashboardData.kpisPrincipales.map(
                  (kpi: KpiDto, index: number) => (
                    <Card
                      key={index}
                      className={
                        kpi.esCritico ? "border-red-200 bg-red-50" : ""
                      }
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
                                className={`text-xs ${kpi.cambioPorcentual >= 0 ? "text-green-600" : "text-red-600"}`}
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
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actividades recientes (hoy) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actividades recientes (hoy)</CardTitle>
                <CardDescription>
                  Últimas compras del día con estado y total
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refrescar
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRecientes ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-full animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : actividades.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin movimientos hoy.
                </p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {actividades.map((r: ActividadRecienteDto) => (
                    <div
                      key={r.orderId}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          #{r.orderId} — {r.customerName ?? "Cliente"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.createdAtLocal).toLocaleTimeString(
                            "es-AR"
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={getStatusBadgeVariant(r.status) as any}
                          className="uppercase"
                        >
                          {r.status}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {formatCurrency(r.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  {dashboardData.alertas
                    .slice(0, 5)
                    .map((alerta: AlertaDto, index: number) => (
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
                              <strong>Acción recomendada:</strong>{" "}
                              {alerta.accion}
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

      {/* Proyecciones */}
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
                  {proyeccion.escenarios.map(
                    (escenario: ProyeccionEscenarioDto, index: number) => (
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
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clientes */}
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
                {analisisClientes.segmentos.map(
                  (segmento: SegmentoClienteDto, index: number) => (
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
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventario */}
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
                    .map((alerta: AlertaInventarioDto, index: number) => (
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

      {/* Sección de Ventas */}
      {activeSection === "ventas" && (
        <div className="space-y-6">
          {/* Resumen de Ventas del Día */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Ventas Hoy</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(ventasData?.totalVentasHoy || 0)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Cantidad de Ventas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(ventasData?.cantidadVentasHoy || 0)}
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ticket Promedio</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(ventasData?.ticketPromedio || 0)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ventas del Mes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(ventasData?.ventasMes || 0)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros y Búsqueda</CardTitle>
              <CardDescription>
                Filtra y busca ventas por diferentes criterios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Búsqueda por término */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por orden o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro por estado */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="APPROVED">Confirmados</SelectItem>
                    <SelectItem value="PENDING">Pendientes</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro por fecha */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Botón limpiar filtros */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("todos");
                    setFilterDate("");
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Ventas */}
          <Card>
            <CardHeader>
              <CardTitle>Listado de Ventas</CardTitle>
              <CardDescription>
                Historial detallado de todas las ventas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVentas ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 w-full animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : ventasData && ventasData.ventas.length > 0 ? (
                <div className="space-y-4">
                  {ventasData.ventas
                    .filter((venta) => {
                      // Filtro por término de búsqueda
                      const searchMatch =
                        searchTerm === "" ||
                        venta.orderId
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        (venta.customerName &&
                          venta.customerName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()));

                      // Filtro por estado
                      const statusMatch =
                        filterStatus === "todos" ||
                        venta.status
                          .toLowerCase()
                          .includes(filterStatus.toLowerCase());

                      // Filtro por fecha
                      const dateMatch =
                        filterDate === "" ||
                        venta.createdAtLocal.startsWith(filterDate);

                      return searchMatch && statusMatch && dateMatch;
                    })
                    .map((venta) => (
                      <div
                        key={venta.orderId}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">
                                #{venta.orderId}
                              </h3>
                              <Badge
                                variant={
                                  getStatusBadgeVariant(venta.status) as any
                                }
                              >
                                {venta.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Cliente: {venta.customerName || "No disponible"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Email: {venta.customerEmail || "No disponible"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Fecha:{" "}
                              {new Date(venta.createdAtLocal).toLocaleString(
                                "es-AR"
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(venta.total)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {venta.paymentMethod || "No disponible"}
                            </p>
                          </div>
                        </div>

                        {/* Detalles de productos */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Productos:
                          </p>
                          <div className="space-y-1">
                            {venta.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm text-gray-600"
                              >
                                <span>
                                  {item.productName || "Producto no disponible"}{" "}
                                  (x{item.quantity})
                                </span>

                                <span>
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron ventas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticasAdmin;

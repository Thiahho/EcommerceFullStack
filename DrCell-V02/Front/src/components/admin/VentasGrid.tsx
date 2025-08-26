import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Search,
  Calendar,
  DollarSign,
  FileText,
  Package,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useVenta, useVentas } from "@/hooks/useVentas";
import type { VentaDto } from "@/schemas/ventas";

const ESTADOS = ["all", "APPROVED", "PENDING", "REJECTED"] as const;
type EstadoFiltro = (typeof ESTADOS)[number];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount);
}
function formatDate(dateString: string) {
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? dateString
    : d.toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}
function EstadoBadge({ estado }: { estado: string }) {
  const base =
    "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full";
  if (estado === "APPROVED")
    return (
      <span className={`${base} bg-green-100 text-green-800`}>Aprobada</span>
    );
  if (estado === "PENDING")
    return (
      <span className={`${base} bg-yellow-100 text-yellow-800`}>Pendiente</span>
    );
  if (estado === "REJECTED")
    return <span className={`${base} bg-red-100 text-red-800`}>Rechazada</span>;
  return <span className={`${base} bg-gray-100 text-gray-800`}>{estado}</span>;
}

export default function VentasGrid() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 350);
  const [estado, setEstado] = useState<EstadoFiltro>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError, refetch, isFetching } = useVentas({
    q: debouncedQ,
    estado,
    page,
    pageSize,
  });
  const total = data?.total ?? 0;
  const ventas = data?.items ?? [];

  // Ordena por fecha desc en cliente si el backend no lo hace
  const ventasSorted = useMemo(() => {
    return [...ventas].sort(
      (a, b) =>
        new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime()
    );
  }, [ventas]);

  const [detalleId, setDetalleId] = useState<number | undefined>(undefined);
  const detalle = useVenta(detalleId);

  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center h-64 p-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-600 mb-2">
              Error al cargar datos
            </p>
            <p className="text-gray-500 mb-4">
              No se pudo cargar la lista de ventas
            </p>
            <Button
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const empty = ventasSorted.length === 0;

  return (
    <div className="container mx-auto p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Auditoría de Ventas
          </h1>
          <p className="text-gray-600">
            {total} venta{total !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por ID, Preference ID o Payment ID..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-8"
            />
          </div>
          <Select
            value={estado}
            onValueChange={(v) => {
              setEstado(v as EstadoFiltro);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="APPROVED">Aprobadas</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="REJECTED">Rechazadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estado vacío */}
      {empty ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No se encontraron ventas
          </h3>
          <p className="text-gray-500 max-w-md">
            {q || estado !== "all"
              ? "Ajustá los filtros para encontrar ventas."
              : "Aún no se registraron ventas."}
          </p>
        </div>
      ) : (
        <>
          {/* Grid móvil/tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-4">
            {ventasSorted.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-base">
                        Venta #{v.id}
                      </h4>
                      <div className="mt-1">
                        <EstadoBadge estado={v.estado} />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetalleId(v.id)}
                      className="h-8 w-8 p-0 bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 border-blue-200"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(v.fechaVenta)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        Monto Total:
                      </span>
                    </div>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(v.montoTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Items:</span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {v.items.length} item{v.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Payment ID:</span>
                    <code className="block mt-1 text-xs bg-gray-100 px-2 py-1 rounded break-all">
                      {v.paymentId ?? ""}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla desktop */}
          <div className="hidden xl:block">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ventasSorted.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            #{v.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <EstadoBadge estado={v.estado} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {formatDate(v.fechaVenta)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(v.montoTotal)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {v.items.length} item
                            {v.items.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {v.paymentId ?? ""}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetalleId(v.id)}
                            className="bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 border-blue-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between p-4 border-t">
                <span className="text-sm text-gray-600">
                  Página {page} de {maxPage} • {total} registros
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    «
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                    disabled={page === maxPage}
                  >
                    Siguiente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(maxPage)}
                    disabled={page === maxPage}
                  >
                    »
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalles */}
      <Dialog
        open={Boolean(detalleId)}
        onOpenChange={(open) => {
          if (!open) setDetalleId(undefined);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              Detalles de Venta #{detalle.data?.id ?? detalleId}
            </DialogTitle>
            <DialogDescription>
              Información completa de la venta e items
            </DialogDescription>
          </DialogHeader>

          {detalle.isLoading && (
            <div className="h-32 animate-pulse bg-gray-50 rounded-lg" />
          )}
          {detalle.isError && (
            <p className="text-sm text-red-600">
              Error al cargar los detalles.
            </p>
          )}

          {detalle.data && <VentaDetalle venta={detalle.data} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VentaDetalle({ venta }: { venta: VentaDto }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            Información General
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <EstadoBadge estado={venta.estado} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fecha:</span>
              <span className="text-sm">{formatDate(venta.fechaVenta)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monto Total:</span>
              <span className="text-sm font-semibold text-green-700">
                {formatCurrency(venta.montoTotal)}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            IDs de Referencia
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">Preference ID:</span>
              <code className="block text-xs bg-gray-100 px-2 py-1 rounded mt-1 break-all">
                {venta.preferenceId ?? ""}
              </code>
            </div>
            <div>
              <span className="text-sm text-gray-600">Payment ID:</span>
              <code className="block text-xs bg-gray-100 px-2 py-1 rounded mt-1 break-all">
                {venta.paymentId ?? ""}
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-lg font-semibold mb-2">Items de la Venta</h4>
        <p className="text-sm text-gray-600 mb-4">
          {venta.items.length} item{venta.items.length !== 1 ? "s" : ""}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Item ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Variante ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Precio Unitario
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {venta.items.map((it) => (
                <tr key={it.id}>
                  <td className="px-4 py-2 text-sm">#{it.id}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Variante #{it.varianteId}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {it.cantidad}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {formatCurrency(it.precioUnitario)}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-green-600">
                    {formatCurrency(it.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

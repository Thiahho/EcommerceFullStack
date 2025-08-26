import { useQuery } from "@tanstack/react-query";
import {
  fetchVentaById,
  fetchVentas,
  VentasQuery,
} from "@/services/ventas/ventasService";

export function useVentas(query: VentasQuery) {
  return useQuery({
    queryKey: ["ventas", query],
    queryFn: () => fetchVentas(query),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useVenta(id?: number) {
  return useQuery({
    queryKey: ["venta", id],
    queryFn: () => fetchVentaById(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

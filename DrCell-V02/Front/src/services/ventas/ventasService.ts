import axios from "@/config/axios";
import {
  VentaSchema,
  VentasPageSchema,
  VentaDto,
  VentasPage,
} from "@/schemas/ventas";
import { z } from "zod";
export type VentasQuery = {
  q?: string;
  estado?: "APPROVED" | "PENDING" | "REJECTED" | "all";
  page?: number;
  pageSize?: number;
};

export async function fetchVentas(params: VentasQuery): Promise<VentasPage> {
  const { q = "", estado = "all", page = 1, pageSize = 20 } = params;
  const { data } = await axios.get("/admin/ventas/GetAll", {
    params: {
      q,
      estado: estado === "all" ? undefined : estado,
      page,
      pageSize,
    },
  });

  // Si el backend ya pagina: validar contra VentasPageSchema.
  const parsedPage = VentasPageSchema.safeParse(data);
  if (parsedPage.success) return parsedPage.data;

  // Fallback: backend devuelve array plano.
  const arrParse = z.array(VentaSchema).safeParse(data);
  if (arrParse.success) {
    const start = (page - 1) * pageSize;
    const items = arrParse.data.slice(start, start + pageSize);
    return { items, total: arrParse.data.length, page, pageSize };
  }
  throw new Error("Respuesta de ventas inválida");
}

export async function fetchVentaById(id: number): Promise<VentaDto> {
  const { data } = await axios.get(`/admin/ventas/GetById/${id}`);
  return VentaSchema.parse(data);
}

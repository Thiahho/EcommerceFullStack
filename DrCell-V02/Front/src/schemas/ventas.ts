import { z } from "zod";

export const VentaEstadoSchema = z.enum(["APPROVED", "PENDIENTE", "RECHAZADO"]);
export type VentaEstado = z.infer<typeof VentaEstadoSchema>;

export const VentaItemSchema = z.object({
  id: z.number(),
  ventaId: z.number(),
  varianteId: z.number(),
  cantidad: z.number(),
  precioUnitario: z.number(),
  subtotal: z.number(),
});

export const VentaSchema = z.object({
  id: z.number(),
  preferenceId: z.string().nullable().default(""),
  paymentId: z.string().nullable().default(""),
  montoTotal: z.number(),
  estado: VentaEstadoSchema,
  fechaVenta: z.string(), // ISO
  items: z.array(VentaItemSchema),
});

export type VentaDto = z.infer<typeof VentaSchema>;

export const VentasPageSchema = z.object({
  items: z.array(VentaSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type VentasPage = z.infer<typeof VentasPageSchema>;

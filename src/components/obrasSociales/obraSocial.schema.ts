import { z } from 'zod';

export const obraSocialSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  activo: z.boolean().optional(),
});

export type ObraSocialFormValues = z.infer<typeof obraSocialSchema>;

export interface ObraSocialItem {
  id?: string;
  _id?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  activo?: boolean;
}

export const getObraSocialId = (item: ObraSocialItem) => item.id || item._id || '';

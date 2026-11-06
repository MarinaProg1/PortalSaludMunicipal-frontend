import { z } from 'zod';

export const SEXOS = ['MASCULINO', 'FEMENINO', 'OTRO'] as const;
export const TIPOS_TELEFONO = ['celular', 'fijo', 'trabajo'] as const;

export const pacienteSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio'),
  dni: z.string().regex(/^[0-9]{7,8}$/, 'El DNI debe tener 7 u 8 digitos'),
  sexo: z.enum(SEXOS),
  email: z.string().email('Email invalido'),
  direccion: z.object({
    calle: z.string().trim().min(1, 'La calle es obligatoria'),
    numero: z.coerce.number().int().positive('El numero debe ser un entero positivo'),
    piso: z.string().optional().default(''),
    departamento: z.string().optional().default(''),
    barrio: z.string().optional().default(''),
  }),
  telefono: z.object({
    tipo: z.enum(TIPOS_TELEFONO),
    codigoArea: z.string().trim().min(2, 'Codigo de area invalido'),
    numero: z.string().trim().min(6, 'Numero de telefono invalido'),
  }),
  obraSocial: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.string().length(24, 'Obra social invalida').nullable()
  ),
  numeroAfiliado: z.string().trim().optional().nullable(),
  activo: z.boolean().optional(),
});

export type PacienteFormValues = z.infer<typeof pacienteSchema>;

export interface ObraSocialRef {
  id?: string;
  _id?: string;
  nombre: string;
}

export interface PacienteItem {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  sexo: string;
  email: string;
  direccion?: {
    calle?: string;
    numero?: number;
    piso?: string;
    departamento?: string;
    barrio?: string;
  };
  telefono?: {
    tipo?: string;
    codigoArea?: string;
    numero?: string;
  };
  obraSocial?: string | ObraSocialRef | null;
  numeroAfiliado?: string | null;
  activo?: boolean;
}

export const getPacienteId = (item: PacienteItem) => item.id || item._id || '';

export const getObraSocialRefId = (
  obraSocial: string | ObraSocialRef | null | undefined
): string => {
  if (!obraSocial) return '';
  if (typeof obraSocial === 'string') return obraSocial;
  return obraSocial.id || obraSocial._id || '';
};

export const getObraSocialNombre = (item: PacienteItem): string => {
  if (!item.obraSocial) return 'Sin obra social';
  if (typeof item.obraSocial === 'string') return item.obraSocial;
  return item.obraSocial.nombre || 'Sin obra social';
};

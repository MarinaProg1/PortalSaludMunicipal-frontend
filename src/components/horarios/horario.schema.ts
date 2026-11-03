import { z } from 'zod';

export const horarioFormSchema = z.object({
  medico: z.string().min(1, { message: 'Debe seleccionar un médico.' }),
  diaSemana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'] as const, {
    message: 'Día de la semana inválido.',
  }),

  horaInicio: z.string().regex(/^([0-1]?[0-9]|2?[0-3]):([0-5][0-9])$/, {
    message: 'El formato de la hora de inicio debe ser HH:MM',
  }),
  horaFin: z.string().regex(/^([0-1]?[0-9]|2?[0-3]):([0-5][0-9])$/, {
    message: 'El formato de la hora de fin debe ser HH:MM',
  }),
  duracionTurnoMinutos: z.number().min(5, { message: 'La duración mínima es de 5 minutos.' }),
  activo: z.boolean().default(true),
});


export type HorarioFormValues = z.infer<typeof horarioFormSchema>;

export interface MedicoItem {
  id: string;
  nombre: string;
  apellido: string;
}

export interface TurnoHorario {
  activo: boolean;
  horaInicio: string;
  horaFin: string;
}

export interface DiaConfig {
  seleccionado: boolean;
  manana: TurnoHorario;
  tarde: TurnoHorario;
}

export interface HorarioApiResponse {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMinutos?: number;
}

export interface MedicoInfo {
  _id: string;
  nombre: string;
  apellido: string;
}

export interface HorarioItem {
  id: string;
  medico: MedicoInfo;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMinutos: number;
  activo: boolean;
}

// Estructura agrupada por médico para reportes o listados visuales
export interface MedicoAgrupado {
  medicoId: string;
  medicoNombreCompleto: string;
  horarios: HorarioItem[];
}
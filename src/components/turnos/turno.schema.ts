import { z } from 'zod';


export const turnoFormSchema = z.object({
  paciente: z.string().min(1, { message: 'Debe seleccionar un paciente.' }),
  medico: z.string().min(1, { message: 'Debe seleccionar un médico.' }),
  especialidad: z.string().min(1, { message: 'Debe seleccionar una especialidad.' }),
  fecha: z.string().min(1, { message: 'La fecha es obligatoria.' }),
  hora: z.string().min(1, { message: 'Debe seleccionar un horario disponible.' }),
  estado: z.enum(['pendiente', 'confirmado', 'cancelado', 'finalizado', 'atendido']).default('pendiente'),
});

export type TurnoFormValues = z.infer<typeof turnoFormSchema>;

export interface OptionItem {
  id?: string;
  _id?: string;
  nombre: string;
  apellido?: string;
  razonSocial?: string;
}

export interface MedicoItem extends OptionItem {
  especialidades?: OptionItem[];
}

export interface HorarioAtencionItem {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMinutos: number;
  activo?: boolean;
}

export interface TurnoFormProps {
  turnoId?: string; 
  onSuccess?: () => void; 
  onCancel?: () => void;  
}

export interface TurnoDetalle {
  id: string;
  paciente: {
    nombre: string;
    apellido: string;
    dni?: string;
  };
  medico: {
    nombre: string;
    apellido: string;
  };
  especialidad: {
    nombre: string;
  };
  fecha: string;
  hora: string;
  estado: string;
}

export interface TurnoItem {
  id: string;
  medico?: {
    id: string; 
    nombre: string;
    apellido: string;
  };
  paciente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  especialidad?: {
    id: string;
    nombre: string;
  };
  fecha: string;
  hora: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'ATENDIDO';
  activo: boolean;
}
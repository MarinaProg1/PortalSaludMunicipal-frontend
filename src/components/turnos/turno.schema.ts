import type { ReactNode } from 'react';
import { z } from 'zod';

export const turnoFormSchema = z.object({
  paciente: z.string().min(1, { message: 'Debe seleccionar un paciente.' }),
  medico: z.string().min(1, { message: 'Debe seleccionar un médico.' }),
  especialidad: z.string().min(1, { message: 'Debe seleccionar una especialidad.' }),
  fecha: z.string().min(1, { message: 'La fecha es obligatoria.' }),
  hora: z.string().min(1, { message: 'Debe seleccionar un horario disponible.' }),
  estado: z
    .enum(['pendiente', 'confirmado', 'cancelado', 'finalizado', 'atendido'])
    .default('pendiente'),
});

export type TurnoFormValues = z.infer<typeof turnoFormSchema>;

export type EstadoTurnoSchema =
  | 'pendiente'
  | 'confirmado'
  | 'cancelado'
  | 'finalizado'
  | 'atendido'
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'FINALIZADO'
  | 'ATENDIDO';

export interface OptionItem {
  id?: string;
  _id?: string;
  nombre: string;
  apellido?: string;
  razonSocial?: string;
}

export interface MedicoItem {
  id: string;
  _id?: string;
  nombre: string;
  apellido?: string;
  especialidades?: OptionItem[];
}

export interface PacienteTurnoObjeto {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  dni?: string;
}

export type PacienteTurnoValor = string | PacienteTurnoObjeto;

export interface TurnoDetalle {
  id: string;
  _id?: string;
  paciente: PacienteTurnoValor;
  pacienteTexto?: string | null;
  pacienteNombre?: string;
  esUrgencia?: boolean;
  medico: {
    id?: string;
    _id?: string;
    nombre: string;
    apellido: string;
  };
  especialidad: {
    id?: string;
    _id?: string;
    nombre: string;
  };
  fecha: string;
  hora: string;
  estado: EstadoTurnoSchema | string;
  observaciones?: string;
}

export interface TurnoItem {
  id: string;
  _id?: string;
  medico?: {
    id?: string;
    _id?: string;
    nombre: string;
    apellido: string;
  };
  paciente?: PacienteTurnoValor;
  pacienteTexto?: string | null;
  pacienteNombre?: string;
  esUrgencia?: boolean;
  especialidad?: {
    id?: string;
    _id?: string;
    nombre: string;
  };
  fecha: string;
  hora: string;
  estado: EstadoTurnoSchema;
  observaciones?: string;
  // true cuando el turno sigue pendiente/confirmado pero su fecha ya pasó.
  vencido?: boolean;
  activo: boolean;
}

export interface PacienteItem {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?:
    | string
    | {
        tipo?: string;
        codigoArea?: string;
        numero?: string;
      };
  email?: string;
}

export interface EspecialidadItem {
  id?: string;
  _id?: string;
  nombre: string;
}

export interface DiaMesDisponibilidad {
  fecha: string; // "2026-11-01"
  diaNum: number;
  tieneDisponibilidad: boolean;
  totalLibres: number;
}

export interface CalendarioMensualProps {
  titulo?: string;
  anio?: number;
  mes?: number;
  dias?: DiaMesDisponibilidad[];
  fechaSeleccionada?: string;
  loading?: boolean;
  onCambiarMes?: (direccion: 'prev' | 'next') => void;
  onSeleccionarFecha?: (fecha: string) => void;
}

export interface HorariosDisponiblesProps {
  fecha: string;
  todosLosSlots: string[];
  horariosDisponibles: string[];
  loading: boolean;
  onSeleccionar: (hora: string) => void;
}

export interface TurnoFormProps {
  turnoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface TurnoCardProps {
  turno: TurnoItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancel?: () => void;
  onMarkAttended: () => void;
}

export interface TurnoSelectOption {
  value: string;
  label: string;
}

export interface TurnoSelectFieldProps {
  label: string;
  value: string;
  options: TurnoSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
  selectClassName?: string;
  labelIcon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  helpText?: ReactNode;
}
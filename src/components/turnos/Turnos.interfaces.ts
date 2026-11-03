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
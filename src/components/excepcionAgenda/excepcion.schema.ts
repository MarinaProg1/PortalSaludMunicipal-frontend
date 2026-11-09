export interface MedicoPopulate {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  especialidad?: string | { nombre: string };
}

export interface ExcepcionItem {
  id: string;
  medico: MedicoPopulate | string;
  fecha: string;
  tipo: 'MODIFICACION_HORARIO' | 'DIA_NO_LABORABLE' | 'VACACIONES' | string;
  horaInicio?: string;
  horaFin?: string;
  duracionTurnoMinutos?: number;
  motivo: string;
  activo: boolean;
}
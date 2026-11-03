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

// Estructura agrupada por médico
export interface MedicoAgrupado {
  medicoId: string;
  medicoNombreCompleto: string;
  horarios: HorarioItem[];
}

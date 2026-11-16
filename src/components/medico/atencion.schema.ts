// Tipos del flujo de atencion del rol MEDICO.
// El backend deriva la agenda de Turno y expone dos bandejas:
//   por-atender -> pendiente + confirmado
//   atendidos   -> atendido + finalizado
// La IA solo devuelve texto orientativo; nunca persiste nada por si sola.

export type Bandeja = 'por-atender' | 'atendidos';

export const BANDEJAS: { id: Bandeja; label: string; descripcion: string }[] = [
  {
    id: 'por-atender',
    label: 'Por atender',
    descripcion: 'Turnos pendientes y confirmados del profesional.',
  },
  {
    id: 'atendidos',
    label: 'Atendidos',
    descripcion: 'Turnos atendidos y finalizados con su consulta clinica.',
  },
];

export interface RefItem {
  id?: string;
  _id?: string;
  nombre?: string;
  apellido?: string;
}

export interface PacienteTurnoRef {
  id?: string;
  _id?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: {
    codigoArea?: string;
    numero?: string;
  };
  obraSocial?: { razonSocial?: string } | string | null;
}

export interface TurnoAtencion {
  id?: string;
  _id?: string;
  paciente?: PacienteTurnoRef | string | null;
  medico?: RefItem | string | null;
  especialidad?: RefItem | string | null;
  fecha: string;
  hora: string;
  estado: string;
  observaciones?: string;
  vencido?: boolean;
  activo?: boolean;
}

export interface HistorialItem {
  _id?: string;
  descripcion?: string;
  fechaDeCreacion?: string;
}

// Subdocumentos embebidos: el backend guarda { descripcion, fechaDeCreacion }.
export interface HistorialClinico {
  id?: string;
  _id?: string;
  paciente?: PacienteTurnoRef | string | null;
  grupoSanguineo?: string;
  alergias?: HistorialItem[];
  enfermedadesCronicas?: HistorialItem[];
  medicacionActual?: HistorialItem[];
  antecedentesFamiliares?: string;
  antecedentesQuirurgicos?: string;
  habitos?: {
    tabaquismo?: boolean;
    alcoholismo?: boolean;
    drogas?: boolean;
  };
  observacionesGenerales?: string;
}

export interface ConsultaMedica {
  id?: string;
  _id?: string;
  paciente?: PacienteTurnoRef | string | null;
  medico?: RefItem | string | null;
  turno?: string | { id?: string; _id?: string } | null;
  fecha?: string;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  estado?: string;
}

export interface ConsultaPayload {
  paciente: string;
  turno?: string;
  motivo: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  estado: 'pendiente' | 'atendida' | 'cancelada';
}

export const getRefId = (
  valor: string | { id?: string; _id?: string } | null | undefined
): string => {
  if (!valor) return '';
  if (typeof valor === 'string') return valor;
  return valor.id || valor._id || '';
};

export const getTurnoId = (turno: TurnoAtencion): string => turno.id || turno._id || '';

export const getPacienteIdDeTurno = (turno: TurnoAtencion): string => getRefId(turno.paciente);

export const nombrePaciente = (turno: TurnoAtencion): string => {
  if (!turno.paciente || typeof turno.paciente === 'string') return 'Paciente';
  const nombre = `${turno.paciente.apellido || ''}, ${turno.paciente.nombre || ''}`.trim();
  return nombre.replace(/^,\s*/, '') || 'Paciente';
};

export const dniPaciente = (turno: TurnoAtencion): string => {
  if (!turno.paciente || typeof turno.paciente === 'string') return '';
  return turno.paciente.dni || '';
};

export const nombreEspecialidad = (turno: TurnoAtencion): string => {
  if (!turno.especialidad || typeof turno.especialidad === 'string') return '-';
  return turno.especialidad.nombre || '-';
};

export const esEstadoActivo = (estado: string | undefined): boolean => {
  const normalizado = (estado || '').toUpperCase();
  return normalizado === 'PENDIENTE' || normalizado === 'CONFIRMADO';
};

// Fecha + hora del turno como Date local, para ordenar y comparar.
export const fechaHoraTurno = (turno: TurnoAtencion): Date => {
  const [anio, mes, dia] = (turno.fecha || '').slice(0, 10).split('-').map(Number);
  const [hora, minuto] = (turno.hora || '00:00').split(':').map(Number);
  return new Date(anio || 0, (mes || 1) - 1, dia || 1, hora || 0, minuto || 0);
};

export const descripciones = (items: HistorialItem[] | undefined): string[] =>
  (Array.isArray(items) ? items : [])
    .map((item) => (item?.descripcion || '').trim())
    .filter(Boolean);

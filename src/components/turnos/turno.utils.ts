import type { TurnoItem } from './turno.schema';

export type EstadoTurnoNormalizado =
  | 'pendiente'
  | 'confirmado'
  | 'cancelado'
  | 'finalizado'
  | 'atendido';

export type PacienteTurnoValor = string | TurnoItem['paciente'];

export interface TurnoConUrgencia extends Omit<TurnoItem, 'paciente' | 'estado'> {
  _id?: string;
  paciente?: PacienteTurnoValor;
  pacienteTexto?: string | null;
  pacienteNombre?: string;
  esUrgencia?: boolean;
  tieneConsulta?: boolean;
  vencido?: boolean;
  estado: TurnoItem['estado'] | Lowercase<TurnoItem['estado']>;
}

const ESTADOS_VALIDOS: readonly EstadoTurnoNormalizado[] = [
  'pendiente',
  'confirmado',
  'cancelado',
  'finalizado',
  'atendido',
];

export const normalizarEstadoTurno = (estado?: string): EstadoTurnoNormalizado => {
  const limpio = String(estado || 'pendiente').trim().toLowerCase() as EstadoTurnoNormalizado;
  return ESTADOS_VALIDOS.includes(limpio) ? limpio : 'pendiente';
};

export const obtenerIdTurno = (
  turno: { id?: string; _id?: string },
  fallback = ''
): string => String(turno.id || turno._id || fallback);

export const formatearFechaTurno = (fecha: string): string => {
  if (!fecha) return '';
  return fecha.split('T')[0];
};

export const formatearFechaCortaAR = (fecha: string): string => {
  const iso = formatearFechaTurno(fecha);
  if (!iso || !iso.includes('-')) return fecha;
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
};

export const esFechaDeHoy = (fecha: string): boolean => {
  if (!fecha) return false;

  const hoy = new Date();
  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-');

  return formatearFechaTurno(fecha) === fechaHoy;
};

const esIdMongoHex = (valor: string): boolean => /^[0-9a-fA-F]{24}$/.test(valor.trim());

export const obtenerNombrePacienteTurno = (turno: TurnoConUrgencia): string => {
  if (typeof turno.pacienteNombre === 'string' && turno.pacienteNombre.trim()) {
    return turno.pacienteNombre.trim();
  }
  if (typeof turno.pacienteTexto === 'string' && turno.pacienteTexto.trim()) {
    return turno.pacienteTexto.trim();
  }
  if (typeof turno.paciente === 'string' && turno.paciente.trim()) {
    const texto = turno.paciente.trim();
    if (!turno.esUrgencia && esIdMongoHex(texto)) {
      return 'Paciente sin datos';
    }
    return texto;
  }
  if (turno.paciente && typeof turno.paciente === 'object') {
    const apellido = turno.paciente.apellido || '';
    const nombre = turno.paciente.nombre || '';
    return `${apellido}${apellido && nombre ? ', ' : ''}${nombre}`.trim() || 'Paciente sin datos';
  }
  return 'Paciente';
};

export const normalizarTurnoParaCard = (turno: TurnoConUrgencia): TurnoItem => {
  const nombreResuelto = obtenerNombrePacienteTurno(turno);
  const estadoNormalizado = normalizarEstadoTurno(turno.estado);
  const esPacienteTexto =
    typeof turno.paciente === 'string' ||
    Boolean(turno.pacienteTexto) ||
    Boolean(turno.esUrgencia);

  const base: TurnoItem = {
    ...(turno as unknown as TurnoItem),
    id: obtenerIdTurno(turno),
    estado: estadoNormalizado.toUpperCase() as TurnoItem['estado'],
    pacienteNombre: nombreResuelto,
  };

  if (esPacienteTexto) {
    return {
      ...base,
      esUrgencia: true,
      paciente: {
        nombre: nombreResuelto,
        apellido: '',
      },
    };
  }

  return base;
};
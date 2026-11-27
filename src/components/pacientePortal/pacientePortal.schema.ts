export interface ObraSocialPerfil {
  razonSocial?: string;
  nombre?: string;
}

export interface MiPerfil {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  sexo?: string;
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
  obraSocial?: ObraSocialPerfil | string | null;
  numeroAfiliado?: string | null;
}

export interface MiTurno {
  id?: string;
  _id?: string;
  medico?: {
    nombre?: string;
    apellido?: string;
  };
  especialidad?: {
    nombre?: string;
  };
  fecha: string;
  hora: string;
  estado: string;
  observaciones?: string;
}

export const getObraSocialPerfilNombre = (perfil: MiPerfil): string => {
  if (!perfil.obraSocial) return 'Sin obra social';
  if (typeof perfil.obraSocial === 'string') return perfil.obraSocial;
  return perfil.obraSocial.razonSocial || perfil.obraSocial.nombre || 'Sin obra social';
};

export const formatearFecha = (fecha: string): string => {
  if (!fecha) return '-';
  const soloFecha = fecha.slice(0, 10).split('-');
  if (soloFecha.length !== 3) return fecha;
  const [anio, mes, dia] = soloFecha;
  return `${dia}/${mes}/${anio}`;
};

export const estadoTurnoClase = (estado: string): string => {
  switch ((estado || '').toUpperCase()) {
    case 'CONFIRMADO':
      return 'bg-success-subtle text-success';
    case 'PENDIENTE':
      return 'bg-warning-subtle text-warning-emphasis';
    case 'ATENDIDO':
    case 'FINALIZADO':
      return 'bg-primary-subtle text-primary';
    case 'CANCELADO':
      return 'bg-danger-subtle text-danger';
    default:
      return 'bg-secondary-subtle text-secondary';
  }
};

export interface NuevoTurnoPaciente {
  medico: string;
  especialidad: string;
  fecha: string;
  hora: string;
  observaciones?: string;
}

export interface ConsultaTurno {
  id?: string;
  _id?: string;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  estado?: string;
  fecha?: string;
  medico?: {
    nombre?: string;
    apellido?: string;
  };
}

export interface DetalleTurnoPaciente {
  turno: MiTurno;
  consulta: ConsultaTurno | null;
}

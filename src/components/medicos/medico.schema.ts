export interface EspecialidadRef {
  id?: string;
  _id?: string;
  nombre: string;
}

export interface MedicoDireccion {
  calle?: string;
  numero?: number;
  piso?: string;
  departamento?: string;
  barrio?: string;
}

export interface MedicoTelefono {
  tipo?: string;
  codigoArea?: string;
  numero?: string;
}

export interface MedicoItem {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  numeroMatricula: number;
  especialidades?: Array<string | EspecialidadRef>;
  direccion?: MedicoDireccion;
  telefono?: MedicoTelefono;
  obraSocial?: string | { _id?: string; id?: string; nombre?: string } | null;
  activo?: boolean;
}

/** Payload que espera el backend (POST /medicos y PUT /medicos/:id). */
export interface MedicoPayload {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  numeroMatricula: number;
  especialidades: string[];
  direccion: {
    calle: string;
    numero: number;
    piso?: string;
    departamento?: string;
    barrio?: string;
  };
  telefono: {
    tipo: string;
    codigoArea: string;
    numero: string;
  };
  obraSocial?: string | null;
  activo?: boolean;
  user?: string;
  password?: string;
}

export const getMedicoId = (item: MedicoItem) => item.id || item._id || '';

export const getEspecialidadesNombres = (item: MedicoItem): string[] => {
  if (!Array.isArray(item.especialidades)) return [];
  return item.especialidades
    .map((e) => (typeof e === 'string' ? e : e.nombre))
    .filter((nombre): nombre is string => Boolean(nombre));
};

export const getEspecialidadIds = (item: MedicoItem): string[] => {
  if (!Array.isArray(item.especialidades)) return [];
  return item.especialidades
    .map((e) => (typeof e === 'string' ? e : e.id || e._id || ''))
    .filter((id): id is string => Boolean(id));
};

export const getObraSocialNombre = (item: MedicoItem): string => {
  if (!item.obraSocial) return '';
  if (typeof item.obraSocial === 'string') return item.obraSocial;
  return item.obraSocial.nombre || '';
};

export const getTelefonoTexto = (item: MedicoItem): string => {
  if (!item.telefono) return '';
  return [item.telefono.codigoArea, item.telefono.numero].filter(Boolean).join(' ').trim();
};

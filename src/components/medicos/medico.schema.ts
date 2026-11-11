export interface EspecialidadRef {
  id?: string;
  _id?: string;
  nombre: string;
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
  obraSocial?: string | { nombre?: string } | null;
  activo?: boolean;
}

export const getMedicoId = (item: MedicoItem) => item.id || item._id || '';

export const getEspecialidadesNombres = (item: MedicoItem): string[] => {
  if (!Array.isArray(item.especialidades)) return [];
  return item.especialidades
    .map((e) => (typeof e === 'string' ? e : e.nombre))
    .filter((nombre): nombre is string => Boolean(nombre));
};

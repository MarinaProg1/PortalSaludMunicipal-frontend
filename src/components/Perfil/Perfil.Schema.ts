export interface TokenPayload {
  id?: string;
  _id?: string;
  nombre?: string;
  apellido?: string;
  telefono?: {
    tipo?: string;
    codigoArea?: string;
    numero?: string;
  };
  email?: string;
  matricula?: string;
  rol?: string;
}

export interface PerfilState {
  nombre: string;
  apellido: string;
  telefono?: {
    tipo?: string;
    codigoArea?: string;
    numero?: string;
  };
  email: string;
  matricula: string;
  rol: string;
}

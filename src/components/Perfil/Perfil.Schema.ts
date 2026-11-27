export interface TelefonoPerfil {
  tipo?: string;
  codigoArea?: string;
  numero?: string;
}

export interface TokenPayload {
  id?: string;
  _id?: string;
  nombre?: string;
  apellido?: string;
  telefono?: TelefonoPerfil | string;
  email?: string;
  matricula?: string;
  rol?: string;
}

export interface PerfilState {
  nombre: string;
  apellido: string;
  telefono?: TelefonoPerfil;
  email: string;
  matricula: string;
  rol: string;
}

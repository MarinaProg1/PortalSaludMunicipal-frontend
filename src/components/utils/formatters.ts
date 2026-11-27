// src/utils/formatters.ts

export interface TelefonoObj {
  tipo?: string;
  codigoArea?: string;
  numero?: string;
}

export const formatearTelefono = (telefono?: string | TelefonoObj): string => {
  if (!telefono) return 'Sin teléfono';

  // Si por alguna razón viene como texto plano
  if (typeof telefono === 'string') {
    return telefono;
  }

  // Si viene como objeto desde el backend de Mongoose
  if (typeof telefono === 'object') {
    const { codigoArea, numero } = telefono;
    if (codigoArea && numero) {
      return `(${codigoArea}) ${numero}`;
    }
    return numero || codigoArea || 'Teléfono no especificado';
  }

  return 'Teléfono inválido';
};
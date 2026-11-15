import { isAxiosError } from 'axios';
import clientesAxios from '../config/axios';
import type {
  Bandeja,
  ConsultaMedica,
  ConsultaPayload,
  HistorialClinico,
  TurnoAtencion,
} from '../components/medico/atencion.schema';

function extractData<T>(response: any): T {
  const d = response?.data;
  if (Array.isArray(d)) return d as T;
  if (d && d.data !== undefined) return d.data as T;
  return d as T;
}

export const atencionService = {
  // Bandeja de turnos del medico autenticado (el backend filtra por su ficha).
  async bandeja(bandeja: Bandeja): Promise<TurnoAtencion[]> {
    const res = await clientesAxios.get('/turnos', { params: { bandeja } });
    const data = extractData<TurnoAtencion[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async turno(id: string): Promise<TurnoAtencion> {
    const res = await clientesAxios.get(`/turnos/${id}`);
    return extractData<TurnoAtencion>(res);
  },

  // Devuelve null cuando el paciente todavia no tiene historial (404 del backend).
  async historial(pacienteId: string): Promise<HistorialClinico | null> {
    try {
      const res = await clientesAxios.get(`/historiales/paciente/${pacienteId}`);
      return extractData<HistorialClinico>(res);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async consultas(filtros: { paciente?: string; turno?: string }): Promise<ConsultaMedica[]> {
    const res = await clientesAxios.get('/consultasmedicas', { params: filtros });
    const data = extractData<ConsultaMedica[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async crearConsulta(payload: ConsultaPayload): Promise<ConsultaMedica> {
    const res = await clientesAxios.post('/consultasmedicas', payload);
    return extractData<ConsultaMedica>(res);
  },

  async actualizarConsulta(id: string, payload: Partial<ConsultaPayload>): Promise<ConsultaMedica> {
    const res = await clientesAxios.put(`/consultasmedicas/${id}`, payload);
    return extractData<ConsultaMedica>(res);
  },

  async sugerirIA(payload: {
    pacienteId: string;
    motivo?: string;
    sintomas?: string;
  }): Promise<string> {
    const res = await clientesAxios.post('/ia/sugerir', payload);
    const data = extractData<{ sugerencia?: string }>(res);
    return data?.sugerencia || '';
  },

  async marcarAtendido(id: string): Promise<TurnoAtencion> {
    const res = await clientesAxios.patch(`/turnos/${id}/atendido`);
    return extractData<TurnoAtencion>(res);
  },
};

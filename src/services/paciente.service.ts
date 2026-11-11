import clientesAxios from '../config/axios';
import type {
  PacienteFormValues,
  PacienteHistorial,
  PacienteItem,
} from '../components/pacientes/paciente.schema';

const BASE = '/pacientes';

function extractData<T>(response: any): T {
  const d = response?.data;
  if (Array.isArray(d)) return d as T;
  if (d && Array.isArray(d.data)) return d.data as T;
  if (d && d.data !== undefined) return d.data as T;
  return d as T;
}

export const pacienteService = {
  async listar(params?: { dni?: string; obraSocial?: string }): Promise<PacienteItem[]> {
    const res = await clientesAxios.get(BASE, { params });
    return extractData<PacienteItem[]>(res) || [];
  },

  async obtener(id: string): Promise<PacienteItem> {
    const res = await clientesAxios.get(`${BASE}/${id}`);
    return extractData<PacienteItem>(res);
  },

  async historial(id: string, historial = false): Promise<PacienteHistorial> {
    const res = await clientesAxios.get(`${BASE}/${id}/turnos`, {
      params: historial ? { historial: true } : undefined,
    });
    const data = extractData<PacienteHistorial>(res);
    return {
      turnos: Array.isArray(data?.turnos) ? data.turnos : [],
      consultas: Array.isArray(data?.consultas) ? data.consultas : [],
    };
  },

  async crear(data: PacienteFormValues): Promise<unknown> {
    const res = await clientesAxios.post(BASE, data);
    return res.data;
  },

  async actualizar(id: string, data: Partial<PacienteFormValues>): Promise<PacienteItem> {
    const res = await clientesAxios.put(`${BASE}/${id}`, data);
    return extractData<PacienteItem>(res);
  },

  async eliminar(id: string): Promise<void> {
    await clientesAxios.delete(`${BASE}/${id}`);
  },
};

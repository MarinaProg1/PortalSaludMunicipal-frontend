import clientesAxios from '../config/axios';
import type { MedicoItem, MedicoPayload } from '../components/medicos/medico.schema';

const BASE = '/medicos';

function extractData<T>(response: any): T {
  const d = response?.data;
  if (Array.isArray(d)) return d as T;
  if (d && Array.isArray(d.data)) return d.data as T;
  if (d && d.data !== undefined) return d.data as T;
  return d as T;
}

export const medicoService = {
  async listar(): Promise<MedicoItem[]> {
    const res = await clientesAxios.get(BASE, { params: { limit: 1000 } });
    return extractData<MedicoItem[]>(res) || [];
  },

  async obtener(id: string): Promise<MedicoItem | null> {
    const res = await clientesAxios.get(`${BASE}/${id}`);
    return extractData<MedicoItem>(res) || null;
  },

  async crear(payload: MedicoPayload): Promise<MedicoItem> {
    const res = await clientesAxios.post(BASE, payload);
    const data = extractData<any>(res);
    return (data?.medico || data) as MedicoItem;
  },

  async actualizar(id: string, payload: Partial<MedicoPayload>): Promise<MedicoItem> {
    const res = await clientesAxios.put(`${BASE}/${id}`, payload);
    return extractData<MedicoItem>(res);
  },

  async eliminar(id: string): Promise<void> {
    await clientesAxios.delete(`${BASE}/${id}`);
  },
};

import clientesAxios from '../config/axios';
import type { MedicoItem } from '../components/medicos/medico.schema';

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
};

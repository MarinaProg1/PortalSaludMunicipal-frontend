import clientesAxios from '../config/axios';
import type { ObraSocialFormValues, ObraSocialItem } from '../components/obrasSociales/obraSocial.schema';

const BASE = '/obrasociales';

function extractData<T>(response: any): T {
  const d = response?.data;
  if (Array.isArray(d)) return d as T;
  if (d && Array.isArray(d.data)) return d.data as T;
  if (d && Array.isArray(d.obras)) return d.obras as T;
  if (d && d.data !== undefined) return d.data as T;
  return d as T;
}

export const obraSocialService = {
  async listar(todas = false): Promise<ObraSocialItem[]> {
    const res = await clientesAxios.get(BASE, { params: todas ? { todas: 'true' } : {} });
    return extractData<ObraSocialItem[]>(res) || [];
  },

  async obtener(id: string): Promise<ObraSocialItem> {
    const res = await clientesAxios.get(`${BASE}/${id}`);
    return extractData<ObraSocialItem>(res);
  },

  async crear(data: ObraSocialFormValues): Promise<ObraSocialItem> {
    const payload = { ...data, email: data.email || undefined, telefono: data.telefono || undefined };
    const res = await clientesAxios.post(BASE, payload);
    return extractData<ObraSocialItem>(res);
  },

  async actualizar(id: string, data: Partial<ObraSocialFormValues>): Promise<ObraSocialItem> {
    const payload = { ...data, email: data.email || undefined, telefono: data.telefono || undefined };
    const res = await clientesAxios.put(`${BASE}/${id}`, payload);
    return extractData<ObraSocialItem>(res);
  },

  async eliminar(id: string): Promise<void> {
    await clientesAxios.delete(`${BASE}/${id}`);
  },
};

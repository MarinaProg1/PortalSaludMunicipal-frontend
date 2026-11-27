import clientesAxios from '../config/axios';
import type { DetalleTurnoPaciente, MiPerfil, MiTurno, NuevoTurnoPaciente } from '../components/pacientePortal/pacientePortal.schema';
import { parsePaginatedResponse, type PaginatedResult } from '../utils/pagination';

export const pacientePortalService = {
  async miPerfil(): Promise<MiPerfil> {
    const res = await clientesAxios.get('/pacientes/me');
    return res.data?.data as MiPerfil;
  },

  async misTurnos(historial = false): Promise<MiTurno[]> {
    const res = await clientesAxios.get('/turnos/mis-turnos', {
      params: historial ? { historial: true } : undefined,
    });
    const data = res.data?.data;
    return Array.isArray(data) ? (data as MiTurno[]) : [];
  },

  async misTurnosPaginados(
    historial: boolean,
    page: number,
    limit: number
  ): Promise<PaginatedResult<MiTurno>> {
    const res = await clientesAxios.get('/turnos/mis-turnos', {
      params: { ...(historial ? { historial: true } : {}), page, limit },
    });
    return parsePaginatedResponse<MiTurno>(res.data, page, limit, ['turnos']);
  },

  async sacarTurno(payload: NuevoTurnoPaciente): Promise<MiTurno> {
    const res = await clientesAxios.post('/turnos/mis-turnos', payload);
    return res.data?.data as MiTurno;
  },

  async miTurno(id: string): Promise<DetalleTurnoPaciente> {
    const res = await clientesAxios.get(`/turnos/mis-turnos/${id}`);
    return res.data?.data as DetalleTurnoPaciente;
  },
};

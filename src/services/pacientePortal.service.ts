import clientesAxios from '../config/axios';
import type { MiPerfil, MiTurno, NuevoTurnoPaciente } from '../components/pacientePortal/pacientePortal.schema';

export const pacientePortalService = {
  async miPerfil(): Promise<MiPerfil> {
    const res = await clientesAxios.get('/pacientes/me');
    return res.data?.data as MiPerfil;
  },

  async misTurnos(): Promise<MiTurno[]> {
    const res = await clientesAxios.get('/turnos/mis-turnos');
    const data = res.data?.data;
    return Array.isArray(data) ? (data as MiTurno[]) : [];
  },

  async sacarTurno(payload: NuevoTurnoPaciente): Promise<MiTurno> {
    const res = await clientesAxios.post('/turnos/mis-turnos', payload);
    return res.data?.data as MiTurno;
  },
};

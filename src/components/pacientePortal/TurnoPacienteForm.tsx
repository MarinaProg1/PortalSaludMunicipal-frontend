import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { BsCalendarPlus, BsCheckCircle } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { pacientePortalService } from '../../services/pacientePortal.service';
import type { HorarioAtencionItem, MedicoItem, OptionItem } from '../turnos/turno.schema';

const DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const extraerArray = (responseData: unknown): any[] => {
  if (Array.isArray(responseData)) return responseData;
  if (responseData && typeof responseData === 'object') {
    const record = responseData as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
};

const generarBloquesHorarios = (horaInicio: string, horaFin: string, duracionMinutos: number): string[] => {
  const bloques: string[] = [];
  const [hInicio, mInicio] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);

  let minutosActuales = hInicio * 60 + mInicio;
  const minutosFin = hFin * 60 + mFin;
  const duracion = duracionMinutos && duracionMinutos > 0 ? duracionMinutos : 30;

  while (minutosActuales < minutosFin) {
    const horas = Math.floor(minutosActuales / 60);
    const minutos = minutosActuales % 60;
    bloques.push(`${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`);
    minutosActuales += duracion;
  }

  return bloques;
};

const hoyISO = (): string => {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
};

export const TurnoPacienteForm: React.FC = () => {
  const navigate = useNavigate();

  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<OptionItem[]>([]);
  const [horariosMedico, setHorariosMedico] = useState<HorarioAtencionItem[]>([]);

  const [formData, setFormData] = useState({
    medico: '',
    especialidad: '',
    fecha: '',
    hora: '',
    observaciones: '',
  });

  const [loadingMedicos, setLoadingMedicos] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingMedicos(true);
        const res = await clientesAxios.get('/medicos', { params: { limit: 1000 } });
        if (mounted) setMedicos(extraerArray(res.data) as MedicoItem[]);
      } catch (e) {
        console.error(e);
        if (mounted) setError('No se pudieron cargar los médicos disponibles.');
      } finally {
        if (mounted) setLoadingMedicos(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const cargarHorarios = async (medicoId: string) => {
    try {
      setLoadingHorarios(true);
      const res = await clientesAxios.get(`/horarioAtencion?medico=${medicoId}`);
      setHorariosMedico(extraerArray(res.data) as HorarioAtencionItem[]);
    } catch (e) {
      console.error(e);
      setHorariosMedico([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleMedicoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const medicoId = e.target.value;
    setFormData((prev) => ({ ...prev, medico: medicoId, especialidad: '', fecha: '', hora: '' }));
    setHorariosMedico([]);

    if (!medicoId) {
      setEspecialidadesDisponibles([]);
      return;
    }

    const medico = medicos.find((m) => (m.id || m._id) === medicoId);
    setEspecialidadesDisponibles(Array.isArray(medico?.especialidades) ? medico!.especialidades! : []);
    await cargarHorarios(medicoId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const horasDisponibles = ((): string[] => {
    if (!formData.fecha || horariosMedico.length === 0) return [];

    const fechaObj = new Date(`${formData.fecha}T00:00:00`);
    const diaSeleccionado = DIAS_SEMANA[fechaObj.getDay()];
    const horariosDelDia = horariosMedico.filter((h) => h.diaSemana === diaSeleccionado && h.activo !== false);

    return horariosDelDia.flatMap((bloque) =>
      generarBloquesHorarios(bloque.horaInicio, bloque.horaFin, bloque.duracionTurnoMinutos)
    );
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await pacientePortalService.sacarTurno({
        medico: formData.medico,
        especialidad: formData.especialidad,
        fecha: formData.fecha,
        hora: formData.hora,
        observaciones: formData.observaciones.trim(),
      });

      setSuccess(true);
      setTimeout(() => navigate('/mis-turnos'), 1400);
    } catch (err: unknown) {
      const mensaje = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'No se pudo reservar el turno.'
        : 'No se pudo reservar el turno.';
      setError(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
        <PageHeader
          titulo="Sacar un Turno"
          subtitulo="Elegí médico, especialidad, fecha y horario."
          icon={<BsCalendarPlus className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => navigate('/mis-turnos')}
        />

        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <BsCheckCircle size={20} />
            <div>¡Turno reservado exitosamente! Te llevamos a tus turnos...</div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Médico</label>
              <select
                className="form-select shadow-none"
                name="medico"
                value={formData.medico}
                onChange={handleMedicoChange}
                required
                disabled={loadingMedicos || submitting}
              >
                <option value="">{loadingMedicos ? 'Cargando médicos...' : 'Seleccione un médico...'}</option>
                {medicos.map((m) => {
                  const id = m.id || m._id || '';
                  const especialidades = Array.isArray(m.especialidades)
                    ? m.especialidades.map((esp) => esp.nombre).join(', ')
                    : '';
                  return (
                    <option key={id} value={id}>
                      Dr./Dra. {m.apellido}, {m.nombre}{especialidades ? ` — ${especialidades}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Especialidad</label>
              <select
                className="form-select shadow-none"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                required
                disabled={!formData.medico || submitting}
              >
                <option value="">
                  {formData.medico ? 'Seleccione una especialidad...' : 'Primero seleccione un médico'}
                </option>
                {especialidadesDisponibles.map((esp) => {
                  const id = esp.id || esp._id || '';
                  return (
                    <option key={id} value={id}>
                      {esp.nombre}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Fecha</label>
              <input
                type="date"
                className="form-control shadow-none"
                name="fecha"
                min={hoyISO()}
                value={formData.fecha}
                onChange={handleChange}
                required
                disabled={!formData.medico || submitting}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Horario {loadingHorarios && <span className="spinner-border spinner-border-sm ms-1 text-info"></span>}
              </label>
              <select
                className="form-select shadow-none"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                required
                disabled={!formData.fecha || horasDisponibles.length === 0 || submitting}
              >
                <option value="">
                  {!formData.fecha
                    ? 'Primero seleccione una fecha'
                    : horasDisponibles.length === 0
                      ? 'No hay horarios para este día'
                      : 'Seleccione un horario...'}
                </option>
                {horasDisponibles.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora} hs
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Motivo / observaciones (opcional)</label>
              <textarea
                className="form-control shadow-none"
                name="observaciones"
                rows={3}
                maxLength={500}
                placeholder="Contanos brevemente el motivo de la consulta"
                value={formData.observaciones}
                onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
            <button
              type="button"
              className="btn btn-light px-4"
              onClick={() => navigate('/mis-turnos')}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn text-white fw-semibold px-4 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
              disabled={submitting || success}
            >
              {submitting ? 'Reservando...' : 'Confirmar turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { BsJournalMedical, BsSave } from 'react-icons/bs';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { useAuth } from '../../context/AuthContext';
import type { ConsultaMedicaItem } from './ConsultasMedicasLista';

interface OpcionSelect {
  id: string;
  label: string;
}

interface TurnoResumen {
  _id?: string;
  id?: string;
  fecha?: string;
  hora?: string;
  motivo?: string;
  observaciones?: string;
  pacienteTexto?: string | null;
  pacienteNombre?: string;
  paciente?:
    | string
    | {
        _id?: string;
        id?: string;
        nombre?: string;
        apellido?: string;
        dni?: string;
      };
  medico?:
    | string
    | {
        _id?: string;
        id?: string;
        nombre?: string;
        apellido?: string;
      };
}

type EstadoConsultaValor = 'pendiente' | 'atendida' | 'cancelada';

const ESTADOS_CONSULTA: readonly EstadoConsultaValor[] = [
  'pendiente',
  'atendida',
  'cancelada',
];

interface ConsultaFormState {
  paciente: string;
  medico: string;
  turno: string;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  estado: EstadoConsultaValor;
}

const esObjectIdValido = (valor?: string): valor is string =>
  typeof valor === 'string' && /^[0-9a-fA-F]{24}$/.test(valor.trim());

const normalizarEstadoConsulta = (valor?: string): EstadoConsultaValor => {
  const limpio = String(valor || '').trim().toLowerCase();
  if (limpio === 'pendiente' || limpio === 'atendida' || limpio === 'cancelada') {
    return limpio;
  }
  return 'atendida';
};

const hoyIsoFecha = (): string => new Date().toISOString().slice(0, 10);

const normalizarFechaInput = (fecha?: string): string => {
  if (!fecha) return hoyIsoFecha();
  if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    return fecha.slice(0, 10);
  }
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return hoyIsoFecha();
  return parsed.toISOString().slice(0, 10);
};

const extraerLista = <T,>(payload: unknown, keys: string[]): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as T[];
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
    if (record.data && typeof record.data === 'object') {
      const nested = record.data as Record<string, unknown>;
      for (const key of keys) {
        if (Array.isArray(nested[key])) return nested[key] as T[];
      }
    }
  }
  return [];
};

const extraerObjeto = <T,>(payload: unknown): T | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  if (record.data && typeof record.data === 'object') {
    return record.data as T;
  }
  return record as T;
};

const getIdCampo = (
  valor: ConsultaMedicaItem['paciente'] | ConsultaMedicaItem['medico'] | ConsultaMedicaItem['turno']
): string => {
  if (!valor) return '';
  if (typeof valor === 'string') return valor.trim();
  return String(valor._id || valor.id || '').trim();
};

const formatearDatosPacienteTurno = (turno: TurnoResumen | null): string => {
  if (!turno) return '';
  if (turno.paciente && typeof turno.paciente === 'object') {
    const ape = turno.paciente.apellido || '';
    const nom = turno.paciente.nombre || '';
    const nombreCompleto = `${ape}${ape && nom ? ', ' : ''}${nom}`.trim() || 'Paciente';
    return `${nombreCompleto}${turno.paciente.dni ? ` · DNI ${turno.paciente.dni}` : ''}`;
  }
  if (typeof turno.paciente === 'string' && turno.paciente.trim()) {
    return turno.paciente.trim();
  }
  if (typeof turno.pacienteTexto === 'string' && turno.pacienteTexto.trim()) {
    return turno.pacienteTexto.trim();
  }
  if (typeof turno.pacienteNombre === 'string' && turno.pacienteNombre.trim()) {
    return turno.pacienteNombre.trim();
  }
  return '';
};

const obtenerMensajeErrorAxios = (err: unknown, fallback: string): string => {
  if (!isAxiosError<{ message?: string; data?: unknown }>(err)) {
    return fallback;
  }
  const resp = err.response?.data;
  if (!resp) return fallback;

  if (typeof resp.data === 'string') {
    try {
      const parsed = JSON.parse(resp.data) as Array<{ message?: string }>;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const msgs = parsed.map((item) => item.message).filter(Boolean).join(' · ');
        if (msgs) return msgs;
      }
    } catch {
      // Si no es JSON válido, continúa con message
    }
  }

  return resp.message || fallback;
};

export const ConsultaMedicaForm = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string; turnoId?: string }>();
  const idLimpio = esObjectIdValido(params.id) ? params.id.trim() : '';
  const turnoParamLimpio = esObjectIdValido(params.turnoId) ? params.turnoId.trim() : '';

  const [searchParams] = useSearchParams();
  const turnoQueryParam = searchParams.get('turno') || '';
  const turnoQueryId =
    turnoParamLimpio || (esObjectIdValido(turnoQueryParam) ? turnoQueryParam.trim() : '');

  const esEdicion = Boolean(idLimpio);
  const { rol } = useAuth();
  const esMedico = (rol || '').toUpperCase() === 'MEDICO';

  const [form, setForm] = useState<ConsultaFormState>({
    paciente: '',
    medico: '',
    turno: turnoQueryId,
    fecha: hoyIsoFecha(),
    motivo: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    estado: 'atendida',
  });

  const [turnoInfo, setTurnoInfo] = useState<TurnoResumen | null>(null);
  const [pacientes, setPacientes] = useState<OpcionSelect[]>([]);
  const [medicos, setMedicos] = useState<OpcionSelect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);

        const peticiones: Promise<unknown>[] = [
          clientesAxios.get('/pacientes', { params: { page: 1, limit: 100 } }).catch(() => null),
        ];

        if (!esMedico) {
          peticiones.push(
            clientesAxios.get('/medicos', { params: { page: 1, limit: 100 } }).catch(() => null)
          );
        }

        if (idLimpio) {
          peticiones.push(clientesAxios.get(`/consultasmedicas/${idLimpio}`));
        } else if (turnoQueryId) {
          peticiones.push(clientesAxios.get(`/turnos/${turnoQueryId}`).catch(() => null));
        }

        const resultados = await Promise.all(peticiones);
        if (!isMounted) return;

        const resPacientes = resultados[0] as { data?: unknown } | null;
        const listaPacientes = extraerLista<{
          _id?: string;
          id?: string;
          nombre?: string;
          apellido?: string;
          dni?: string;
        }>(resPacientes?.data, ['pacientes', 'items']);

        setPacientes(
          listaPacientes.map((p) => {
            const pid = String(p._id || p.id || '').trim();
            const nombreCompleto = `${p.apellido || ''}${p.apellido && p.nombre ? ', ' : ''}${p.nombre || ''}`.trim();
            return {
              id: pid,
              label: `${nombreCompleto || 'Paciente'}${p.dni ? ` (DNI ${p.dni})` : ''}`,
            };
          })
        );

        let offset = 1;
        if (!esMedico) {
          const resMedicos = resultados[1] as { data?: unknown } | null;
          const listaMedicos = extraerLista<{
            _id?: string;
            id?: string;
            nombre?: string;
            apellido?: string;
          }>(resMedicos?.data, ['medicos', 'items']);

          setMedicos(
            listaMedicos.map((m) => ({
              id: String(m._id || m.id || '').trim(),
              label: `Dr./Dra. ${m.nombre || ''} ${m.apellido || ''}`.trim(),
            }))
          );
          offset = 2;
        }

        if (idLimpio) {
          const resConsulta = resultados[offset] as { data?: unknown };
          const consultaData = extraerObjeto<ConsultaMedicaItem>(resConsulta?.data);
          if (!consultaData) {
            setError('No se encontró la consulta médica para editar.');
            return;
          }

          setForm({
            paciente: getIdCampo(consultaData.paciente),
            medico: getIdCampo(consultaData.medico),
            turno: getIdCampo(consultaData.turno),
            fecha: normalizarFechaInput(consultaData.fecha),
            motivo: consultaData.motivo || '',
            diagnostico: consultaData.diagnostico || '',
            tratamiento: consultaData.tratamiento || '',
            observaciones: consultaData.observaciones || '',
            estado: normalizarEstadoConsulta(consultaData.estado),
          });
        } else if (turnoQueryId) {
          const resTurno = resultados[offset] as { data?: unknown } | null;
          const turnoData = extraerObjeto<TurnoResumen>(resTurno?.data);
          if (turnoData) {
            setTurnoInfo(turnoData);
            const pacienteIdTurno = getIdCampo(turnoData.paciente);
            const medicoIdTurno = getIdCampo(turnoData.medico);

            setForm((prev) => ({
              ...prev,
              turno: turnoQueryId,
              paciente: esObjectIdValido(pacienteIdTurno) ? pacienteIdTurno : prev.paciente,
              medico: esObjectIdValido(medicoIdTurno) ? medicoIdTurno : prev.medico,
              fecha: normalizarFechaInput(turnoData.fecha),
              motivo: turnoData.motivo || turnoData.observaciones || prev.motivo,
            }));
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del formulario de consulta:', err);
        if (isMounted) {
          setError(
            obtenerMensajeErrorAxios(err, 'No se pudieron cargar los datos de la consulta.')
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void cargarDatosIniciales();

    return () => {
      isMounted = false;
    };
  }, [idLimpio, turnoQueryId, esMedico]);

  const handleChange = <K extends keyof ConsultaFormState>(
    campo: K,
    valor: ConsultaFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.motivo.trim()) {
      toast.error('El motivo de la consulta es obligatorio.');
      return;
    }

    if (!esEdicion && !esObjectIdValido(form.paciente)) {
      toast.error('Seleccioná o verificá un paciente válido para registrar la consulta.');
      return;
    }

    if (!esEdicion && !esMedico && !form.turno && !esObjectIdValido(form.medico)) {
      toast.error('Seleccioná un médico válido para registrar la consulta.');
      return;
    }

    setSubmitting(true);
    try {
      const estadoNormalizado = normalizarEstadoConsulta(form.estado);

      if (esEdicion && idLimpio) {
        const payloadActualizar: Record<string, unknown> = {
          motivo: form.motivo.trim(),
          estado: estadoNormalizado,
        };

        if (form.diagnostico.trim()) payloadActualizar.diagnostico = form.diagnostico.trim();
        if (form.tratamiento.trim()) payloadActualizar.tratamiento = form.tratamiento.trim();
        if (form.observaciones.trim()) payloadActualizar.observaciones = form.observaciones.trim();

        const response = await clientesAxios.put(`/consultasmedicas/${idLimpio}`, payloadActualizar);
        toast.success(response.data?.message || 'Consulta médica actualizada correctamente.');
        navigate(`/consultas-medicas/${idLimpio}`);
      } else {
        const payloadCrear: Record<string, unknown> = {
          paciente: form.paciente.trim(),
          motivo: form.motivo.trim(),
          estado: estadoNormalizado,
        };

        if (esObjectIdValido(form.turno)) payloadCrear.turno = form.turno.trim();
        if (!esMedico && esObjectIdValido(form.medico)) payloadCrear.medico = form.medico.trim();
        if (form.diagnostico.trim()) payloadCrear.diagnostico = form.diagnostico.trim();
        if (form.tratamiento.trim()) payloadCrear.tratamiento = form.tratamiento.trim();
        if (form.observaciones.trim()) payloadCrear.observaciones = form.observaciones.trim();

        const response = await clientesAxios.post('/consultasmedicas', payloadCrear);
        const creada = extraerObjeto<ConsultaMedicaItem>(response.data);
        const nuevaId = creada ? String(creada.id || creada._id || '') : '';

        if (esObjectIdValido(form.turno)) {
          try {
            await clientesAxios.patch(`/turnos/${form.turno.trim()}/atendido`);
          } catch (errTurno) {
            console.error('Consulta creada, pero no se pudo marcar el turno como atendido:', errTurno);
            toast.warning('Consulta guardada, pero revisá el estado del turno.');
          }
        }

        toast.success(
          response.data?.message || 'Consulta médica creada y turno marcado como atendido.'
        );
        navigate(nuevaId ? `/consultas-medicas/${nuevaId}` : '/consultas-medicas');
      }
    } catch (err: unknown) {
      console.error('Error al guardar consulta médica:', err);
      toast.error(obtenerMensajeErrorAxios(err, 'No se pudo guardar la consulta médica.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 text-muted">
        Cargando formulario de consulta médica...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '850px' }}>
        <PageHeader
          titulo={esEdicion ? 'Editar Consulta Médica' : 'Nueva Consulta Médica'}
          subtitulo={error}
          icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => goBackSafe(navigate)}
        />
      </div>
    );
  }

  const resumenPacienteTurno = formatearDatosPacienteTurno(turnoInfo);
  const pacienteBloqueadoPorTurno = Boolean(form.turno && esObjectIdValido(form.paciente));

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '850px' }}>
      <PageHeader
        titulo={esEdicion ? 'Editar Consulta Médica' : 'Nueva Consulta Médica'}
        subtitulo={
          esEdicion
            ? 'Actualizá diagnóstico, tratamiento o evolución de la atención.'
            : 'Registrá una nueva consulta médica y su evolución clínica.'
        }
        icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
      />

      {!esEdicion && resumenPacienteTurno && (
        <div className="alert alert-info border-0 shadow-sm mb-3 py-2 px-3 small" style={{ borderRadius: '10px' }}>
          <span className="fw-semibold">Paciente del turno:</span> {resumenPacienteTurno}
          {turnoInfo?.hora ? <span className="ms-2">· Hora {turnoInfo.hora}</span> : null}
        </div>
      )}

      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              {!esEdicion && !esMedico && (
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Médico</label>
                  <select
                    className="form-select shadow-none"
                    value={form.medico}
                    onChange={(e) => handleChange('medico', e.target.value)}
                    disabled={Boolean(form.turno && esObjectIdValido(form.medico))}
                  >
                    <option value="">Seleccione un médico...</option>
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!esEdicion && (
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">
                    Paciente <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select shadow-none"
                    value={form.paciente}
                    onChange={(e) => handleChange('paciente', e.target.value)}
                    disabled={pacienteBloqueadoPorTurno}
                    required
                  >
                    <option value="">Seleccione un paciente...</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">Fecha</label>
                <input
                  type="date"
                  className="form-control shadow-none"
                  value={form.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">Estado</label>
                <select
                  className="form-select shadow-none"
                  value={form.estado}
                  onChange={(e) =>
                    handleChange('estado', normalizarEstadoConsulta(e.target.value))
                  }
                >
                  {ESTADOS_CONSULTA.map((estadoOp) => (
                    <option key={estadoOp} value={estadoOp}>
                      {estadoOp.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">
                Motivo de consulta <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control shadow-none"
                placeholder="Ej: Control clínico, dolor abdominal, seguimiento..."
                value={form.motivo}
                onChange={(e) => handleChange('motivo', e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Diagnóstico</label>
              <textarea
                className="form-control shadow-none"
                rows={3}
                placeholder="Detalle del diagnóstico clínico..."
                value={form.diagnostico}
                onChange={(e) => handleChange('diagnostico', e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Tratamiento</label>
              <textarea
                className="form-control shadow-none"
                rows={3}
                placeholder="Medicación, indicaciones o estudios solicitados..."
                value={form.tratamiento}
                onChange={(e) => handleChange('tratamiento', e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">Observaciones</label>
              <textarea
                className="form-control shadow-none"
                rows={2}
                placeholder="Observaciones adicionales..."
                value={form.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top border-secondary-subtle">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn text-white fw-semibold px-4 d-flex align-items-center gap-2 shadow-sm"
                style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                disabled={submitting}
              >
                <BsSave />
                {submitting
                  ? 'Guardando...'
                  : esEdicion
                    ? 'Guardar Cambios'
                    : 'Registrar Consulta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
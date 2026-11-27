import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import {
  BsActivity,
  BsCalendarCheck,
  BsCapsule,
  BsCheckCircle,
  BsExclamationTriangle,
  BsHeartPulse,
  BsJournalMedical,
  BsPersonBadge,
  BsStars,
} from 'react-icons/bs';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { PageHeader } from '../../constants/PageHeader';
import { atencionService } from '../../services/atencion.service';
import { estadoTurnoClase, formatearFecha } from '../pacientePortal/pacientePortal.schema';
import {
  descripciones,
  esEstadoActivo,
  fechaHoraTurno,
  getPacienteIdDeTurno,
  getRefId,
  getTurnoId,
  nombreEspecialidad,
  nombrePaciente,
  type ConsultaMedica,
  type HistorialClinico,
  type TurnoAtencion,
} from './atencion.schema';

interface CamposConsulta {
  motivo: string;
  sintomas: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}

const CAMPOS_VACIOS: CamposConsulta = {
  motivo: '',
  sintomas: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: '',
};

const mensajeDeError = (error: unknown, fallback: string): string =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

const ListaClinica: React.FC<{ titulo: string; items: string[] }> = ({ titulo, items }) => (
  <div className="mb-2">
    <span className="text-muted small d-block mb-1">{titulo}</span>
    {items.length > 0 ? (
      <div className="d-flex flex-wrap gap-1">
        {items.map((item, index) => (
          <span
            key={`${titulo}-${index}`}
            className="badge bg-light text-dark border fw-normal text-wrap text-start"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <span className="small text-muted">Sin datos</span>
    )}
  </div>
);

const TarjetaConsulta: React.FC<{ consulta: ConsultaMedica }> = ({ consulta }) => (
  <div className="border rounded-3 p-3">
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
      <span className="d-flex align-items-center gap-1 small fw-semibold text-dark">
        <BsCalendarCheck style={{ color: '#00ACB2' }} />
        {formatearFecha(consulta.fecha || '')}
      </span>
      {consulta.estado && (
        <span className={`badge px-2 py-1 text-uppercase ${estadoTurnoClase(consulta.estado)}`}>
          {consulta.estado}
        </span>
      )}
    </div>
    {consulta.motivo && (
      <p className="mb-1 small"><span className="fw-semibold">Motivo:</span> {consulta.motivo}</p>
    )}
    {consulta.diagnostico && (
      <p className="mb-1 small"><span className="fw-semibold">Diagnóstico:</span> {consulta.diagnostico}</p>
    )}
    {consulta.tratamiento && (
      <p className="mb-1 small"><span className="fw-semibold">Tratamiento:</span> {consulta.tratamiento}</p>
    )}
    {consulta.observaciones && (
      <p className="mb-0 small"><span className="fw-semibold">Observaciones:</span> {consulta.observaciones}</p>
    )}
  </div>
);

export const AtencionPaciente: React.FC = () => {
  const navigate = useNavigate();
  const { turnoId } = useParams<{ turnoId: string }>();

  const [turno, setTurno] = useState<TurnoAtencion | null>(null);
  const [turnoFuturo, setTurnoFuturo] = useState(false);
  const [historial, setHistorial] = useState<HistorialClinico | null>(null);
  const [consultaActual, setConsultaActual] = useState<ConsultaMedica | null>(null);
  const [consultasPrevias, setConsultasPrevias] = useState<ConsultaMedica[]>([]);
  const [campos, setCampos] = useState<CamposConsulta>(CAMPOS_VACIOS);

  const [loading, setLoading] = useState<boolean>(Boolean(turnoId));
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [sugerencia, setSugerencia] = useState('');

  useEffect(() => {
    if (!turnoId) return;

    let mounted = true;

    const cargarAtencion = async () => {
      try {
        const datosTurno = await atencionService.turno(turnoId);
        const pacienteId = getPacienteIdDeTurno(datosTurno);
        const idTurno = getTurnoId(datosTurno);

        if (!pacienteId) {
          throw new Error('El turno no tiene un paciente asociado.');
        }

        const [datosHistorial, consultasPaciente] = await Promise.all([
          atencionService.historial(pacienteId),
          atencionService.consultas({ paciente: pacienteId }),
        ]);

        const actual = consultasPaciente.find((item) => getRefId(item.turno) === idTurno) || null;
        const previas = consultasPaciente
          .filter((item) => getRefId(item.turno) !== idTurno)
          .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime());

        if (!mounted) return;

        setError(null);
        setTurno(datosTurno);
        setTurnoFuturo(fechaHoraTurno(datosTurno).getTime() > Date.now());
        setHistorial(datosHistorial);
        setConsultaActual(actual);
        setConsultasPrevias(previas);
        setCampos({
          motivo: actual?.motivo || datosTurno.observaciones || '',
          sintomas: '',
          diagnostico: actual?.diagnostico || '',
          tratamiento: actual?.tratamiento || '',
          observaciones: actual?.observaciones || '',
        });
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(mensajeDeError(err, 'No se pudo cargar la atención del turno.'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void cargarAtencion();

    return () => {
      mounted = false;
    };
  }, [turnoId]);

  const pacienteId = turno ? getPacienteIdDeTurno(turno) : '';
  const turnoActivo = Boolean(turno && esEstadoActivo(turno.estado));
  const puedeCerrar = turnoActivo && !turnoFuturo;
  const telefono =
    turno && typeof turno.paciente === 'object' && turno.paciente?.telefono
      ? `${turno.paciente.telefono.codigoArea || ''} ${turno.paciente.telefono.numero || ''}`.trim()
      : '';

  const alergias = useMemo(() => descripciones(historial?.alergias), [historial]);
  const cronicas = useMemo(() => descripciones(historial?.enfermedadesCronicas), [historial]);
  const medicacion = useMemo(() => descripciones(historial?.medicacionActual), [historial]);

  const actualizarCampo = (campo: keyof CamposConsulta, valor: string) =>
    setCampos((previo) => ({ ...previo, [campo]: valor }));

  const handleSugerirIA = async () => {
    if (!pacienteId) return;
    if (!campos.motivo.trim()) {
      toast.error('Cargá el motivo de consulta antes de pedir la sugerencia.');
      return;
    }

    try {
      setGenerandoIA(true);
      const texto = await atencionService.sugerirIA({
        pacienteId,
        motivo: campos.motivo,
        sintomas: campos.sintomas,
      });
      setSugerencia(texto);
      toast.success('Sugerencia generada. Revisala antes de guardar.');
    } catch (err) {
      console.error(err);
      toast.error(mensajeDeError(err, 'No se pudo generar la sugerencia de IA.'));
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleGuardar = async () => {
    if (!turno || !pacienteId) return;

    if (!campos.motivo.trim()) {
      toast.error('El motivo de la consulta es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        paciente: pacienteId,
        turno: getTurnoId(turno),
        motivo: campos.motivo.trim(),
        diagnostico: campos.diagnostico.trim() || undefined,
        tratamiento: campos.tratamiento.trim() || undefined,
        observaciones: campos.observaciones.trim() || undefined,
        estado: 'atendida' as const,
      };

      const guardada = consultaActual
        ? await atencionService.actualizarConsulta(getRefId(consultaActual), payload)
        : await atencionService.crearConsulta(payload);

      setConsultaActual(guardada);

      if (puedeCerrar) {
        const turnoCerrado = await atencionService.marcarAtendido(getTurnoId(turno));
        setTurno((previo) => (previo ? { ...previo, ...turnoCerrado, vencido: false } : turnoCerrado));
        setTurnoFuturo(false);
        toast.success('Atención guardada y turno marcado como atendido.');
        navigate('/mis-pacientes/atendidos');
      } else {
        toast.success('Consulta guardada. El turno sigue pendiente de cierre.');
      }
    } catch (err) {
      console.error(err);
      toast.error(mensajeDeError(err, 'No se pudo guardar la atención.'));
    } finally {
      setGuardando(false);
    }
  };

  if (!turnoId) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <PageHeader
          titulo="Atención del paciente"
          subtitulo="Turno no válido."
          icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => goBackSafe(navigate)}
        />
      </div>
    );
  }

  if (loading) {
    return <div className="container-fluid py-4 text-muted">Cargando atención...</div>;
  }

  if (error || !turno) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <PageHeader
          titulo="Atención del paciente"
          subtitulo={error || 'No se encontró el turno solicitado.'}
          icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => goBackSafe(navigate)}
        />
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={`Atención de ${nombrePaciente(turno)}`}
        subtitulo={`${turno.paciente && typeof turno.paciente === 'object' && turno.paciente.dni ? `DNI ${turno.paciente.dni} · ` : ''}${formatearFecha(turno.fecha)} ${turno.hora} hs · ${nombreEspecialidad(turno)}`}
        icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
        rightContent={
          <div className="d-flex align-items-center gap-2">
            {turno.vencido && (
              <span className="badge bg-danger-subtle text-danger text-uppercase">Vencido</span>
            )}
            <span className={`badge px-2 py-1 text-uppercase ${estadoTurnoClase(turno.estado)}`}>
              {turno.estado}
            </span>
          </div>
        }
      />

      {turnoFuturo && turnoActivo && (
        <div className="alert alert-warning d-flex align-items-start gap-2 py-2" role="alert">
          <BsExclamationTriangle className="mt-1" />
          <small className="mb-0">
            Este turno es futuro: podés guardar la consulta, pero el turno solo puede marcarse como
            atendido el día de la cita o en fechas posteriores.
          </small>
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <BsPersonBadge style={{ color: '#00ACB2' }} /> Datos del paciente
              </h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Nombre</dt>
                <dd className="col-7 text-dark">
                  {turno.paciente && typeof turno.paciente === 'object'
                    ? `${turno.paciente.apellido || ''}, ${turno.paciente.nombre || ''}`
                    : '-'}
                </dd>

                <dt className="col-5 text-muted">DNI</dt>
                <dd className="col-7 text-dark">
                  {turno.paciente && typeof turno.paciente === 'object' ? turno.paciente.dni || '-' : '-'}
                </dd>

                <dt className="col-5 text-muted">Teléfono</dt>
                <dd className="col-7 text-dark">{telefono || '-'}</dd>

                <dt className="col-5 text-muted">Obra social</dt>
                <dd className="col-7 text-dark">
                  {turno.paciente &&
                  typeof turno.paciente === 'object' &&
                  turno.paciente.obraSocial &&
                  typeof turno.paciente.obraSocial === 'object'
                    ? turno.paciente.obraSocial.razonSocial || '-'
                    : '-'}
                </dd>

                <dt className="col-5 text-muted">Turno</dt>
                <dd className="col-7 text-dark">
                  {formatearFecha(turno.fecha)} · {turno.hora} hs
                </dd>
              </dl>
            </div>
          </div>

          <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <BsActivity style={{ color: '#00ACB2' }} /> Historial clínico
              </h6>

              {!historial ? (
                <p className="text-muted small mb-0">
                  El paciente todavía no tiene historial clínico cargado.
                </p>
              ) : (
                <>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <BsCapsule style={{ color: '#00ACB2' }} />
                    <span className="small text-muted">Grupo sanguíneo:</span>
                    <span className="badge bg-danger-subtle text-danger">
                      {historial.grupoSanguineo || 'Sin dato'}
                    </span>
                  </div>

                  <ListaClinica titulo="Alergias" items={alergias} />
                  <ListaClinica titulo="Enfermedades crónicas" items={cronicas} />
                  <ListaClinica titulo="Medicación actual" items={medicacion} />

                  <div className="mb-2">
                    <span className="text-muted small d-block">Antecedentes familiares</span>
                    <span className="small text-dark">
                      {historial.antecedentesFamiliares || 'Sin datos'}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-muted small d-block">Antecedentes quirúrgicos</span>
                    <span className="small text-dark">
                      {historial.antecedentesQuirurgicos || 'Sin datos'}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-muted small d-block">Hábitos</span>
                    <span className="small text-dark">
                      {[
                        historial.habitos?.tabaquismo ? 'Tabaquismo' : null,
                        historial.habitos?.alcoholismo ? 'Alcoholismo' : null,
                        historial.habitos?.drogas ? 'Drogas' : null,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'Sin datos'}
                    </span>
                  </div>

                  {historial.observacionesGenerales && (
                    <div className="p-2 rounded-3 bg-light small text-muted">
                      {historial.observacionesGenerales}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <BsJournalMedical style={{ color: '#00ACB2' }} /> Consultas anteriores
              </h6>

              {consultasPrevias.length === 0 ? (
                <p className="text-muted small mb-0">Sin consultas anteriores registradas.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {consultasPrevias.slice(0, 6).map((consulta, index) => (
                    <TarjetaConsulta
                      key={getRefId(consulta) || `previa-${index}`}
                      consulta={consulta}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <BsJournalMedical style={{ color: '#00ACB2' }} /> Registro de la consulta
              </h6>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">
                  Motivo de consulta <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control shadow-none"
                  value={campos.motivo}
                  onChange={(e) => actualizarCampo('motivo', e.target.value)}
                  placeholder="Ej: control de presión arterial"
                  disabled={guardando}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">
                  Síntomas (solo para la sugerencia de IA)
                </label>
                <input
                  type="text"
                  className="form-control shadow-none"
                  value={campos.sintomas}
                  onChange={(e) => actualizarCampo('sintomas', e.target.value)}
                  placeholder="Ej: cefalea leve desde hace 3 días"
                  disabled={guardando}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Diagnóstico</label>
                <textarea
                  className="form-control shadow-none"
                  rows={3}
                  value={campos.diagnostico}
                  onChange={(e) => actualizarCampo('diagnostico', e.target.value)}
                  disabled={guardando}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">
                  Tratamiento y recomendaciones
                </label>
                <textarea
                  className="form-control shadow-none"
                  rows={3}
                  value={campos.tratamiento}
                  onChange={(e) => actualizarCampo('tratamiento', e.target.value)}
                  disabled={guardando}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Observaciones</label>
                <textarea
                  className="form-control shadow-none"
                  rows={3}
                  value={campos.observaciones}
                  onChange={(e) => actualizarCampo('observaciones', e.target.value)}
                  disabled={guardando}
                />
              </div>

              <div className="d-flex flex-wrap justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-semibold"
                  style={{ borderRadius: '10px' }}
                  onClick={() => navigate(-1)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn text-white fw-semibold d-flex align-items-center gap-2"
                  style={{ backgroundColor: '#00ACB2', borderRadius: '10px' }}
                  onClick={handleGuardar}
                  disabled={guardando}
                >
                  <BsCheckCircle size={18} />
                  {guardando
                    ? 'Guardando...'
                    : puedeCerrar
                      ? consultaActual
                        ? 'Guardar y cerrar turno'
                        : 'Guardar atención'
                      : 'Guardar consulta'}
                </button>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <BsStars style={{ color: '#00ACB2' }} /> Asistencia con IA
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary fw-semibold"
                  style={{ borderRadius: '8px' }}
                  onClick={handleSugerirIA}
                  disabled={generandoIA || guardando}
                >
                  {generandoIA ? 'Generando...' : 'Sugerir con IA'}
                </button>
              </div>

              <p className="small text-muted mb-2">
                La sugerencia es <strong>orientativa</strong> y no reemplaza tu criterio clínico.
                Revisala y editá los campos antes de guardar.
              </p>

              {sugerencia ? (
                <>
                  <textarea
                    className="form-control shadow-none mb-2"
                    rows={9}
                    value={sugerencia}
                    onChange={(e) => setSugerencia(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary fw-semibold"
                    style={{ borderRadius: '8px' }}
                    onClick={() => actualizarCampo('observaciones', sugerencia)}
                  >
                    Copiar a observaciones
                  </button>
                </>
              ) : (
                <p className="text-muted small mb-0">
                  Completá el motivo y presioná “Sugerir con IA” para obtener una propuesta editable.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
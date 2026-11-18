import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BsExclamationTriangle,
  BsSearch,
  BsCalendarEvent,
  BsClock,
  BsPersonBadge,
  BsTelephone,
  BsEnvelope,
  BsArrowRepeat,
  BsCheckCircle,
} from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { toast } from 'sonner';

interface TelefonoObj {
  tipo?: string;
  codigoArea?: string;
  numero?: string;
}

interface TurnoAReprogramarItem {
  _id: string;
  id?: string;
  fecha: string;
  hora: string;
  estado: string;
  motivoExcepcion?: string;
  paciente?: {
    nombre?: string;
    apellido?: string;
    dni?: string;
    telefono?: string | TelefonoObj;
    email?: string;
  };
  medico?: {
    nombre?: string;
    apellido?: string;
  };
  especialidad?: {
    nombre?: string;
  };
}

export const TurnosAReprogramar = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<TurnoAReprogramarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const fetchTurnosAReprogramar = async () => {
      try {
        // Ajusta la ruta si en tu router de excepciones o turnos le pusiste otro path
        const response = await clientesAxios.get('/excepciones/reprogramar');
        if (isMounted) {
          const dataApi = response.data;
          let lista: TurnoAReprogramarItem[] = [];
          if (Array.isArray(dataApi)) {
            lista = dataApi;
          } else if (dataApi && typeof dataApi === 'object') {
            const record = dataApi as Record<string, unknown>;
            if (Array.isArray(record.data)) {
              lista = record.data as TurnoAReprogramarItem[];
            }
          }
          setTurnos(lista);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar turnos a reprogramar:', err);
        if (isMounted) {
          setError('No se pudo conectar con el servidor para obtener los turnos afectados.');
          toast.error('Error al cargar la bandeja de reprogramación.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTurnosAReprogramar();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    return fechaStr.split('T')[0].split('-').reverse().join('/');
  };

  const formatearTelefono = (telefono?: string | TelefonoObj): string => {
    if (!telefono) return '';
    if (typeof telefono === 'string') return telefono;
    if (typeof telefono === 'object') {
      const { codigoArea, numero } = telefono;
      if (codigoArea && numero) return `(${codigoArea}) ${numero}`;
      return numero || codigoArea || '';
    }
    return '';
  };

  const turnosFiltrados = turnos.filter((t) => {
    const pacienteNombre = `${t.paciente?.nombre || ''} ${t.paciente?.apellido || ''}`.toLowerCase();
    const pacienteDni = (t.paciente?.dni || '').toLowerCase();
    const medicoNombre = `${t.medico?.nombre || ''} ${t.medico?.apellido || ''}`.toLowerCase();
    const motivo = (t.motivoExcepcion || '').toLowerCase();
    const termino = busqueda.toLowerCase();

    return (
      pacienteNombre.includes(termino) ||
      pacienteDni.includes(termino) ||
      medicoNombre.includes(termino) ||
      motivo.includes(termino)
    );
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader
        titulo="Turnos a Reprogramar"
        subtitulo="Pacientes afectados por bloqueos o modificaciones de horario en la agenda médica."
        icon={<BsExclamationTriangle className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate('/turnos')}
        rightContent={
          !loading && turnos.length > 0 ? (
            <span className="badge bg-warning text-dark px-3 py-2 fs-6 shadow-sm" style={{ borderRadius: '10px' }}>
              {turnos.length} {turnos.length === 1 ? 'pendiente' : 'pendientes'}
            </span>
          ) : undefined
        }
      />

      {/* Buscador */}
      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted">
              <BsSearch size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none ps-0"
              placeholder="Buscar por paciente, DNI, médico o motivo de excepción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Buscando turnos afectados...</p>
        </div>
      ) : error ? (
        <div className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center" style={{ borderRadius: '12px' }}>
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : turnosFiltrados.length > 0 ? (
        <div className="row g-3">
          {turnosFiltrados.map((turno) => {
            const turnoId = turno._id || turno.id || '';
            const telefonoFormateado = formatearTelefono(turno.paciente?.telefono);

            return (
              <div className="col-12 col-md-6" key={turnoId}>
                <div
                  className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column justify-content-between"
                  style={{ borderRadius: '12px', borderLeft: '4px solid #ffc107' }}
                >
                  <div>
                    {/* Cabecera: Paciente y Estado */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="text-muted small d-block">Paciente afectado</span>
                        <h6 className="fw-bold text-dark mb-0 fs-5">
                          {turno.paciente?.apellido?.toUpperCase()}, {turno.paciente?.nombre}
                        </h6>
                        {turno.paciente?.dni && (
                          <span className="text-muted small">DNI: {turno.paciente.dni}</span>
                        )}
                      </div>
                      <span className="badge bg-warning-subtle text-dark px-2 py-1 text-uppercase">
                        {turno.estado}
                      </span>
                    </div>

                    <hr className="my-2 border-secondary-subtle" />

                    {/* Detalles del Turno Original y Contacto */}
                    <div className="small mb-3">
                      <div className="d-flex align-items-center gap-2 text-secondary mb-1">
                        <BsPersonBadge size={14} style={{ color: '#00ACB2' }} />
                        <span className="fw-semibold text-dark">
                          Dr./Dra. {turno.medico?.nombre} {turno.medico?.apellido}
                          {turno.especialidad?.nombre ? ` (${turno.especialidad.nombre})` : ''}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-3 text-secondary mb-2">
                        <span className="d-flex align-items-center gap-1">
                          <BsCalendarEvent size={14} />
                          <strong className="text-danger">{formatearFecha(turno.fecha)}</strong>
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <BsClock size={14} />
                          <strong className="text-danger">{turno.hora} hs</strong>
                        </span>
                      </div>

                      {/* Datos de contacto para llamar al paciente */}
                      {(telefonoFormateado || turno.paciente?.email) && (
                        <div className="d-flex flex-wrap gap-3 text-muted mb-2">
                          {telefonoFormateado && (
                            <span className="d-flex align-items-center gap-1">
                              <BsTelephone size={13} className="text-success" />
                              <strong className="text-dark">{telefonoFormateado}</strong>
                            </span>
                          )}
                          {turno.paciente?.email && (
                            <span className="d-flex align-items-center gap-1">
                              <BsEnvelope size={13} />
                              {turno.paciente.email}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Motivo de la excepción */}
                      {turno.motivoExcepcion && (
                        <div className="mt-2 text-muted bg-light p-2 rounded-2">
                          <span className="fw-semibold text-dark d-block">Motivo de cancelación de agenda:</span>
                          {turno.motivoExcepcion}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pie de tarjeta: Acción directa */}
                  <div className="d-flex align-items-center justify-content-end pt-2 border-top border-secondary-subtle">
                    <button
                      type="button"
                      className="btn btn-sm text-white d-flex align-items-center gap-2 px-3 py-1 fw-semibold shadow-sm"
                      style={{ backgroundColor: '#00ACB2', borderRadius: '8px', fontSize: '0.85rem' }}
                      onClick={() => navigate(`/turnos/editar/${turnoId}`)}
                    >
                      <BsArrowRepeat size={15} />
                      Reprogramar Turno
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <BsCheckCircle size={36} className="text-success mx-auto mb-2" />
          <h6 className="fw-bold text-dark">¡Todo al día!</h6>
          <p className="text-muted mb-0">No hay turnos pendientes de reprogramación por excepciones de agenda.</p>
        </div>
      )}
    </div>
  );
};
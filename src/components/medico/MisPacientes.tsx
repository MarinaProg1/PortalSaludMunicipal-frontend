import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BsCalendarCheck,
  BsCheckCircle,
  BsClock,
  BsPersonBadge,
  BsSearch,
  BsJournalMedical,
} from 'react-icons/bs';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { PageHeader } from '../../constants/PageHeader';
import { atencionService } from '../../services/atencion.service';
import { estadoTurnoClase, formatearFecha } from '../pacientePortal/pacientePortal.schema';
import {
  BANDEJAS,
  esEstadoActivo,
  fechaHoraTurno,
  getPacienteIdDeTurno,
  getTurnoId,
  nombreEspecialidad,
  nombrePaciente,
  type Bandeja,
  type TurnoAtencion,
} from './atencion.schema';

const normalizarBandeja = (valor?: string): Bandeja =>
  valor === 'atendidos' ? 'atendidos' : 'por-atender';

export const MisPacientes: React.FC = () => {
  const navigate = useNavigate();
  const { bandeja } = useParams<{ bandeja: string }>();
  const bandejaActual = normalizarBandeja(bandeja);

  const [turnos, setTurnos] = useState<TurnoAtencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await atencionService.bandeja(bandejaActual);
        if (mounted) setTurnos(data);
      } catch (error) {
        console.error(error);
        if (mounted) {
          const mensaje = isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message || 'No se pudieron cargar los turnos.'
            : 'No se pudieron cargar los turnos.';
          toast.error(mensaje);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bandejaActual]);

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return turnos
      .filter((turno) => {
        if (!termino) return true;
        const paciente = nombrePaciente(turno).toLowerCase();
        const dni = (typeof turno.paciente === 'object' && turno.paciente?.dni) || '';
        return paciente.includes(termino) || String(dni).includes(termino);
      })
      .sort((a, b) =>
        bandejaActual === 'atendidos'
          ? fechaHoraTurno(b).getTime() - fechaHoraTurno(a).getTime()
          : fechaHoraTurno(a).getTime() - fechaHoraTurno(b).getTime()
      );
  }, [turnos, busqueda, bandejaActual]);

  const infoBandeja = BANDEJAS.find((item) => item.id === bandejaActual)!;
  const titulo =
    bandejaActual === 'atendidos' ? 'Pacientes atendidos' : 'Pacientes por atender';

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={titulo}
        subtitulo={infoBandeja.descripcion}
        icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
      />

      <div className="d-flex flex-wrap gap-2 mb-3">
        {BANDEJAS.map((item) => {
          const activa = item.id === bandejaActual;
          return (
            <button
              key={item.id}
              type="button"
              className={`btn btn-sm fw-semibold ${
                activa ? 'text-white shadow-sm' : 'btn-outline-secondary'
              }`}
              style={
                activa
                  ? { backgroundColor: '#00ACB2', borderRadius: '10px' }
                  : { borderRadius: '10px' }
              }
              onClick={() => navigate(`/mis-pacientes/${item.id}`)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted">
              <BsSearch size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none ps-0"
              placeholder="Buscar por paciente o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Cargando turnos...</div>
      ) : visibles.length === 0 ? (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">
            {busqueda.trim()
              ? 'No se encontraron turnos para esa búsqueda.'
              : bandejaActual === 'atendidos'
                ? 'Todavía no registraste atenciones.'
                : 'No tenés turnos pendientes por atender.'}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {visibles.map((turno) => {
            const turnoId = getTurnoId(turno);
            const pacienteId = getPacienteIdDeTurno(turno);
            const activo = esEstadoActivo(turno.estado);
            const telefono =
              typeof turno.paciente === 'object' && turno.paciente?.telefono
                ? `${turno.paciente.telefono.codigoArea || ''} ${turno.paciente.telefono.numero || ''}`.trim()
                : '';

            return (
              <div className="col-12 col-md-6" key={turnoId}>
                <div
                  className="card border-0 shadow-sm bg-white h-100 d-flex flex-column justify-content-between"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <span className="text-muted small d-block">Paciente</span>
                        <h6 className="fw-bold text-dark mb-0 fs-5">{nombrePaciente(turno)}</h6>
                        {typeof turno.paciente === 'object' && turno.paciente?.dni && (
                          <small className="text-muted">DNI {turno.paciente.dni}</small>
                        )}
                      </div>
                      <div className="d-flex flex-column align-items-end gap-1">
                        <span className={`badge px-2 py-1 text-uppercase ${estadoTurnoClase(turno.estado)}`}>
                          {turno.estado || '-'}
                        </span>
                        {turno.vencido && (
                          <span className="badge bg-danger-subtle text-danger text-uppercase">
                            Vencido
                          </span>
                        )}
                      </div>
                    </div>

                    <hr className="my-2 border-secondary-subtle" />

                    <div className="row g-2 small">
                      <div className="col-12">
                        <span className="text-muted d-block">Especialidad</span>
                        <span className="fw-medium text-dark">{nombreEspecialidad(turno)}</span>
                      </div>
                      <div className="col-12 d-flex flex-wrap align-items-center gap-3 mt-1">
                        <span className="d-flex align-items-center gap-1">
                          <BsCalendarCheck size={14} style={{ color: '#00ACB2' }} />
                          <span className="fw-semibold text-dark">{formatearFecha(turno.fecha)}</span>
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <BsClock size={14} style={{ color: '#00ACB2' }} />
                          <span className="fw-semibold text-dark">{turno.hora} hs</span>
                        </span>
                        {telefono && (
                          <span className="d-flex align-items-center gap-1 text-muted">
                            <BsPersonBadge size={14} style={{ color: '#00ACB2' }} />
                            {telefono}
                          </span>
                        )}
                      </div>
                    </div>

                    {turno.observaciones && (
                      <div className="p-2 rounded-3 bg-light small text-muted mt-3">
                        {turno.observaciones}
                      </div>
                    )}
                  </div>

                  <div className="px-3 pb-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-top border-secondary-subtle pt-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary fw-semibold"
                      style={{ borderRadius: '8px' }}
                      onClick={() => pacienteId && navigate(`/pacientes/${pacienteId}`)}
                      disabled={!pacienteId}
                    >
                      <BsJournalMedical className="me-1" /> Ver ficha
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm text-white fw-semibold d-flex align-items-center gap-1"
                      style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                      onClick={() => navigate(`/atencion/${turnoId}`)}
                    >
                      {activo ? (
                        <>
                          <BsCheckCircle size={14} /> Atender
                        </>
                      ) : (
                        <>
                          <BsJournalMedical size={14} /> Ver atención
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

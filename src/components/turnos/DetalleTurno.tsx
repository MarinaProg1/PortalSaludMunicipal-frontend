import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { isAxiosError } from 'axios';
import { BsCalendarEvent, BsArrowLeft, BsPerson, BsPersonBadge, BsClock } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { DetalleTurnoSkeleton } from './DetalleTurnoSkeleton';
import type { TurnoDetalle } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';
import { normalizarEstadoTurno, obtenerNombrePacienteTurno } from './turno.utils';

export const DetalleTurno = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [turno, setTurno] = useState<TurnoDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const fetchTurnoDetail = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get(`/turnos/${id}`);
        if (!activo) return;

        const data = response.data;
        const turnoData = data.turno || data.data || data;
        setTurno(turnoData);
      } catch (err: unknown) {
        if (!activo) return;
        console.error('Error al cargar el detalle del turno:', err);
        const backendMessage = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || 'No se pudo cargar la información del turno.'
          : 'No se pudo cargar la información del turno.';
        setError(backendMessage);
      } finally {
        if (activo) setLoading(false);
      }
    };

    if (id) {
      void fetchTurnoDetail();
    }

    return () => {
      activo = false;
    };
  }, [id]);

  if (loading) {
    return <DetalleTurnoSkeleton />;
  }

  if (error || !turno) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div
          className="card border-0 shadow-sm bg-white p-4 mx-auto"
          style={{ maxWidth: '700px', borderRadius: '12px' }}
        >
          <div className="alert alert-danger mb-3" role="alert">
            {error || 'No se encontró el turno solicitado.'}
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => goBackSafe(navigate)}
          >
            <BsArrowLeft /> Volver
          </button>
        </div>
      </div>
    );
  }

  const estadoNormalizado = normalizarEstadoTurno(turno.estado);

  const getBadgeColor = (estado: string) => {
    switch (normalizarEstadoTurno(estado)) {
      case 'confirmado':
        return 'bg-success text-white';
      case 'pendiente':
        return 'bg-warning text-dark';
      case 'cancelado':
        return 'bg-danger text-white';
      case 'atendido':
      case 'finalizado':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary text-white';
    }
  };

  const nombrePaciente = obtenerNombrePacienteTurno({
    ...turno,
    id: turno.id || '',
    estado: estadoNormalizado,
    activo: true,
  });

  const dniPaciente =
    typeof turno.paciente === 'object' && turno.paciente !== null
      ? turno.paciente.dni
      : undefined;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div
        className="card border-0 shadow-sm bg-white p-4 mx-auto"
        style={{ maxWidth: '700px', borderRadius: '12px' }}
      >
        <PageHeader
          titulo="Detalle del Turno"
          subtitulo="Información completa de la cita médica registrada."
          icon={<BsCalendarEvent className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => goBackSafe(navigate)}
        />

        <div className="row g-4">
          <div className="col-12 d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
            <span className="text-secondary fw-semibold small">Estado actual:</span>
            <span
              className={`badge px-3 py-2 text-uppercase ${getBadgeColor(estadoNormalizado)}`}
              style={{ fontSize: '0.85rem', borderRadius: '6px' }}
            >
              {estadoNormalizado}
            </span>
          </div>

          <div className="col-md-6">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-semibold">
                <BsPerson size={16} style={{ color: '#00ACB2' }} />
                PACIENTE
              </div>
              <h5 className="fw-bold text-dark mb-1">{nombrePaciente}</h5>
              {dniPaciente && <p className="text-muted small mb-0">DNI: {dniPaciente}</p>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-semibold">
                <BsPersonBadge size={16} style={{ color: '#00ACB2' }} />
                PROFESIONAL
              </div>
              <h5 className="fw-bold text-dark mb-1">
                Dr./Dra. {turno.medico?.nombre || ''} {turno.medico?.apellido || ''}
              </h5>
              <p className="text-muted small mb-0 fw-medium" style={{ color: '#00ACB2' }}>
                {turno.especialidad?.nombre || '-'}
              </p>
            </div>
          </div>

          <div className="col-12">
            <div className="p-3 border border-secondary-subtle rounded-3 bg-white d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-2 text-white" style={{ backgroundColor: '#00ACB2' }}>
                  <BsClock size={20} />
                </div>
                <div>
                  <span className="text-muted small d-block">Fecha y Hora programada</span>
                  <strong className="text-dark">
                    {new Date(turno.fecha).toLocaleDateString('es-ES', {
                      timeZone: 'UTC',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    - {turno.hora} hs
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {turno.observaciones && (
            <div className="col-12">
              <div className="p-3 border border-secondary-subtle rounded-3 bg-white">
                <span className="text-muted small d-block mb-1 fw-semibold">Observaciones</span>
                <p className="mb-0 text-dark">{turno.observaciones}</p>
              </div>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary-subtle">
          <button
            type="button"
            className="btn text-white fw-semibold px-4 shadow-sm"
            style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
            onClick={() => goBackSafe(navigate)}
          >
            Aceptar / Volver
          </button>
        </div>
      </div>
    </div>
  );
};
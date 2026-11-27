import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import {
  BsCalendarCheck,
  BsHeartPulse,
  BsJournalMedical,
  BsPersonBadge,
} from 'react-icons/bs';
import { isAxiosError } from 'axios';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { estadoTurnoClase, formatearFecha } from '../pacientePortal/pacientePortal.schema';
import type { ConsultaMedicaItem } from './ConsultasMedicasLista';

const extraerConsulta = (payload: unknown): ConsultaMedicaItem | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  if (record.data && typeof record.data === 'object') {
    return record.data as ConsultaMedicaItem;
  }
  return record as ConsultaMedicaItem;
};

export const ConsultaMedicaDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [consulta, setConsulta] = useState<ConsultaMedicaItem | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchConsulta = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get(`/consultasmedicas/${id}`);
        if (!isMounted) return;

        const dataConsulta = extraerConsulta(response.data);
        if (!dataConsulta) {
          setError('No se encontró la consulta solicitada.');
          return;
        }
        setConsulta(dataConsulta);
        setError(null);
      } catch (err) {
        console.error('Error al obtener consulta médica:', err);
        if (isMounted) {
          const msg = isAxiosError<{ message?: string }>(err)
            ? err.response?.data?.message || 'No se pudo cargar la consulta médica.'
            : 'No se pudo cargar la consulta médica.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchConsulta();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!id) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '900px' }}>
        <PageHeader
          titulo="Detalle de Consulta Médica"
          subtitulo="Identificador de consulta no válido."
          icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => goBackSafe(navigate)}
        />
      </div>
    );
  }

  if (loading) {
    return <div className="container-fluid py-4 text-muted">Cargando detalle de consulta...</div>;
  }

  if (error || !consulta) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '900px' }}>
        <PageHeader
          titulo="Detalle de Consulta Médica"
          subtitulo={error || 'No se encontró la consulta médica.'}
          icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => goBackSafe(navigate)}
        />
      </div>
    );
  }

  const pacienteObj =
    consulta.paciente && typeof consulta.paciente === 'object' ? consulta.paciente : null;
  const medicoObj =
    consulta.medico && typeof consulta.medico === 'object' ? consulta.medico : null;

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '900px' }}>
      <PageHeader
        titulo="Detalle de Consulta Médica"
        subtitulo={`Fecha de registro: ${formatearFecha(consulta.fecha || '')}`}
        icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
        rightContent={
          consulta.estado ? (
            <div className="d-flex align-items-center gap-2">
              <span className={`badge px-2 py-1 text-uppercase ${estadoTurnoClase(consulta.estado)}`}>
                {consulta.estado}
              </span>
            </div>
          ) : undefined
        }
      />

      <div className="row g-3">
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <BsPersonBadge style={{ color: '#00ACB2' }} /> Paciente y Profesional
              </h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Paciente</dt>
                <dd className="col-7 text-dark">
                  {pacienteObj
                    ? `${pacienteObj.apellido || ''}${pacienteObj.apellido && pacienteObj.nombre ? ', ' : ''}${pacienteObj.nombre || ''}`
                    : typeof consulta.paciente === 'string'
                      ? consulta.paciente
                      : '-'}
                </dd>

                <dt className="col-5 text-muted">DNI</dt>
                <dd className="col-7 text-dark">{pacienteObj?.dni || '-'}</dd>

                <dt className="col-5 text-muted">Email</dt>
                <dd className="col-7 text-dark">{pacienteObj?.email || '-'}</dd>

                <dt className="col-5 text-muted">Médico</dt>
                <dd className="col-7 text-dark">
                  {medicoObj
                    ? `Dr./Dra. ${medicoObj.nombre || ''} ${medicoObj.apellido || ''}`.trim()
                    : '-'}
                </dd>

                <dt className="col-5 text-muted">Matrícula</dt>
                <dd className="col-7 text-dark">{medicoObj?.numeroMatricula || '-'}</dd>

                <dt className="col-5 text-muted">Fecha</dt>
                <dd className="col-7 text-dark">
                  <span className="d-inline-flex align-items-center gap-1">
                    <BsCalendarCheck style={{ color: '#00ACB2' }} />
                    {formatearFecha(consulta.fecha || '')}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <BsJournalMedical style={{ color: '#00ACB2' }} /> Evolución Clínica
              </h6>

              <div className="mb-3">
                <span className="text-muted small d-block fw-semibold">Motivo de consulta</span>
                <p className="mb-0 small text-dark">{consulta.motivo || 'Sin registrar'}</p>
              </div>

              <div className="mb-3">
                <span className="text-muted small d-block fw-semibold">Diagnóstico</span>
                <p className="mb-0 small text-dark">{consulta.diagnostico || 'Sin registrar'}</p>
              </div>

              <div className="mb-3">
                <span className="text-muted small d-block fw-semibold">Tratamiento y recomendaciones</span>
                <p className="mb-0 small text-dark">{consulta.tratamiento || 'Sin registrar'}</p>
              </div>

              <div>
                <span className="text-muted small d-block fw-semibold">Observaciones</span>
                <p className="mb-0 small text-dark">{consulta.observaciones || 'Sin observaciones'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
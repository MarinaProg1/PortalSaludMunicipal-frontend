import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BsHeartPulse,
  BsJournalMedical,
  BsPencilSquare,
  BsCalendarPlus,
  BsCalendarCheck,
  BsClock,
  BsPersonBadge,
} from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { pacienteService } from '../../services/paciente.service';
import {
  getObraSocialNombre,
  getRefId,
  getTurnoId,
  type PacienteConsulta,
  type PacienteItem,
  type PacienteTurno,
} from './paciente.schema';
import { estadoTurnoClase, formatearFecha } from '../pacientePortal/pacientePortal.schema';
import toast from 'react-hot-toast';

export const PacienteDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<PacienteItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [turnos, setTurnos] = useState<PacienteTurno[]>([]);
  const [consultas, setConsultas] = useState<PacienteConsulta[]>([]);
  const [verHistorial, setVerHistorial] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const data = await pacienteService.obtener(id);
        setPaciente(data);
      } catch (e) {
        console.error(e);
        toast.error('No se pudo cargar el paciente');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      try {
        setCargandoHistorial(true);
        const data = await pacienteService.historial(id, verHistorial);
        if (mounted) {
          setTurnos(data.turnos);
          setConsultas(data.consultas);
        }
      } catch (e) {
        console.error(e);
        if (mounted) toast.error('No se pudo cargar el historial de turnos');
      } finally {
        if (mounted) setCargandoHistorial(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, verHistorial]);

  if (loading) return <div className="container-fluid py-4 text-muted">Cargando...</div>;

  if (!paciente) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <PageHeader
          titulo="Paciente"
          subtitulo="No se encontro el paciente solicitado."
          icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => navigate(-1)}
        />
      </div>
    );
  }

  const telefono = paciente.telefono
    ? `${paciente.telefono.codigoArea || ''} ${paciente.telefono.numero || ''}`.trim()
    : '';

  const direccion = paciente.direccion
    ? [
        paciente.direccion.calle,
        paciente.direccion.numero,
        paciente.direccion.piso ? `Piso ${paciente.direccion.piso}` : '',
        paciente.direccion.departamento ? `Depto ${paciente.direccion.departamento}` : '',
        paciente.direccion.barrio,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={`${paciente.apellido}, ${paciente.nombre}`}
        subtitulo={`DNI ${paciente.dni}`}
        icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
        rightContent={
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary fw-semibold d-flex align-items-center gap-2"
              style={{ borderRadius: '10px' }}
              onClick={() => navigate(`/turnos/nuevo?paciente=${id}`)}
            >
              <BsCalendarPlus size={18} /> Sacar turno
            </button>
            <button
              className="btn text-white fw-semibold d-flex align-items-center gap-2 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '10px' }}
              onClick={() => navigate(`/pacientes/editar/${id}`)}
            >
              <BsPencilSquare size={18} /> Editar
            </button>
          </div>
        }
      />

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Datos personales</h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Nombre y apellido</dt>
                <dd className="col-7 text-dark">{paciente.apellido}, {paciente.nombre}</dd>

                <dt className="col-5 text-muted">DNI</dt>
                <dd className="col-7 text-dark">{paciente.dni}</dd>

                <dt className="col-5 text-muted">Sexo</dt>
                <dd className="col-7 text-dark text-capitalize">{(paciente.sexo || '').toLowerCase()}</dd>

                <dt className="col-5 text-muted">Email</dt>
                <dd className="col-7 text-dark">{paciente.email || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Contacto y obra social</h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Telefono</dt>
                <dd className="col-7 text-dark">{telefono || '-'}</dd>

                <dt className="col-5 text-muted">Direccion</dt>
                <dd className="col-7 text-dark">{direccion || '-'}</dd>

                <dt className="col-5 text-muted">Obra social</dt>
                <dd className="col-7 text-dark">{getObraSocialNombre(paciente)}</dd>

                <dt className="col-5 text-muted">Nro. afiliado</dt>
                <dd className="col-7 text-dark">{paciente.numeroAfiliado || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <div className="d-flex align-items-center gap-2">
                  <BsJournalMedical style={{ color: '#00ACB2' }} />
                  <h6 className="fw-bold text-dark mb-0">Turnos y consultas</h6>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm fw-semibold"
                  style={{ borderRadius: '8px' }}
                  onClick={() => setVerHistorial((valor) => !valor)}
                  disabled={cargandoHistorial}
                >
                  {verHistorial ? 'Ver últimos 30 días' : 'Ver historial completo'}
                </button>
              </div>

              <small className="text-muted d-block mb-3">
                {verHistorial
                  ? 'Mostrando todo el historial de turnos.'
                  : 'Mostrando turnos futuros y los de los últimos 30 días.'}
              </small>

              {cargandoHistorial ? (
                <p className="text-muted small mb-0">Cargando turnos...</p>
              ) : turnos.length === 0 ? (
                <p className="text-muted small mb-0">
                  Este paciente no tiene turnos en el período seleccionado.
                </p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {turnos.map((turno) => {
                    const turnoId = getTurnoId(turno);
                    const consulta = consultas.find((item) => getRefId(item.turno) === turnoId);

                    return (
                      <div key={turnoId} className="border rounded-3 p-3">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                          <div className="d-flex flex-wrap align-items-center gap-3 small fw-semibold text-dark">
                            <span className="d-flex align-items-center gap-1">
                              <BsCalendarCheck style={{ color: '#00ACB2' }} />
                              {formatearFecha(turno.fecha)}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <BsClock style={{ color: '#00ACB2' }} />
                              {turno.hora} hs
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <BsPersonBadge style={{ color: '#00ACB2' }} />
                              {turno.medico?.apellido || ''}, {turno.medico?.nombre || ''}
                            </span>
                            <span className="text-muted">{turno.especialidad?.nombre || '-'}</span>
                          </div>
                          <span className={`badge px-2 py-1 text-uppercase ${estadoTurnoClase(turno.estado || '')}`}>
                            {turno.estado || '-'}
                          </span>
                        </div>

                        {turno.observaciones && (
                          <div className="p-2 rounded-3 bg-light small text-muted mb-2">
                            {turno.observaciones}
                          </div>
                        )}

                        {consulta ? (
                          <div className="rounded-3 border p-3 bg-light small">
                            <div
                              className="fw-bold text-secondary text-uppercase mb-2"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Consulta médica
                            </div>
                            {consulta.motivo && (
                              <p className="mb-1"><span className="fw-semibold">Motivo:</span> {consulta.motivo}</p>
                            )}
                            {consulta.diagnostico && (
                              <p className="mb-1"><span className="fw-semibold">Diagnóstico:</span> {consulta.diagnostico}</p>
                            )}
                            {consulta.tratamiento && (
                              <p className="mb-1"><span className="fw-semibold">Tratamiento y recomendaciones:</span> {consulta.tratamiento}</p>
                            )}
                            {consulta.observaciones && (
                              <p className="mb-0"><span className="fw-semibold">Observaciones:</span> {consulta.observaciones}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted small mb-0">Sin recomendaciones cargadas todavía.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

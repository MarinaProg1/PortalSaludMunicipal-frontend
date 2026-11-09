import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCalendarCheck, BsCalendarPlus, BsClock, BsPersonBadge } from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { pacientePortalService } from '../../services/pacientePortal.service';
import {
  estadoTurnoClase,
  formatearFecha,
  type MiTurno,
} from './pacientePortal.schema';
import toast from 'react-hot-toast';

const fechaDeTurno = (turno: MiTurno): Date => {
  const [anio, mes, dia] = (turno.fecha || '').slice(0, 10).split('-').map(Number);
  const [hora, minuto] = (turno.hora || '00:00').split(':').map(Number);
  return new Date(anio || 0, (mes || 1) - 1, dia || 1, hora || 0, minuto || 0);
};

const TarjetaTurno: React.FC<{ turno: MiTurno; onVer: () => void }> = ({ turno, onVer }) => (
  <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
    <div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <span className="text-muted small d-block">Especialidad</span>
          <h6 className="fw-bold text-dark mb-0">{turno.especialidad?.nombre || 'Sin especialidad'}</h6>
        </div>
        <span className={`badge px-2 py-1 text-uppercase ${estadoTurnoClase(turno.estado)}`}>
          {turno.estado || '-'}
        </span>
      </div>

      <div className="d-flex align-items-center gap-2 text-dark mb-2">
        <BsPersonBadge style={{ color: '#00ACB2' }} />
        <span className="fw-medium">
          Dr./Dra. {turno.medico?.apellido || ''}, {turno.medico?.nombre || ''}
        </span>
      </div>

      <div className="d-flex align-items-center gap-2 text-dark mb-3">
        <BsCalendarCheck style={{ color: '#00ACB2' }} />
        <span className="fw-semibold">{formatearFecha(turno.fecha)}</span>
        <BsClock className="ms-2" style={{ color: '#00ACB2' }} />
        <span>{turno.hora} hs</span>
      </div>

      {turno.observaciones && (
        <div className="p-2 rounded-3 bg-light small text-muted mb-3">
          {turno.observaciones}
        </div>
      )}

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm fw-semibold w-100"
        style={{ borderRadius: '8px' }}
        onClick={onVer}
      >
        Ver detalle y recomendaciones
      </button>
    </div>
  </div>
);

export const MisTurnos: React.FC = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<MiTurno[]>([]);
  const [loading, setLoading] = useState(true);
  const [verHistorial, setVerHistorial] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await pacientePortalService.misTurnos(verHistorial);
        if (mounted) setTurnos(data);
      } catch (e) {
        console.error(e);
        if (mounted) toast.error('No se pudieron cargar tus turnos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [verHistorial]);

  const { proximos, anteriores } = useMemo(() => {
    const ahora = new Date();
    const ordenados = [...turnos].sort((a, b) => fechaDeTurno(a).getTime() - fechaDeTurno(b).getTime());
    const activos = ordenados.filter((t) => (t.estado || '').toUpperCase() !== 'CANCELADO');

    return {
      proximos: activos.filter((t) => fechaDeTurno(t) >= ahora),
      anteriores: activos.filter((t) => fechaDeTurno(t) < ahora).reverse(),
    };
  }, [turnos]);

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Mis Turnos"
        subtitulo="Consultá tus próximos turnos y sacá uno nuevo."
        icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
        rightContent={
          <button
            className="btn text-white fw-semibold d-flex align-items-center gap-2 shadow-sm"
            style={{ backgroundColor: '#00ACB2', borderRadius: '10px', padding: '8px 16px' }}
            onClick={() => navigate('/mis-turnos/nuevo')}
          >
            <BsCalendarPlus size={18} />
            Sacar turno
          </button>
        }
      />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <small className="text-muted">
          {verHistorial
            ? 'Mostrando todo el historial de turnos.'
            : 'Mostrando turnos futuros y los de los últimos 30 días.'}
        </small>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm fw-semibold"
          style={{ borderRadius: '8px' }}
          onClick={() => setVerHistorial((valor) => !valor)}
          disabled={loading}
        >
          {verHistorial ? 'Ver solo últimos 30 días' : 'Ver historial completo'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Cargando tus turnos...</div>
      ) : (
        <div className="d-flex flex-column gap-4">
          <section>
            <h6 className="fw-bold text-secondary text-uppercase small mb-3">Próximos turnos</h6>
            {proximos.length > 0 ? (
              <div className="row g-3">
                {proximos.map((turno, index) => (
                  <div className="col-12 col-md-6 col-xl-4" key={turno.id || turno._id || index}>
                    <TarjetaTurno turno={turno} onVer={() => navigate(`/mis-turnos/${turno.id || turno._id}`)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card border-0 shadow-sm bg-white p-4 text-center" style={{ borderRadius: '12px' }}>
                <p className="text-muted mb-3">No tenés turnos próximos.</p>
                <button
                  className="btn btn-outline-secondary fw-semibold align-self-center d-flex align-items-center gap-2"
                  style={{ borderRadius: '10px' }}
                  onClick={() => navigate('/mis-turnos/nuevo')}
                >
                  <BsCalendarPlus size={18} /> Sacar un turno
                </button>
              </div>
            )}
          </section>

          {anteriores.length > 0 && (
            <section>
              <h6 className="fw-bold text-secondary text-uppercase small mb-3">Turnos anteriores</h6>
              <div className="row g-3">
                {anteriores.map((turno, index) => (
                  <div className="col-12 col-md-6 col-xl-4" key={turno.id || turno._id || index}>
                    <TarjetaTurno turno={turno} onVer={() => navigate(`/mis-turnos/${turno.id || turno._id}`)} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

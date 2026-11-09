import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BsCalendarCheck,
  BsClock,
  BsFileEarmarkMedical,
  BsInfoCircle,
  BsJournalMedical,
  BsPersonBadge,
} from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { pacientePortalService } from '../../services/pacientePortal.service';
import {
  estadoTurnoClase,
  formatearFecha,
  type DetalleTurnoPaciente as DetalleTurnoPacienteType,
} from './pacientePortal.schema';
import toast from 'react-hot-toast';

const BloqueTexto: React.FC<{ titulo: string; texto?: string }> = ({ titulo, texto }) => {
  if (!texto) return null;

  return (
    <div className="mb-3">
      <h6 className="fw-bold text-secondary small text-uppercase mb-1">{titulo}</h6>
      <p className="text-dark mb-0" style={{ whiteSpace: 'pre-line' }}>{texto}</p>
    </div>
  );
};

export const DetalleTurnoPaciente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState<DetalleTurnoPacienteType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await pacientePortalService.miTurno(id);
        if (mounted) setDetalle(data);
      } catch (e) {
        console.error(e);
        if (mounted) toast.error('No se pudo cargar el detalle del turno');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="container-fluid px-2 px-md-4 py-4 text-muted">Cargando el turno...</div>;

  if (!detalle?.turno) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <PageHeader
          titulo="Detalle del Turno"
          subtitulo="No se encontró el turno solicitado."
          icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => navigate('/mis-turnos')}
        />
      </div>
    );
  }

  const { turno, consulta } = detalle;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Detalle del Turno"
        subtitulo="Consultá el motivo, el diagnóstico y las recomendaciones de tu médico."
        icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate('/mis-turnos')}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                <div>
                  <span className="text-muted small d-block">Especialidad</span>
                  <h6 className="fw-bold text-dark mb-0">{turno.especialidad?.nombre || '-'}</h6>
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

              <div className="d-flex align-items-center gap-2 text-dark mb-2">
                <BsCalendarCheck style={{ color: '#00ACB2' }} />
                <span className="fw-semibold">{formatearFecha(turno.fecha)}</span>
              </div>

              <div className="d-flex align-items-center gap-2 text-dark">
                <BsClock style={{ color: '#00ACB2' }} />
                <span>{turno.hora} hs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <BsJournalMedical style={{ color: '#00ACB2' }} size={20} />
                <h6 className="fw-bold text-dark mb-0">Consulta y recomendaciones</h6>
              </div>

              {consulta ? (
                <>
                  <BloqueTexto titulo="Motivo de la consulta" texto={consulta.motivo || turno.observaciones} />
                  <BloqueTexto titulo="Diagnóstico" texto={consulta.diagnostico} />
                  <BloqueTexto titulo="Tratamiento y recomendaciones" texto={consulta.tratamiento} />
                  <BloqueTexto titulo="Observaciones del médico" texto={consulta.observaciones} />

                  <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top border-secondary-subtle text-muted small">
                    <BsFileEarmarkMedical />
                    Información cargada por el médico tratante.
                  </div>
                </>
              ) : (
                <div className="alert alert-info d-flex align-items-start gap-2 mb-0" role="alert">
                  <BsInfoCircle size={20} className="flex-shrink-0 mt-1" />
                  <div>
                    Todavía no hay recomendaciones cargadas para este turno.
                    <br />
                    <span className="small">
                      Cuando el médico finalice la consulta, vas a poder ver acá el diagnóstico y las indicaciones.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

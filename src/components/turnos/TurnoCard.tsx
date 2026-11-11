import React from 'react';
import { ActionButtons } from '../../constants/ActionButtons';
import { BsCalendarEvent, BsCheckCircle, BsClock, BsXCircle } from 'react-icons/bs';
import type { TurnoCardProps} from './turno.schema';
import { esFechaDeHoy, formatearFechaTurno } from './turno.utils';


export const TurnoCard: React.FC<TurnoCardProps> = ({
  turno,
  onView,
  onEdit,
  onDelete,
  onCancel,
  onMarkAttended,
}) => {
  const estadoLower = turno.estado?.toLowerCase() || '';
  const turnoEsDeHoy = esFechaDeHoy(turno.fecha);
  const esCancelado = estadoLower === 'cancelado';
  return (
    <div className="col-12 col-md-6">
      <div
        className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column justify-content-between"
        style={{ borderRadius: '12px', transition: 'transform 0.2s' }}
      >
        <div>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <span className="text-muted small d-block">Paciente</span>
              <h6 className="fw-bold text-dark mb-0 fs-5">
                {turno.paciente?.nombre} {turno.paciente?.apellido}
              </h6>
            </div>
            <span className={`badge px-2 py-1 text-uppercase ${
              estadoLower === 'confirmado' ? 'bg-success-subtle text-success' :
              estadoLower === 'pendiente' ? 'bg-warning-subtle text-warning text-dark' :
              estadoLower === 'atendido' ? 'bg-info-subtle text-info fw-bold' :
              'bg-danger-subtle text-danger'
            }`}>
              {turno.estado}
            </span>
          </div>

          <hr className="my-2 border-secondary-subtle" />

          <div className="row g-2 small mb-3">
            <div className="col-6">
              <span className="text-muted d-block">Médico</span>
              <span className="fw-medium text-dark">
                Dr./Dra. {turno.medico?.nombre} {turno.medico?.apellido}
              </span>
            </div>
            <div className="col-6">
              <span className="text-muted d-block">Especialidad</span>
              <span className="fw-medium text-dark">{turno.especialidad?.nombre}</span>
            </div>
            <div className="col-12 mt-2 d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-1 text-secondary">
                <BsCalendarEvent size={14} />
                <span className="fw-semibold text-dark">{formatearFechaTurno(turno.fecha)}</span>
              </div>
              <div className="d-flex align-items-center gap-1 text-secondary">
                <BsClock size={14} />
                <span className="fw-semibold text-dark">{turno.hora} hs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary-subtle">
          <div>
            {estadoLower !== 'atendido' && turnoEsDeHoy && (
              <button
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 px-2 py-1 fw-semibold"
                style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                onClick={onMarkAttended}
                title="Marcar turno como atendido"
              >
                <BsCheckCircle size={14} />
                Atender
              </button>
            )}

            {onCancel && !esCancelado && estadoLower !== 'atendido' && (
              <button
                className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-2 py-1 fw-semibold text-dark"
                style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                onClick={onCancel}
                title="Cancelar turno"
              >
                <BsXCircle size={14} className="text-warning" />
                Cancelar
              </button>
            )}
          </div>
          <ActionButtons onView={onView} onEdit={onEdit} onDelete={onDelete} />
  
        </div>
      </div>
    </div>
  );
};

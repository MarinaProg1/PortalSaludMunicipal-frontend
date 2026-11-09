import React from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import type { CalendarioMensualProps} from './turno.schema';


const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const CalendarioMensual: React.FC<CalendarioMensualProps> = ({
  titulo,
  anio,
  mes,
  dias,
  fechaSeleccionada,
  loading,
  onCambiarMes,
  onSeleccionarFecha,
}) => (
  <>
    <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3">
      <h5 className="fw-bold text-dark m-0">{titulo}</h5>
      <div className="d-flex align-items-center gap-3">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onCambiarMes('prev')}>
          <BsChevronLeft />
        </button>
        <span className="fw-bold text-secondary" style={{ minWidth: '130px', textAlign: 'center' }}>
          {nombresMeses[mes - 1]} {anio}
        </span>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onCambiarMes('next')}>
          <BsChevronRight />
        </button>
      </div>
    </div>

    {loading ? (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm text-info" role="status"></div>
        <span className="ms-2 text-muted small">Cargando disponibilidad del mes...</span>
      </div>
    ) : (
      <div>
        <div className="d-flex gap-3 mb-3 small text-muted">
          <span className="d-flex align-items-center gap-1"><span className="badge bg-success rounded-circle p-2"></span> Días con turnos libres</span>
          <span className="d-flex align-items-center gap-1"><span className="badge bg-secondary rounded-circle p-2"></span> Sin turnos / Ocupado</span>
        </div>
        <div className="row g-2">
          {dias.map((dia) => {
            const esSeleccionado = fechaSeleccionada === dia.fecha;

            return (
              <div key={dia.fecha} className="col-3 col-md-2 col-lg-1">
                <button
                  type="button"
                  onClick={() => onSeleccionarFecha(dia.fecha)}
                  className={`btn w-100 py-2 d-flex flex-column align-items-center shadow-sm ${
                    esSeleccionado
                      ? 'btn-info text-white border-dark fw-bold'
                      : dia.tieneDisponibilidad
                        ? 'btn-outline-primary text-dark border-primary'
                        : 'btn-outline-primary bg-light text-muted opacity-25'
                  }`}
                  style={{ borderRadius: '8px' }}
                >
                  <span style={{ fontSize: '0.75rem' }}>Día</span>
                  <span className="fs-5 fw-bold">{dia.diaNum}</span>
                  <small style={{ fontSize: '0.65rem' }}>
                    {dia.tieneDisponibilidad ? `${dia.totalLibres} libres` : 'Completo'}
                  </small>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </>
);

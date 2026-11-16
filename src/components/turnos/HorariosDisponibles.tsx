import React from 'react';
import { BsClock } from 'react-icons/bs';
import type { HorariosDisponiblesProps } from './turno.schema';


export const HorariosDisponibles: React.FC<HorariosDisponiblesProps> = ({
  fecha,
  todosLosSlots,
  horariosDisponibles,
  loading,
  onSeleccionar,
}) => (
  <div className="mt-5 p-4 border rounded-3 bg-light-subtle">
    <h6 className="fw-bold text-dark mb-3">
      Horarios para el día: <span className="text-info">{fecha}</span>
    </h6>

    {loading ? (
      <div className="text-center py-3 text-muted">Calculando horarios...</div>
    ) : (
      <div className="row g-2">
        {todosLosSlots.map((slot) => {
          const esLibre = horariosDisponibles.includes(slot);

          return (
            <div key={slot} className="col-3 col-md-2">
              <button
                type="button"
                disabled={!esLibre}
                onClick={() => onSeleccionar(slot)}
                className={`btn w-100 py-2 fw-semibold shadow-sm ${
                  esLibre
                    ? 'btn-outline-primary text-dark border border-primary'
                    : 'btn-outline-danger  text-danger border-danger'

                }`}
                style={{ borderRadius: '8px', fontSize: '0.9rem' }}
              >
                <BsClock className="me-1" /> {slot}
              </button>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

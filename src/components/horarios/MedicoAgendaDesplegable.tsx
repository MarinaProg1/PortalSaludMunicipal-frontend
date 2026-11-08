import React from 'react';
import { BsCalendarEvent, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import type {MedicoAgendaDesplegableProps} from './horario.schema';


const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const diasSemanaCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const MedicoAgendaDesplegable: React.FC<MedicoAgendaDesplegableProps> = ({
  mesActual,
  diasMes,
  cargandoMes,
  fechaSeleccionada,
  slotsDisponibles,
  cargandoSlots,
  onCambiarMes,
  onSeleccionarDia,
}) => {
  return (
    <div className="border-top border-secondary-subtle bg-light p-3 p-md-4">
      <div className="row g-4">
        
        {/* Columna Izquierda: Calendario Mensual */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <BsCalendarEvent className="text-primary" />
                Seleccionar Día ({nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()})
              </h6>
              <div className="btn-group">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onCambiarMes('anterior')}>
                  <BsChevronLeft />
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onCambiarMes('siguiente')}>
                  <BsChevronRight />
                </button>
              </div>
            </div>

            {cargandoMes ? (
              <div className="text-center py-5">
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span className="ms-2 small text-muted">Cargando disponibilidad...</span>
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-2 justify-content-start">
                {diasMes.map((d) => {
                  const esSeleccionado = fechaSeleccionada === d.fecha;
                  const fechaObj = new Date(`${d.fecha}T00:00:00Z`);
                  const nombreDia = diasSemanaCortos[fechaObj.getUTCDay()];

                  return (
                    <button
                      key={d.fecha}
                      type="button"
                      disabled={!d.tieneDisponibilidad}
                      onClick={() => onSeleccionarDia(d.fecha, d.tieneDisponibilidad)}
                      className={`btn btn-sm d-flex flex-column align-items-center justify-content-center p-1 rounded-3 ${
                        esSeleccionado
                          ? 'text-white'
                          : d.tieneDisponibilidad
                          ? 'btn-outline-success bg-success-subtle text-success border-success'
                          : 'btn-light text-muted border-0 opacity-50'
                      }`}
                      style={{
                        width: '58px',
                        height: '66px',
                        backgroundColor: esSeleccionado ? '#00ACB2' : undefined,
                        borderColor: esSeleccionado ? '#00ACB2' : undefined
                      }}
                    >
                      <span className="fs-8 text-uppercase opacity-75">{nombreDia}</span>
                      <span className="fw-bold fs-6">{d.diaNum}</span>
                      <span className={`badge mt-1 px-1 py-0 fs-8 ${esSeleccionado ? 'bg-white text-dark' : 'bg-white text-dark shadow-xs'}`}>
                        {d.totalLibres} lib.
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Horarios / Slots Disponibles (Solo Lectura) */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <h6 className="fw-bold text-dark mb-3">
              Horarios Libres {fechaSeleccionada ? `(${fechaSeleccionada.split('-').reverse().join('/')})` : ''}
            </h6>

            {!fechaSeleccionada ? (
              <div className="text-center py-5 text-muted small">
                Selecciona un día en el calendario para consultar los horarios disponibles.
              </div>
            ) : cargandoSlots ? (
              <div className="text-center py-5">
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span className="ms-2 small text-muted">Buscando horarios...</span>
              </div>
            ) : slotsDisponibles.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {slotsDisponibles.map((slot) => (
                  <span 
                    key={slot} 
                    className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fs-6 fw-semibold"
                  >
                    {slot} hs
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted small">
                No hay horarios disponibles para esta fecha.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
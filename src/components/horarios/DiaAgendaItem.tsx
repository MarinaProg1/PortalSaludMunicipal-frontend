import React from 'react';
import type {DiaAgendaItemProps } from './horario.schema';
import { BloqueTurnoConfig } from './BloqueTurnoConfig';

export const DiaAgendaItem: React.FC<DiaAgendaItemProps> = ({
  diaKey,
  label,
  diaConf,
  onToggleDia,
  onTurnoChange,
  yaExisteEnBD,
}) => {
  return (
    <div className={`card border ${diaConf.seleccionado ? 'border-info bg-light-subtle shadow-sm' : 'border-secondary-subtle'} p-3`} style={{ borderRadius: '10px', transition: 'all 0.2s' }}>
      
      {/* Fila principal del Día */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id={`check-${diaKey}`}
            checked={diaConf.seleccionado}
            onChange={onToggleDia}
            style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
          />
          <label className="form-check-label fw-bold text-dark ms-2 fs-6" htmlFor={`check-${diaKey}`} style={{ cursor: 'pointer' }}>
            {label}
          </label>
        </div>
        <span className={`badge ${diaConf.seleccionado ? 'bg-info text-dark' : 'bg-secondary text-white'}`}>
          {diaConf.seleccionado ? 'Habilitado' : 'Sin servicio'}
        </span>
      </div>

      {/* Configuración de Turnos si el día está seleccionado */}
      {diaConf.seleccionado && (
        <div className="mt-3 pt-3 border-top border-secondary-subtle row g-3">
          
          <div className="col-md-6">
            <BloqueTurnoConfig 
              titulo="Turno Mañana"
              idCheck={`manana-${diaKey}`}
              activo={diaConf.manana.activo}
              onToggleActivo={(val) => onTurnoChange('manana', 'activo', val)}
              horaInicio={diaConf.manana.horaInicio}
              horaFin={diaConf.manana.horaFin}
              onCambioHoraInicio={(val) => onTurnoChange('manana', 'horaInicio', val)}
              onCambioHoraFin={(val) => onTurnoChange('manana', 'horaFin', val)}
              yaGuardado={yaExisteEnBD('manana')}
            />
          </div>

          <div className="col-md-6">
            <BloqueTurnoConfig 
              titulo="Turno Tarde"
              idCheck={`tarde-${diaKey}`}
              activo={diaConf.tarde.activo}
              onToggleActivo={(val) => onTurnoChange('tarde', 'activo', val)}
              horaInicio={diaConf.tarde.horaInicio}
              horaFin={diaConf.tarde.horaFin}
              onCambioHoraInicio={(val) => onTurnoChange('tarde', 'horaInicio', val)}
              onCambioHoraFin={(val) => onTurnoChange('tarde', 'horaFin', val)}
              yaGuardado={yaExisteEnBD('tarde')}
            />
          </div>

        </div>
      )}

    </div>
  );
};
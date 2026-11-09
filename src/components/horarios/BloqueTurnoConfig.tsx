import React from 'react';
import type { BloqueTurnoConfigProps } from './horario.schema';
import { InputField } from '../../constants/InputField'; // Ajusta la ruta según dónde tengas guardado el InputField
import { BsClock } from 'react-icons/bs';

export const BloqueTurnoConfig: React.FC<BloqueTurnoConfigProps> = ({
  titulo,
  idCheck,
  activo,
  onToggleActivo,
  horaInicio,
  horaFin,
  onCambioHoraInicio,
  onCambioHoraFin,
  yaGuardado,
}) => {
  return (
    <div className={`p-2 rounded border ${yaGuardado ? 'bg-secondary-subtle border-secondary' : 'bg-white border-secondary-subtle'}`}>
      <div className="form-check mb-2 d-flex justify-content-between align-items-center">
        <div>
          <input 
            className="form-check-input" 
            type="checkbox" 
            id={idCheck}
            checked={activo}
            onChange={(e) => onToggleActivo(e.target.checked)}
            disabled={yaGuardado}
          />
          <label className="form-check-label fw-semibold small text-muted ms-2" htmlFor={idCheck}>
            {titulo}
          </label>
        </div>
        {yaGuardado && (
          <span className="badge bg-secondary text-white fs-8">Ya guardado</span>
        )}
      </div>

      {activo && (
        <div className="row g-2">
          <div className="col-6">
            <InputField
              label="Desde"
              labelIcon={<BsClock size={12} className="me-1" />}
              containerClassName="mb-0"
              className="form-control form-control-sm shadow-none"
              value={horaInicio}
              onChange={(e) => onCambioHoraInicio(e.target.value)}
              disabled={yaGuardado}
              required
              placeholder="08:00"
            />
          </div>
          <div className="col-6">
            <InputField
              label="Hasta"
              labelIcon={<BsClock size={12} className="me-1" />}
              containerClassName="mb-0"
              className="form-control form-control-sm shadow-none"
              value={horaFin}
              onChange={(e) => onCambioHoraFin(e.target.value)}
              disabled={yaGuardado}
              required
              placeholder="12:00"
            />
          </div>
        </div>
      )}
    </div>
  );
};
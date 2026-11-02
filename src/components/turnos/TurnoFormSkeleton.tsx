import React from 'react';
import { BsCalendarPlus } from 'react-icons/bs';

export const TurnoFormSkeleton: React.FC = () => {
  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
        
        {/* Cabecera Falsa */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
              <BsCalendarPlus className="me-2 text-muted opacity-50" />
              <span className="placeholder col-6 bg-secondary opacity-25 rounded" style={{ height: '24px', width: '200px' }}></span>
            </h3>
            <p className="text-muted mb-0 small">
              <span className="placeholder col-8 bg-secondary opacity-25 rounded" style={{ height: '14px', width: '150px' }}></span>
            </p>
          </div>
          <button className="btn btn-outline-secondary btn-sm disabled placeholder col-2" style={{ width: '70px' }}></button>
        </div>

        {/* Formulario Falso con efecto placeholder-glow */}
        <div className="placeholder-glow">
          <div className="row g-3">
            
            {/* Paciente */}
            <div className="col-12">
              <span className="placeholder col-2 bg-secondary opacity-50 mb-1 d-block rounded" style={{ height: '12px' }}></span>
              <div className="placeholder col-12 bg-secondary opacity-25 rounded" style={{ height: '38px' }}></div>
            </div>

            {/* Médico */}
            <div className="col-md-6">
              <span className="placeholder col-4 bg-secondary opacity-50 mb-1 d-block rounded" style={{ height: '12px' }}></span>
              <div className="placeholder col-12 bg-secondary opacity-25 rounded" style={{ height: '38px' }}></div>
            </div>

            {/* Especialidad */}
            <div className="col-md-6">
              <span className="placeholder col-4 bg-secondary opacity-50 mb-1 d-block rounded" style={{ height: '12px' }}></span>
              <div className="placeholder col-12 bg-secondary opacity-25 rounded" style={{ height: '38px' }}></div>
            </div>

            {/* Fecha */}
            <div className="col-md-6">
              <span className="placeholder col-3 bg-secondary opacity-50 mb-1 d-block rounded" style={{ height: '12px' }}></span>
              <div className="placeholder col-12 bg-secondary opacity-25 rounded" style={{ height: '38px' }}></div>
            </div>

            {/* Hora */}
            <div className="col-md-6">
              <span className="placeholder col-3 bg-secondary opacity-50 mb-1 d-block rounded" style={{ height: '12px' }}></span>
              <div className="placeholder col-12 bg-secondary opacity-25 rounded" style={{ height: '38px' }}></div>
            </div>

            {/* Estado */}
            <div className="col-12">
              <span className="placeholder col-3 bg-secondary opacity-50 mb-1 d-block rounded" style={{ height: '12px' }}></span>
              <div className="placeholder col-12 bg-secondary opacity-25 rounded" style={{ height: '38px' }}></div>
            </div>

          </div>

          {/* Botones de acción falsos */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
            <div className="placeholder bg-secondary opacity-25 rounded" style={{ width: '90px', height: '38px' }}></div>
            <div className="placeholder bg-secondary opacity-25 rounded" style={{ width: '130px', height: '38px' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
};
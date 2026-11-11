import React from 'react';
import { BsCalendarEvent } from 'react-icons/bs';

export const DetalleMedicoSkeleton: React.FC = () => {
  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
        
        {/* Cabecera Falsa */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
              <BsCalendarEvent className="me-2" style={{ color: '#00ACB2' }} />
              <span className="placeholder col-6 bg-secondary opacity-25 rounded" style={{ height: '24px', width: '180px', display: 'inline-block' }}></span>
            </h3>
            <p className="text-muted mb-0 small">
              <span className="placeholder col-8 bg-secondary opacity-25 rounded" style={{ height: '14px', width: '220px', display: 'inline-block' }}></span>
            </p>
          </div>
          <button className="btn btn-outline-secondary btn-sm disabled placeholder col-2" style={{ width: '70px', height: '31px' }}></button>
        </div>

        {/* Cuerpo Falso con efecto placeholder-glow */}
        <div className="placeholder-glow">
          <div className="row g-4">
            {/* Estado del Medico Falso */}
            <div className="col-12 d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
              <span className="placeholder col-3 bg-secondary opacity-25 rounded" style={{ height: '14px' }}></span>
              <span className="placeholder col-2 bg-secondary opacity-25 rounded" style={{ height: '28px' }}></span>
            </div>
            {/* Nombre Falso */}
            <div className="col-md-6">
              <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
                <span className="placeholder col-4 bg-secondary opacity-25 mb-2 d-block rounded" style={{ height: '12px' }}></span>
                <span className="placeholder col-8 bg-secondary opacity-25 mb-1 d-block rounded" style={{ height: '18px' }}></span>
                <span className="placeholder col-5 bg-secondary opacity-25 d-block rounded" style={{ height: '14px' }}></span>
              </div>
            </div>
            {/* Especialidad Falso */}
            <div className="col-md-6">
              <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
                <span className="placeholder col-5 bg-secondary opacity-25 mb-2 d-block rounded" style={{ height: '12px' }}></span>
                <span className="placeholder col-9 bg-secondary opacity-25 mb-1 d-block rounded" style={{ height: '18px' }}></span>
                <span className="placeholder col-6 bg-secondary opacity-25 d-block rounded" style={{ height: '14px' }}></span>
              </div>
            </div>
            {/* Fecha Falso */}
            <div className="col-12">
              <div className="p-3 border border-secondary-subtle rounded-3 bg-white d-flex align-items-center gap-3">
                <div className="p-3 rounded-2 bg-secondary opacity-25" style={{ width: '40px', height: '40px' }}></div>
                <div className="w-100">
                  <span className="placeholder col-4 bg-secondary opacity-25 mb-1 d-block rounded" style={{ height: '12px' }}></span>
                  <span className="placeholder col-7 bg-secondary opacity-25 d-block rounded" style={{ height: '16px' }}></span>
                </div>
              </div>
            </div>
          </div>
          {/* Pie Falso */}
          <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary-subtle">
            <div className="placeholder bg-secondary opacity-25 rounded" style={{ width: '120px', height: '38px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
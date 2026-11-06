import React from "react";
import { BsCalendarEvent } from "react-icons/bs";

export const DetalleHistorialMedicoSkeleton: React.FC = () => {
  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
        {/* Cabecera falsa */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
              <BsCalendarEvent className="me-2 text-muted opacity-50" />
              <span className="placeholder col-6 bg-secondary opacity-25 rounded" style={{ height: '24px', width: '180px' }}></span>
            </h3>
            <p className="text-muted mb-0 small">
              <span className="placeholder col-8 bg-secondary opacity-25 rounded" style={{ height: '14px', width: '120px' }}></span>
            </p>
          </div>
          <button className="btn btn-outline-secondary btn-sm disabled placeholder col-2" style={{ width: '70px', height: '32px' }}></button>
        </div>

        {/* Cuerpo falso */}
        <div className="placeholder-glow">
          <div className="row g-3">
            {/* Diagnóstico falso */}
            <div className="col-12 d-flex justify-content-between align-items-center bg-light p-3 rounded">
              <span className="placeholder col-2 bg-secondary opacity-25 rounded" style={{ height: '14px' }}></span>
              <span className="placeholder col-2 bg-secondary opacity-25 rounded" style={{ height: '28px' }}></span>
            </div>
            {/* Paciente falso */}
            <div className="col-md-6">
              <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
                <span className="placeholder col-5 bg-secondary opacity-25 mb-2 d-block rounded" style={{ height: '12px' }}></span>
                <span className="placeholder col-8 bg-secondary opacity-25 mb-2 d-block rounded" style={{ height: '16px' }}></span>
                <span className="placeholder col-5 bg-secondary opacity-25 d-block rounded" style={{ height: '14px' }}></span>
              </div>
            </div>
            {/* Médico y Especialidad falso */}
            <div className="col-md-6">
              <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
                <span className="placeholder col-5 bg-secondary opacity-25 mb-2 d-block rounded" style={{ height: '12px' }}></span>
                <span className="placeholder col-9 bg-secondary opacity-25 mb-2 d-block rounded" style={{ height: '16px' }}></span>
                <span className="placeholder col-6 bg-secondary opacity-25 d-block rounded" style={{ height: '14px' }}></span>
              </div>
            </div>
            {/* Fecha falso */}
            <div className="col-12">
              <div className="p-3 border border-secondary-subtle rounded-3 bg-white d-flex align-items-center gap-3">
                <div className="p-3 rounded-2 bg-secondary opacity-25" style={{ width: '40px', height: '40px' }}></div>
                <div className="w-100">
                  <span className="placeholder col-4 bg-secondary opacity-25 mb-1 d-block rounded" style={{ height: '12px' }}></span>
                  <span className="placeholder col-7 bg-secondary opacity-25 d-block rounded" style={{ height: '16px' }}></span>
                </div>
              </div>
            </div>
            {/* Tratamiento falso */}
            <div className="col-12">
              <div className="p-3 border border-secondary-subtle rounded-3 bg-white">
                <span className="placeholder col-4 bg-secondary opacity-25 mb-2 d-block rounded" style={{ height: '12px' }}></span>
                <span className="placeholder col-11 bg-secondary opacity-25 d-block rounded" style={{ height: '14px' }}></span>
              </div>
            </div>
            {/* Observaciones falso */}
            <div className="col-12">
              <div className="p-3 border border-secondary-subtle rounded-3 bg-white">
                <span className="placeholder col-4 bg-secondary opacity-25 mb-2 d-block rounded" style={{ height: '12px' }}></span>
                <span className="placeholder col-10 bg-secondary opacity-25 d-block rounded" style={{ height: '14px' }}></span>
              </div>
            </div>
          </div>
          {/* Pie de tarjeta falso */}
          <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary-subtle">
            <div className="placeholder bg-secondary opacity-25 rounded" style={{ width: '90px', height: '38px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
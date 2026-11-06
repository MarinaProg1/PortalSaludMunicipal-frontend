import React from 'react';

export const HorarioAtencionFormSkeleton: React.FC = () => {
  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto placeholder-glow" style={{ maxWidth: '850px', borderRadius: '12px' }}>
        
        {/* Cabecera simulada */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
          <div className="d-flex align-items-center gap-3 w-75">
            {/* Ícono circular */}
            <div className="placeholder rounded-circle bg-secondary" style={{ width: '40px', height: '40px' }}></div>
            <div className="w-75">
              {/* Título */}
              <span className="placeholder col-8 d-block mb-2 bg-secondary rounded" style={{ height: '22px' }}></span>
              {/* Subtítulo */}
              <span className="placeholder col-10 d-block bg-secondary rounded opacity-50" style={{ height: '14px' }}></span>
            </div>
          </div>
          {/* Botón Volver */}
          <span className="placeholder col-1 bg-secondary rounded" style={{ height: '32px' }}></span>
        </div>

        {/* Bloque de Configuración General (Select de médico + Input de duración) */}
        <div className="row g-3 mb-4 p-3 bg-light rounded-3">
          <div className="col-md-8">
            <span className="placeholder col-5 d-block mb-2 bg-secondary rounded opacity-75" style={{ height: '14px' }}></span>
            <span className="placeholder col-12 d-block bg-secondary rounded" style={{ height: '38px' }}></span>
          </div>
          <div className="col-md-4">
            <span className="placeholder col-8 d-block mb-2 bg-secondary rounded opacity-75" style={{ height: '14px' }}></span>
            <span className="placeholder col-12 d-block bg-secondary rounded" style={{ height: '38px' }}></span>
          </div>
        </div>

        {/* Título de sección de días */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="placeholder col-4 bg-secondary rounded" style={{ height: '20px' }}></span>
        </div>

        {/* Listado simulado de días (Generamos 3 o 4 tarjetas de días para simular la lista) */}
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="card border border-secondary-subtle p-3" style={{ borderRadius: '10px' }}>
              <div className="d-flex justify-content-between align-items-center">
                {/* Checkbox y nombre del día */}
                <div className="d-flex align-items-center gap-2">
                  <span className="placeholder bg-secondary rounded" style={{ width: '20px', height: '20px' }}></span>
                  <span className="placeholder bg-secondary rounded" style={{ width: '90px', height: '18px' }}></span>
                </div>
                {/* Badge de estado */}
                <span className="placeholder bg-secondary rounded-pill" style={{ width: '75px', height: '22px' }}></span>
              </div>
            </div>
          ))}
        </div>

        {/* Botones de acción inferiores */}
        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
          <span className="placeholder col-2 bg-secondary rounded" style={{ height: '38px' }}></span>
          <span className="placeholder col-2 bg-secondary rounded" style={{ height: '38px' }}></span>
        </div>

      </div>
    </div>
  );
};
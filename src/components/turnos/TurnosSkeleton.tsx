import React from 'react';

export const TurnosSkeleton: React.FC = () => {
  // Generamos un array de 4 elementos para simular tarjetas cargando
  const skeletons = [1, 2, 3, 4];

  return (
    <div className="row g-3">
      {skeletons.map((item) => (
        <div className="col-12 col-md-6" key={item}>
          <div 
            className="card border-0 shadow-sm p-3 bg-white h-100 placeholder-glow" 
            style={{ borderRadius: '12px' }}
          >
            {/* Cabecera simulada */}
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="w-50">
                <span className="placeholder col-4 rounded mb-1 d-block bg-secondary opacity-25"></span>
                <span className="placeholder col-8 rounded bg-secondary opacity-50" style={{ height: '24px', display: 'block' }}></span>
              </div>
              <span className="placeholder col-3 rounded-pill bg-secondary opacity-25" style={{ height: '22px' }}></span>
            </div>

            <hr className="my-2 border-secondary-subtle" />

            {/* Detalles simulados */}
            <div className="row g-2 small mb-3">
              <div className="col-6">
                <span className="placeholder col-5 rounded mb-1 d-block bg-secondary opacity-25"></span>
                <span className="placeholder col-9 rounded bg-secondary opacity-40" style={{ height: '18px', display: 'block' }}></span>
              </div>
              <div className="col-6">
                <span className="placeholder col-5 rounded mb-1 d-block bg-secondary opacity-25"></span>
                <span className="placeholder col-8 rounded bg-secondary opacity-40" style={{ height: '18px', display: 'block' }}></span>
              </div>

              <div className="col-12 mt-3 d-flex gap-3">
                <span className="placeholder col-4 rounded bg-secondary opacity-30" style={{ height: '16px' }}></span>
                <span className="placeholder col-4 rounded bg-secondary opacity-30" style={{ height: '16px' }}></span>
              </div>
            </div>

            {/* Pie de tarjeta simulado (Botones de acción) */}
            <div className="d-flex justify-content-end pt-2 border-top border-secondary-subtle gap-1">
              <span className="placeholder rounded bg-secondary opacity-25" style={{ width: '32px', height: '32px' }}></span>
              <span className="placeholder rounded bg-secondary opacity-25" style={{ width: '32px', height: '32px' }}></span>
              <span className="placeholder rounded bg-secondary opacity-25" style={{ width: '32px', height: '32px' }}></span>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};
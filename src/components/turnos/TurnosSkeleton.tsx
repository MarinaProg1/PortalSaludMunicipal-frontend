import React from 'react';

export const TurnosSkeleton: React.FC = () => {
  return (
    <>
      {/* SKELETON PARA DISPOSITIVOS MÓVILES (Tarjetas) */}
      <div className="d-block d-lg-none">
        <div className="row g-3">
          {[1, 2, 3].map((n) => (
            <div className="col-12" key={n}>
              <div className="card border-0 shadow-sm p-3 bg-white placeholder-glow" style={{ borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="w-50">
                    <span className="placeholder col-4 rounded mb-1 d-block bg-secondary"></span>
                    <span className="placeholder col-8 rounded bg-secondary fs-5 d-block"></span>
                  </div>
                  <span className="placeholder col-3 rounded-pill bg-secondary py-2"></span>
                </div>
                <hr className="my-2 border-secondary-subtle" />
                <div className="row g-2 small mb-3">
                  <div className="col-6">
                    <span className="placeholder col-5 rounded bg-secondary d-block mb-1"></span>
                    <span className="placeholder col-9 rounded bg-secondary d-block"></span>
                  </div>
                  <div className="col-6">
                    <span className="placeholder col-5 rounded bg-secondary d-block mb-1"></span>
                    <span className="placeholder col-8 rounded bg-secondary d-block"></span>
                  </div>
                </div>
                <div className="d-flex justify-content-end pt-2 border-top border-secondary-subtle">
                  <span className="placeholder col-4 rounded bg-secondary py-2"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SKELETON PARA ESCRITORIO (Tabla Tradicional) */}
      <div className="d-none d-lg-block card border-0 shadow-sm bg-white overflow-hidden placeholder-glow" style={{ borderRadius: '12px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase fs-7 text-secondary border-bottom">
              <tr>
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3">Médico</th>
                <th className="py-3">Especialidad</th>
                <th className="py-3">Fecha y Hora</th>
                <th className="py-3">Estado</th>
                <th className="py-3 text-end px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((n) => (
                <tr key={n}>
                  <td className="px-4"><span className="placeholder col-8 rounded bg-secondary d-block py-2"></span></td>
                  <td><span className="placeholder col-7 rounded bg-secondary d-block py-2"></span></td>
                  <td><span className="placeholder col-6 rounded bg-secondary d-block py-2"></span></td>
                  <td><span className="placeholder col-7 rounded bg-secondary d-block py-2"></span></td>
                  <td><span className="placeholder col-6 rounded-pill bg-secondary d-block py-2"></span></td>
                  <td className="text-end px-4"><span className="placeholder col-5 rounded bg-secondary d-block py-2 ms-auto"></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
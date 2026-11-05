import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clientesAxios from '../../config/axios';
import { EspecialidadesSkeleton } from './EspecialidadesSkeleton.tsx';

interface Especialidad {
  id: string;
  nombre: string;
  descripcion?: string;
}

export const EspecialidadesLista: React.FC = () => {
  const navigate = useNavigate();
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await clientesAxios.get('/especialidades');
        const data = res.data.especialidades || res.data.data || res.data;
        setEspecialidades(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <EspecialidadesSkeleton />;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Especialidades</h3>
          <p className="text-muted mb-0 small">Listado de especialidades del centro de salud.</p>
        </div>
        <button className="btn text-white btn-sm" style={{ backgroundColor: '#00ACB2' }} onClick={() => navigate('/especialidades/nuevo')}>
          + Nueva Especialidad
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {especialidades.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-muted py-4">No hay especialidades registradas.</td></tr>
              ) : especialidades.map((esp) => (
                <tr key={esp.id}>
                  <td className="fw-semibold">{esp.nombre}</td>
                  <td className="text-muted small">{esp.descripcion || '-'}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => navigate(`/especialidades/${esp.id}`)}>Ver</button>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/especialidades/editar/${esp.id}`)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
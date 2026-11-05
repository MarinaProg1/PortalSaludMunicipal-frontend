import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import clientesAxios from '../../config/axios';
import { EspecialidadFormSkeleton } from './EspecialidadFormSkeleton';

export const EspecialidadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(esEdicion);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const cargar = async () => {
      try {
        const res = await clientesAxios.get(`/especialidades/${id}`);
        const data = res.data.especialidad || res.data.data || res.data;
        setNombre(data.nombre || '');
        setDescripcion(data.descripcion || '');
      } catch{
        setError('No se pudo cargar la especialidad');
      } finally {
        setLoadingData(false);
      }
    };
    cargar();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { nombre, descripcion };
      if (esEdicion) {
        await clientesAxios.put(`/especialidades/${id}`, payload);
      } else {
        await clientesAxios.post('/especialidades', payload);
      }
      navigate('/especialidades');
    } catch (err: unknown) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Error al guardar'
        : 'Error al guardar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <EspecialidadFormSkeleton />;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
        <h3 className="fw-bold text-dark mb-1">{esEdicion ? 'Editar Especialidad' : 'Nueva Especialidad'}</h3>
        <p className="text-muted mb-4 small">Completá los datos de la especialidad.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Nombre *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Cardiología"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small">Descripción</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Descripción de la especialidad..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancelar</button>
            <button type="submit" className="btn text-white" style={{ backgroundColor: '#00ACB2' }} disabled={loading}>
              {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear especialidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
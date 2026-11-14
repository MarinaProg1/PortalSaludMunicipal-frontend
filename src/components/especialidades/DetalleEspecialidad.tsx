import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { BsArrowLeft, BsJournalMedical } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { DetalleEspecialidadSkeleton } from './DetalleEspecialidadSkeleton';

interface EspecialidadDetalle {
  id: string;
  nombre: string;
  descripcion?: string;
}

export const DetalleEspecialidad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [especialidad, setEspecialidad] = useState<EspecialidadDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEspecialidadDetail = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get(`/especialidades/${id}`);
        const data = response.data;
        const especialidadData = data.especialidad || data.data || data;
        setEspecialidad(especialidadData);
      } catch (err: unknown) {
        console.error('Error al cargar el detalle de la especialidad:', err);
        const backendMessage = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || 'No se pudo cargar la información de la especialidad.'
          : 'No se pudo cargar la información de la especialidad.';
        setError(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEspecialidadDetail();
    }
  }, [id]);

  // Estado de Carga - igual que en Turnos
  if (loading) {
    return <DetalleEspecialidadSkeleton />;
  }

  // Pantalla de Error - igual que en Turnos
  if (error || !especialidad) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
          <div className="alert alert-danger mb-3" role="alert">
            {error || 'No se encontró la especialidad solicitada.'}
          </div>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
            <BsArrowLeft /> Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>

        {/* Cabecera - igual que DetalleTurno */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h3 className="fw-bold text-dark mb-1">
              <BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />
              Detalle de la Especialidad
            </h3>
            <p className="text-muted mb-0 small">Información completa de la especialidad registrada.</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
            <BsArrowLeft /> Volver
          </button>
        </div>

        {/* Cuerpo de la Tarjeta */}
        <div className="row g-4">
          <div className="col-12">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-semibold">
                <BsJournalMedical size={16} style={{ color: '#00ACB2' }} />
                ESPECIALIDAD
              </div>
              <h5 className="fw-bold text-dark mb-1">{especialidad.nombre}</h5>
              {especialidad.descripcion && (
                <p className="text-muted small mb-0 fw-medium">{especialidad.descripcion}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pie de tarjeta */}
        <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary-subtle gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/especialidades')}>
            Volver al listado
          </button>
          <button className="btn btn-sm text-white" style={{ backgroundColor: '#00ACB2' }} onClick={() => navigate(`/especialidades/editar/${especialidad.id}`)}>
            Editar
          </button>
        </div>

      </div>
    </div>
  );
};
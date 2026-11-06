import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { BsCalendarEvent, BsArrowLeft, BsPerson, BsPersonBadge, BsClock } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { DetalleHistorialMedicoSkeleton } from './DetalleHistorialMedicoSkeleton';

interface HistorialMedicoDetalle {
  id: string;
  paciente: {
    nombre: string;
    apellido: string;
    dni?: string;
  };
  medico: {
    nombre: string;
    apellido: string;
  };
  especialidad: {
    nombre: string;
  };
  fecha: string;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
}

export const DetalleHistorialMedico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [historial, setHistorial] = useState<HistorialMedicoDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorialDetail = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get(`/historial-medico/${id}`);

        const data = response.data;
        const historialData = data.historial || data.data || data;

        setHistorial(historialData);
      } catch (err: unknown) {
        console.error('Error al cargar el detalle del historial:', err);
        const backendMessage = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || 'No se pudo cargar la información del historial.'
          : 'No se pudo cargar la información del historial.';
        setError(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistorialDetail();
    }
  }, [id]);

  // Estado de Carga
  if (loading) {
    return (
      <DetalleHistorialMedicoSkeleton />
    );
  }

  // Pantalla de Error
  if (error || !historial) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
          <div className="alert alert-danger mb-3" role="alert">
            {error || 'No se encontró el historial solicitado.'}
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

        {/* Cabecera */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h3 className="fw-bold text-dark mb-1">
              <BsCalendarEvent className="me-2" style={{ color: '#00ACB2' }} />
              Detalle del Historial Médico
            </h3>
            <p className="text-muted mb-0 small">Información completa de la consulta médica registrada.</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
            <BsArrowLeft /> Volver
          </button>
        </div>

        {/* Cuerpo de la Tarjeta */}
        <div className="row g-4">

          {/* Diagnóstico */}
          <div className="col-12 d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
            <span className="text-secondary fw-semibold small">Diagnóstico:</span>
            <span className="badge px-3 py-2 text-uppercase" style={{ fontSize: '0.85rem', borderRadius: '6px', backgroundColor: '#00ACB2', color: 'white' }}>
              {historial.diagnostico}
            </span>
          </div>

          {/* Paciente */}
          <div className="col-md-6">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-semibold">
                <BsPerson size={16} style={{ color: '#00ACB2' }} />
                PACIENTE
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {historial.paciente?.nombre} {historial.paciente?.apellido}
              </h5>
              {historial.paciente?.dni && (
                <p className="text-muted small mb-0">DNI: {historial.paciente.dni}</p>
              )}
            </div>
          </div>

          {/* Médico y Especialidad */}
          <div className="col-md-6">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-semibold">
                <BsPersonBadge size={16} style={{ color: '#00ACB2' }} />
                PROFESIONAL
              </div>
              <h5 className="fw-bold text-dark mb-1">
                Dr./Dra. {historial.medico?.nombre} {historial.medico?.apellido}
              </h5>
              <p className="text-muted small mb-0 fw-medium" style={{ color: '#00ACB2' }}>
                {historial.especialidad?.nombre}
              </p>
            </div>
          </div>

          {/* Fecha */}
          <div className="col-12">
            <div className="p-3 border border-secondary-subtle rounded-3 bg-white d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-2 text-white" style={{ backgroundColor: '#00ACB2' }}>
                  <BsClock size={20} />
                </div>
                <div>
                  <span className="text-muted small d-block">Fecha de consulta</span>
                  <strong className="text-dark">
                    {new Date(historial.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Tratamiento */}
          <div className="col-12">
            <div className="p-3 border border-secondary-subtle rounded-3 bg-white">
              <div className="text-muted small fw-semibold mb-2">TRATAMIENTO</div>
              <p className="text-dark mb-0">{historial.tratamiento}</p>
            </div>
          </div>

          {/* Observaciones */}
          {historial.observaciones && (
            <div className="col-12">
              <div className="p-3 border border-secondary-subtle rounded-3 bg-white">
                <div className="text-muted small fw-semibold mb-2">OBSERVACIONES</div>
                <p className="text-dark mb-0">{historial.observaciones}</p>
              </div>
            </div>
          )}

        </div>

        {/* Pie de tarjeta */}
        <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary-subtle">
          <button
            type="button"
            className="btn text-white fw-semibold px-4 shadow-sm"
            style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
            onClick={() => navigate(-1)}
          >
            Aceptar / Volver
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetalleHistorialMedico;
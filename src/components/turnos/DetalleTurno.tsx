import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { BsCalendarEvent, BsArrowLeft, BsPerson, BsPersonBadge, BsClock } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { DetalleTurnoSkeleton } from './DetalleTurnoSkeleton';
import type { TurnoDetalle } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';


export const DetalleTurno: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [turno, setTurno] = useState<TurnoDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTurnoDetail = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get(`/turnos/${id}`);
        
        const data = response.data;
        const turnoData = data.turno || data.data || data;
        
        setTurno(turnoData);
      } catch (err: unknown) {
        console.error('Error al cargar el detalle del turno:', err);
        const backendMessage = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || 'No se pudo cargar la información del turno.'
          : 'No se pudo cargar la información del turno.';
        setError(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTurnoDetail();
    }
  }, [id]);

  if (loading) {
    return (
     <DetalleTurnoSkeleton />
    );
  }

  // Pantalla de Error
  if (error || !turno) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
          <div className="alert alert-danger mb-3" role="alert">
            {error || 'No se encontró el turno solicitado.'}
          </div>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
            <BsArrowLeft /> Volver
          </button>
        </div>
      </div>
    );
  }

  // Color de etiqueta según estado
  const getBadgeColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'CONFIRMADO': return 'bg-success text-white';
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'CANCELADO': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
  
        <PageHeader 
          titulo="Detalle del Turno"
          subtitulo="Información completa de la cita médica registrada."
          icon={<BsCalendarEvent className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => navigate(-1)}
        />

        {/* Cuerpo de la Tarjeta */}
        <div className="row g-4">
          
          {/* Estado */}
          <div className="col-12 d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
            <span className="text-secondary fw-semibold small">Estado actual:</span>
            <span className={`badge px-3 py-2 text-uppercase ${getBadgeColor(turno.estado)}`} style={{ fontSize: '0.85rem', borderRadius: '6px' }}>
              {turno.estado}
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
                {turno.paciente?.nombre} {turno.paciente?.apellido}
              </h5>
              {turno.paciente?.dni && (
                <p className="text-muted small mb-0">DNI: {turno.paciente.dni}</p>
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
                Dr./Dra. {turno.medico?.nombre} {turno.medico?.apellido}
              </h5>
              <p className="text-muted small mb-0 fw-medium" style={{ color: '#00ACB2' }}>
                {turno.especialidad?.nombre}
              </p>
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="col-12">
            <div className="p-3 border border-secondary-subtle rounded-3 bg-white d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-2 text-white" style={{ backgroundColor: '#00ACB2' }}>
                  <BsClock size={20} />
                </div>
                <div>
                  <span className="text-muted small d-block">Fecha y Hora programada</span>
                  <strong className="text-dark">
                    {new Date(turno.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })} - {turno.hora} hs
                  </strong>
                </div>
              </div>
            </div>
          </div>

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

export default DetalleTurno;
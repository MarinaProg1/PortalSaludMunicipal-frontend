import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsEnvelope, BsGeoAlt, BsPencil, BsPersonBadge, BsTelephone } from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { medicoService } from '../../services/medico.service';
import { DetalleMedicoSkeleton } from './DetalleMedicoSkeleton';
import {
  getEspecialidadesNombres,
  getObraSocialNombre,
  getTelefonoTexto,
  type MedicoItem,
} from './medico.schema';

export const DetalleMedico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [medico, setMedico] = useState<MedicoItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!id) {
        setError('No se indicó el médico a consultar.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await medicoService.obtener(id);
        if (!mounted) return;
        if (!data) {
          setError('No se encontró el médico solicitado.');
        } else {
          setMedico(data);
        }
      } catch (err) {
        console.error('Error al cargar el detalle del médico:', err);
        if (mounted) setError('No se pudo cargar la información del médico.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <DetalleMedicoSkeleton />;
  }

  if (error || !medico) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '760px', borderRadius: '12px' }}>
          <div className="alert alert-danger mb-3" role="alert">
            {error || 'No se encontró el médico solicitado.'}
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/medicos')}>
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  const especialidades = getEspecialidadesNombres(medico);
  const telefono = getTelefonoTexto(medico);
  const obraSocial = getObraSocialNombre(medico);
  const activo = medico.activo !== false;
  const direccion = medico.direccion
    ? [
        medico.direccion.calle,
        medico.direccion.numero,
        medico.direccion.piso ? `Piso ${medico.direccion.piso}` : '',
        medico.direccion.departamento ? `Depto. ${medico.direccion.departamento}` : '',
        medico.direccion.barrio,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Detalle del Médico"
        subtitulo="Información completa del profesional registrado."
        icon={<BsPersonBadge className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate('/medicos')}
        rightContent={
          <button
            className="btn btn-sm text-white fw-semibold d-flex align-items-center gap-1"
            style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
            onClick={() => navigate(`/medicos/editar/${medico.id || medico._id}`)}
          >
            <BsPencil /> Editar
          </button>
        }
      />

      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '760px', borderRadius: '12px' }}>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 bg-light p-3 rounded-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">
              {medico.apellido}, {medico.nombre}
            </h4>
            <span className="text-muted small">Matrícula N° {medico.numeroMatricula}</span>
          </div>
          <span className={`badge px-3 py-2 text-uppercase ${activo ? 'bg-success' : 'bg-danger'}`}>
            {activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100">
              <div className="text-muted small fw-semibold mb-2">DNI</div>
              <div className="text-dark fw-semibold">{medico.dni || '-'}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100">
              <div className="text-muted small fw-semibold mb-2 d-flex align-items-center gap-1">
                <BsEnvelope size={14} /> EMAIL
              </div>
              <div className="text-dark">{medico.email || '-'}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100">
              <div className="text-muted small fw-semibold mb-2 d-flex align-items-center gap-1">
                <BsTelephone size={14} /> TELÉFONO
              </div>
              <div className="text-dark">{telefono || '-'}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 border border-secondary-subtle rounded-3 h-100">
              <div className="text-muted small fw-semibold mb-2">OBRA SOCIAL</div>
              <div className="text-dark">{obraSocial || 'Sin obra social asignada'}</div>
            </div>
          </div>

          <div className="col-12">
            <div className="p-3 border border-secondary-subtle rounded-3">
              <div className="text-muted small fw-semibold mb-2">ESPECIALIDADES</div>
              {especialidades.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {especialidades.map((nombre) => (
                    <span key={nombre} className="badge bg-info-subtle text-info-emphasis px-3 py-2">
                      {nombre}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted">Sin especialidades cargadas</span>
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="p-3 border border-secondary-subtle rounded-3 d-flex align-items-start gap-2">
              <BsGeoAlt className="mt-1" style={{ color: '#00ACB2' }} />
              <div>
                <div className="text-muted small fw-semibold mb-1">DIRECCIÓN</div>
                <div className="text-dark">{direccion || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleMedico;

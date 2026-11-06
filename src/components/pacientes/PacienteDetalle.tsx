import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsHeartPulse, BsJournalMedical, BsPencilSquare } from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { pacienteService } from '../../services/paciente.service';
import {
  getObraSocialNombre,
  type PacienteItem,
} from './paciente.schema';
import toast from 'react-hot-toast';

export const PacienteDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<PacienteItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const data = await pacienteService.obtener(id);
        setPaciente(data);
      } catch (e) {
        console.error(e);
        toast.error('No se pudo cargar el paciente');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="container-fluid py-4 text-muted">Cargando...</div>;

  if (!paciente) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <PageHeader
          titulo="Paciente"
          subtitulo="No se encontro el paciente solicitado."
          icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => navigate(-1)}
        />
      </div>
    );
  }

  const telefono = paciente.telefono
    ? `${paciente.telefono.codigoArea || ''} ${paciente.telefono.numero || ''}`.trim()
    : '';

  const direccion = paciente.direccion
    ? [
        paciente.direccion.calle,
        paciente.direccion.numero,
        paciente.direccion.piso ? `Piso ${paciente.direccion.piso}` : '',
        paciente.direccion.departamento ? `Depto ${paciente.direccion.departamento}` : '',
        paciente.direccion.barrio,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={`${paciente.apellido}, ${paciente.nombre}`}
        subtitulo={`DNI ${paciente.dni}`}
        icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
        rightContent={
          <button
            className="btn text-white fw-semibold d-flex align-items-center gap-2 shadow-sm"
            style={{ backgroundColor: '#00ACB2', borderRadius: '10px' }}
            onClick={() => navigate(`/pacientes/editar/${id}`)}
          >
            <BsPencilSquare size={18} /> Editar
          </button>
        }
      />

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Datos personales</h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Nombre y apellido</dt>
                <dd className="col-7 text-dark">{paciente.apellido}, {paciente.nombre}</dd>

                <dt className="col-5 text-muted">DNI</dt>
                <dd className="col-7 text-dark">{paciente.dni}</dd>

                <dt className="col-5 text-muted">Sexo</dt>
                <dd className="col-7 text-dark text-capitalize">{(paciente.sexo || '').toLowerCase()}</dd>

                <dt className="col-5 text-muted">Email</dt>
                <dd className="col-7 text-dark">{paciente.email || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Contacto y obra social</h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Telefono</dt>
                <dd className="col-7 text-dark">{telefono || '-'}</dd>

                <dt className="col-5 text-muted">Direccion</dt>
                <dd className="col-7 text-dark">{direccion || '-'}</dd>

                <dt className="col-5 text-muted">Obra social</dt>
                <dd className="col-7 text-dark">{getObraSocialNombre(paciente)}</dd>

                <dt className="col-5 text-muted">Nro. afiliado</dt>
                <dd className="col-7 text-dark">{paciente.numeroAfiliado || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <BsJournalMedical style={{ color: '#00ACB2' }} />
                <h6 className="fw-bold text-dark mb-0">Observaciones y consultas</h6>
              </div>
              <p className="text-muted small mb-0">
                Aqui se van a mostrar las observaciones y consultas medicas del paciente cuando se
                conecte el modulo de Consulta Medica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

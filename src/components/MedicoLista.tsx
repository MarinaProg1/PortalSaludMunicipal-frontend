import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButtons } from '../ActionButtons';
import { BsPlusCircle, BsSearch, BsCalendarCheck } from 'react-icons/bs';
import clientesAxios from '../config/axios';
import { MedicoSkeleton } from './MedicoSkeleton'; // <-- crealo igual al de turnos

interface MedicoItem {
  id: string;
  nombre: string;
  apellido: string;
  especialidad?: {
    id: string;
    nombre: string;
  };
  matricula: string;
  telefono?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'VACACIONES';
  activo: boolean;
}

export const MedicosLista: React.FC = () => {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchMedicos = async () => {
      try {
        const response = await clientesAxios.get('/medicos');

        if (isMounted) {
          const dataApi = response.data;
          let listaMedicos: MedicoItem[] = [];
          if (Array.isArray(dataApi)) {
            listaMedicos = dataApi;
          } else if (dataApi && Array.isArray(dataApi.medicos)) {
            listaMedicos = dataApi.medicos;
          } else if (dataApi && Array.isArray(dataApi.data)) {
            listaMedicos = dataApi.data;
          }

          setMedicos(listaMedicos);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar los medicos:', err);
        if (isMounted) {
          setError('No se pudo conectar con el servidor para cargar los médicos.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMedicos();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleView = (id: string) => {
    navigate(`/medico-detalle/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/medicos/editar/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este médico?')) {
      try {
        await clientesAxios.delete(`/medicos/${id}`);
        setMedicos(medicos.filter(m => m.id !== id));
      } catch (err) {
        console.error('Error al eliminar el medico:', err);
        alert('Hubo un error al intentar eliminar el registro.');
      }
    }
  };

  const medicosFiltrados = Array.isArray(medicos) ? medicos.filter(m => {
    const nombreCompleto = `${m.nombre || ''} ${m.apellido || ''}`.toLowerCase();
    const especialidad = `${m.especialidad?.nombre || ''}`.toLowerCase();
    const termino = busqueda.toLowerCase();

    return nombreCompleto.includes(termino) || especialidad.includes(termino);
  }) : [];

  return (
    <div className="container-fluid px-2 px-md-4 py-4">

      {/* Cabecera institucional - IGUAL QUE TU COMPAÑERA */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary-subtle">
        <div>
          <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-3">
            <BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />
            Gestión de Médicos
          </h2>
          <p className="text-muted mb-0 small">Control y administración de médicos registrados en la salita.</p>
        </div>

        <button
          className="btn text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          style={{ backgroundColor: '#00ACB2', borderRadius: '10px', padding: '10px 18px' }}
          onClick={() => navigate('/medicos/nuevo')}
        >
          <BsPlusCircle size={18} />
          Asignar Nuevo Médico
        </button>
      </div>

      {/* Buscador - IGUAL */}
      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted">
              <BsSearch size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none ps-0"
              placeholder="Buscar por médico o especialidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Renderizado condicional limpio usando el Skeleton - IGUAL */}
      {loading ? (
        <MedicoSkeleton />
      ) : error ? (
        <div className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center" style={{ borderRadius: '12px' }}>
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : medicosFiltrados.length > 0 ? (
        <>
          {/* VISTA 1: TARJETAS (Móvil) */}
          <div className="d-block d-lg-none">
            <div className="row g-3">
              {medicosFiltrados.map((medico) => (
                <div className="col-12" key={medico.id}>
                  <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="text-muted small d-block">Médico</span>
                        <h6 className="fw-bold text-dark mb-0">
                          {medico.nombre} {medico.apellido}
                        </h6>
                      </div>
                      <span className={`badge px-2 py-1 text-uppercase ${
                        medico.estado === 'ACTIVO' ? 'bg-success-subtle text-success' :
                        medico.estado === 'VACACIONES' ? 'bg-warning-subtle text-warning text-dark' :
                        'bg-danger-subtle text-danger'
                      }`}>
                        {medico.estado}
                      </span>
                    </div>

                    <hr className="my-2 border-secondary-subtle" />

                    <div className="row g-2 small mb-3">
                      <div className="col-6">
                        <span className="text-muted d-block">Matrícula</span>
                        <span className="fw-medium text-dark">{medico.matricula}</span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">Especialidad</span>
                        <span className="fw-medium text-dark">{medico.especialidad?.nombre}</span>
                      </div>
                      <div className="col-12 mt-2">
                        <span className="text-muted d-block">Teléfono</span>
                        <span className="fw-semibold text-dark">{medico.telefono || '-'}</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end pt-2 border-top border-secondary-subtle">
                      <ActionButtons
                        onView={() => handleView(medico.id)}
                        onEdit={() => handleEdit(medico.id)}
                        onDelete={() => handleDelete(medico.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VISTA 2: TABLA (Escritorio) */}
          <div className="d-none d-lg-block card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase fs-7 text-secondary border-bottom">
                  <tr>
                    <th className="py-3 px-4">Médico</th>
                    <th className="py-3">Matrícula</th>
                    <th className="py-3">Especialidad</th>
                    <th className="py-3">Teléfono</th>
                    <th className="py-3">Estado</th>
                    <th className="py-3 text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicosFiltrados.map((medico) => (
                    <tr key={medico.id}>
                      <td className="px-4 fw-semibold text-dark">
                        {medico.nombre} {medico.apellido}
                      </td>
                      <td className="text-muted">{medico.matricula}</td>
                      <td className="text-muted">{medico.especialidad?.nombre}</td>
                      <td className="text-dark fw-medium">
                        {medico.telefono} <span className="text-muted">hs</span>
                      </td>
                      <td>
                        <span className={`badge px-2 py-1 text-uppercase ${
                          medico.estado === 'ACTIVO' ? 'bg-success-subtle text-success' :
                          medico.estado === 'VACACIONES' ? 'bg-warning-subtle text-warning text-dark' :
                          'bg-danger-subtle text-danger'
                        }`}>
                          {medico.estado}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <ActionButtons
                          onView={() => handleView(medico.id)}
                          onEdit={() => handleEdit(medico.id)}
                          onDelete={() => handleDelete(medico.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">No se encontro médico registrado.</p>
        </div>
      )}
    </div>
  );
};
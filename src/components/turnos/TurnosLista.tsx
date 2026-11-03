import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButtons } from '../../constants/ActionButtons';
import { BsPlusCircle, BsSearch, BsCalendarCheck } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { TurnosSkeleton } from './TurnosSkeleton'; // <-- Importas tu componente
import type { TurnoItem } from './turnos.interfaces';
import { PageHeader } from '../../constants/PageHeader';


export const TurnosLista: React.FC = () => {
 const navigate = useNavigate();
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchTurnos = async () => {
      try {
        const response = await clientesAxios.get('/turnos');
        
        if (isMounted) {
          const dataApi = response.data;
          let listaTurnos: TurnoItem[] = [];
          if (Array.isArray(dataApi)) {
            listaTurnos = dataApi;
          } else if (dataApi && Array.isArray(dataApi.turnos)) {
            listaTurnos = dataApi.turnos;
          } else if (dataApi && Array.isArray(dataApi.data)) {
            listaTurnos = dataApi.data;
          }

          setTurnos(listaTurnos);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar los turnos:', err);
        if (isMounted) {
          setError('No se pudo conectar con el servidor para cargar los turnos.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTurnos();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleView = (id: string) => {
    navigate(`/turno-detalle/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/turnos/editar/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de cancelar/eliminar este turno?')) {
      try {
        await clientesAxios.delete(`/turnos/${id}`);
        setTurnos(turnos.filter(t => t.id !== id));
      } catch (err) {
        console.error('Error al eliminar el turno:', err);
        alert('Hubo un error al intentar eliminar el registro.');
      }
    }
  };

  const turnosFiltrados = Array.isArray(turnos) ? turnos.filter(t => {
    const nombrePaciente = `${t.paciente?.nombre || ''} ${t.paciente?.apellido || ''}`.toLowerCase();
    const nombreMedico = `${t.medico?.nombre || ''} ${t.medico?.apellido || ''}`.toLowerCase();
    const termino = busqueda.toLowerCase();

    return nombrePaciente.includes(termino) || nombreMedico.includes(termino);
  }) : [];

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
    
      <PageHeader 
  titulo="Gestión de Turnos Médicos"
  subtitulo="Control y administración de turnos asignados en la salita."
  icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
  onBack={() => navigate(-1)}
  rightContent={
    <button 
      className="btn text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
      style={{ backgroundColor: '#00ACB2', borderRadius: '10px', padding: '8px 16px' }}
      onClick={() => navigate('/turnos/nuevo')} 
    >
      <BsPlusCircle size={18} />
      Asignar Nuevo Turno
    </button>
  }
/>

      {/* Buscador */}
      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted">
              <BsSearch size={18} />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 shadow-none ps-0" 
              placeholder="Buscar por paciente o médico..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Renderizado condicional limpio usando el Skeleton */}
      {loading ? (
        <TurnosSkeleton />
      ) : error ? (
        <div className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center" style={{ borderRadius: '12px' }}>
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : turnosFiltrados.length > 0 ? (
        <>
          {/* VISTA 1: TARJETAS (Móvil) */}
          <div className="d-block d-lg-none">
            <div className="row g-3">
              {turnosFiltrados.map((turno) => (
                <div className="col-12" key={turno.id}>
                  <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="text-muted small d-block">Paciente</span>
                        <h6 className="fw-bold text-dark mb-0">
                          {turno.paciente?.nombre} {turno.paciente?.apellido}
                        </h6>
                      </div>
                      <span className={`badge px-2 py-1 text-uppercase ${
                        turno.estado === 'CONFIRMADO' ? 'bg-success-subtle text-success' :
                        turno.estado === 'PENDIENTE' ? 'bg-warning-subtle text-warning text-dark' :
                        'bg-danger-subtle text-danger'
                      }`}>
                        {turno.estado}
                      </span>
                    </div>

                    <hr className="my-2 border-secondary-subtle" />

                    <div className="row g-2 small mb-3">
                      <div className="col-6">
                        <span className="text-muted d-block">Médico</span>
                        <span className="fw-medium text-dark">
                          {turno.medico?.nombre} {turno.medico?.apellido}
                        </span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">Especialidad</span>
                        <span className="fw-medium text-dark">{turno.especialidad?.nombre}</span>
                      </div>
                      <div className="col-12 mt-2">
                        <span className="text-muted d-block">Fecha y Hora</span>
                        <span className="fw-semibold text-dark">{turno.fecha} - {turno.hora} hs</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end pt-2 border-top border-secondary-subtle">
                      <ActionButtons 
                        onView={() => handleView(turno.id)}
                        onEdit={() => handleEdit(turno.id)}
                        onDelete={() => handleDelete(turno.id)}
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
                    <th className="py-3 px-4">Paciente</th>
                    <th className="py-3">Médico</th>
                    <th className="py-3">Especialidad</th>
                    <th className="py-3">Fecha y Hora</th>
                    <th className="py-3">Estado</th>
                    <th className="py-3 text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turnosFiltrados.map((turno) => (
                    <tr key={turno.id}>
                      <td className="px-4 fw-semibold text-dark">
                        {turno.paciente?.nombre} {turno.paciente?.apellido}
                      </td>
                      <td className="text-muted">
                        {turno.medico?.nombre} {turno.medico?.apellido}
                      </td>
                      <td className="text-muted">{turno.especialidad?.nombre}</td>
                      <td className="text-dark fw-medium">
                        {turno.fecha} - <span className="text-muted">{turno.hora} hs</span>
                      </td>
                      <td>
                        <span className={`badge px-2 py-1 text-uppercase ${
                          turno.estado === 'CONFIRMADO' ? 'bg-success-subtle text-success' :
                          turno.estado === 'PENDIENTE' ? 'bg-warning-subtle text-warning text-dark' :
                          'bg-danger-subtle text-danger'
                        }`}>
                          {turno.estado}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <ActionButtons 
                          onView={() => handleView(turno.id)}
                          onEdit={() => handleEdit(turno.id)}
                          onDelete={() => handleDelete(turno.id)}
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
          <p className="text-muted mb-0">No se encontraron turnos registrados en la base de datos.</p>
        </div>
      )}

    </div>
  );
};
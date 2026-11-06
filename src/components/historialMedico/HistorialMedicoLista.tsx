import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCalendarCheck, BsPlusCircle, BsEye, BsPencil, BsTrash, BsSearch } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { HistorialMedicoSkeleton } from './HistorialMedicoSkeleton';

interface HistorialItem {
  id: string;
  paciente?: {
    nombre?: string;
    apellido?: string;
  };
  medico?: {
    nombre?: string;
    apellido?: string;
  };
  especialidad?: {
    nombre?: string;
  };
  fecha: string;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
}

export const HistorialMedicoLista: React.FC = () => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchHistorial = async () => {
      try {
        const response = await clientesAxios.get('/historial-medico');

        if (isMounted) {
          const dataApi = response.data;
          let listaHistorial: HistorialItem[] = [];
          if (Array.isArray(dataApi)) {
            listaHistorial = dataApi;
          } else if (dataApi && Array.isArray(dataApi.historial)) {
            listaHistorial = dataApi.historial;
          } else if (dataApi && Array.isArray(dataApi.data)) {
            listaHistorial = dataApi.data;
          }

          setHistorial(listaHistorial);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar el historial:', err);
        if (isMounted) {
          setError('No se pudo conectar con el servidor para cargar el historial.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistorial();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleView = (id: string) => {
    navigate(`/historial-medico-detalle/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/historial-medico/editar/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este historial médico?')) {
      try {
        await clientesAxios.delete(`/historial-medico/${id}`);
        setHistorial(historial.filter(h => h.id !== id));
      } catch (err) {
        console.error('Error al eliminar el historial:', err);
        alert('Hubo un error al intentar eliminar el registro.');
      }
    }
  };

  const historialFiltrado = Array.isArray(historial) ? historial.filter(h => {
    const nombrePaciente = `${h.paciente?.nombre || ''} ${h.paciente?.apellido || ''}`.toLowerCase();
    const nombreMedico = `${h.medico?.nombre || ''} ${h.medico?.apellido || ''}`.toLowerCase();
    const diagnostico = (h.diagnostico || '').toLowerCase();
    const termino = busqueda.toLowerCase();

    return nombrePaciente.includes(termino) || nombreMedico.includes(termino) || diagnostico.includes(termino);
  }) : [];

  if (loading) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-3">
              <BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />
              Gestión de Historial Médico
            </h2>
            <p className="text-muted mb-0 small">Control y administración del historial médico en la salita.</p>
          </div>
        </div>
        <HistorialMedicoSkeleton />
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">

      {/* Cabecera institucional */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary-subtle">
        <div>
          <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-3">
            <BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />
            Gestión de Historial Médico
          </h2>
          <p className="text-muted mb-0 small">Control y administración del historial médico en la salita.</p>
        </div>

        <button
          className="btn text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          style={{ backgroundColor: '#00ACB2', borderRadius: '10px', padding: '10px 18px' }}
          onClick={() => navigate('/historial-medico/nuevo')}
        >
          <BsPlusCircle size={18} />
          Registrar Nuevo Historial
        </button>
      </div>

      {/* Buscador */}
      <div className="card border-0 shadow-sm bg-white p-3 mb-4" style={{ borderRadius: '12px' }}>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0"><BsSearch className="text-muted" /></span>
          <input
            type="text"
            className="form-control border-start-0 shadow-none"
            placeholder="Buscar por paciente, médico o diagnóstico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Si no hay historial */}
      {historialFiltrado.length === 0 && !error && (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <BsCalendarCheck size={40} className="text-muted mb-3" style={{ color: '#00ACB2' }} />
          <h5 className="fw-bold">No se encontraron historiales médicos</h5>
          <p className="text-muted small mb-0">
            {busqueda ? 'Probá con otro nombre o diagnóstico.' : 'Todavía no hay historiales registrados. Registrá el primero.'}
          </p>
        </div>
      )}

      {/* TABLA PARA ESCRITORIO */}
      {historialFiltrado.length > 0 && (
        <div className="d-none d-lg-block card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase fs-7 text-secondary border-bottom">
              <tr>
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3">Médico</th>
                <th className="py-3">Especialidad</th>
                <th className="py-3">Fecha</th>
                <th className="py-3">Diagnóstico</th>
                <th className="py-3 text-end px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historialFiltrado.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 fw-semibold">{h.paciente?.nombre} {h.paciente?.apellido}</td>
                  <td>Dr./Dra. {h.medico?.nombre} {h.medico?.apellido}</td>
                  <td>{h.especialidad?.nombre}</td>
                  <td>{new Date(h.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
                  <td>
                    <span className="badge px-3 py-2" style={{ backgroundColor: '#00ACB2', color: 'white', borderRadius: '6px' }}>
                      {h.diagnostico}
                    </span>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex justify-content-end gap-1">
                      <button className="btn btn-sm btn-outline-secondary" title="Ver detalle" onClick={() => handleView(h.id)}><BsEye /></button>
                      <button className="btn btn-sm btn-outline-primary" title="Editar" onClick={() => handleEdit(h.id)}><BsPencil /></button>
                      <button className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => handleDelete(h.id)}><BsTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TARJETAS PARA MÓVIL */}
      {historialFiltrado.length > 0 && (
        <div className="d-block d-lg-none">
          <div className="row g-3">
            {historialFiltrado.map((h) => (
              <div className="col-12" key={h.id}>
                <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <small className="text-muted">Paciente</small>
                      <h6 className="fw-bold mb-0">{h.paciente?.nombre} {h.paciente?.apellido}</h6>
                    </div>
                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#00ACB2', color: 'white' }}>
                      {h.diagnostico}
                    </span>
                  </div>
                  <hr className="my-2 border-secondary-subtle" />
                  <div className="row g-2 small mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Médico</small>
                      <span>Dr./Dra. {h.medico?.nombre} {h.medico?.apellido}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Fecha</small>
                      <span>{new Date(h.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</span>
                    </div>
                    <div className="col-12">
                      <small className="text-muted d-block">Especialidad</small>
                      <span>{h.especialidad?.nombre}</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-1 pt-2 border-top border-secondary-subtle">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleView(h.id)}><BsEye /> Ver</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(h.id)}><BsPencil /> Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(h.id)}><BsTrash /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
export default HistorialMedicoLista;
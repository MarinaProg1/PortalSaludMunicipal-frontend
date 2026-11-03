import React, { useState, useEffect } from 'react';
import { ActionButtons } from '../../constants/ActionButtons';
import {  BsPlusCircle,  BsSearch,  BsClockHistory,  BsChevronDown,  BsChevronUp,  BsCalendarCheck } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import clientesAxios from '../../config/axios';
import { HorarioAtencionSkeleton } from './HorarioAtencionSkeleton';
import type { HorarioItem, MedicoAgrupado } from './HorarioAtencion.interfaces';


export const HorarioAtencionLista: React.FC = () => {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState<HorarioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para controlar qué acordeón/desplegable de médico está abierto
  const [medicoDesplegado, setMedicoDesplegado] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHorarios = async () => {
      try {
        const response = await clientesAxios.get('/horarioAtencion');
        
        if (isMounted) {
          const dataApi = response.data;
          console.log("DATOS CRUDOS DEL BACKEND:", dataApi);
          let listaHorarios: HorarioItem[] = [];

          if (Array.isArray(dataApi)) {
            listaHorarios = dataApi;
            
          } else if (dataApi && typeof dataApi === 'object') {
            const record = dataApi as Record<string, unknown>;
            
            if (Array.isArray(record.horarios)) listaHorarios = record.horarios as HorarioItem[];
            else if (Array.isArray(record.data)) listaHorarios = record.data as HorarioItem[];
          }

          setHorarios(listaHorarios);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar los horarios:', err);
        if (isMounted) {
          setError('No se pudo conectar con el servidor para cargar los horarios de atención.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHorarios();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleView = (id?: string) => {
    if (id) alert(`Ver detalle del horario ID: ${id}`);
  };

  const handleEdit = (id?: string) => {
    if (id) alert(`Modificar horario ID: ${id}`);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este horario de atención?')) {
      try {
        await clientesAxios.delete(`/horarioAtencion/${id}`);
        setHorarios(prev => prev.filter(h => h.id !== id));
      } catch (err) {
        console.error('Error al eliminar el horario:', err);
        alert('Hubo un error al intentar eliminar el registro.');
      }
    }
  };

  const toggleDesplegar = (medicoId: string) => {
    setMedicoDesplegado(prev => (prev === medicoId ? null : medicoId));
  };

  // 1. Agrupar horarios por Médico
  const agruparPorMedico = (items: HorarioItem[]): MedicoAgrupado[] => {
    const mapa = new Map<string, MedicoAgrupado>();

    items.forEach(h => {
      const idMed = h.medico?._id || h.medico?._id || 'sin-medico';
      const nombreMed = h.medico && h.medico.nombre 
        ? `Dr./Dra. ${h.medico.nombre} ${h.medico.apellido || ''}`.trim() 
        : 'Sin médico asignado';

      if (!mapa.has(idMed)) {
        mapa.set(idMed, {
          medicoId: idMed,
          medicoNombreCompleto: nombreMed,
          horarios: []
        });
      }

      mapa.get(idMed)?.horarios.push(h);
    });

    return Array.from(mapa.values());
  };

  // 2. Filtrar por término de búsqueda y obtener los grupos
  const medicosAgrupados = agruparPorMedico(
    Array.isArray(horarios) ? horarios.filter(h => {
      const nombreMed = `${h.medico?.nombre || ''} ${h.medico?.apellido || ''}`.toLowerCase();
      const dia = (h.diaSemana || '').toLowerCase();
      const termino = busqueda.toLowerCase();

      return nombreMed.includes(termino) || dia.includes(termino);
    }) : []
  );

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      
      {/* Cabecera institucional */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary-subtle">
        <div>
          <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-3">
            <BsClockHistory className="me-2" style={{ color: '#00ACB2' }} />
            Horarios de Atención por Médico
          </h2>
          <p className="text-muted mb-0 small">Consulta la agenda y disponibilidad horaria semanal asignada a cada profesional.</p>
        </div>
        
        <button 
          className="btn text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          style={{ backgroundColor: '#00ACB2', borderRadius: '10px', padding: '10px 18px' }}
          onClick={() => navigate('/horarioAtencion/nuevo')}
        >
          <BsPlusCircle size={18} />
          Nuevo Horario
        </button>
      </div>

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
              placeholder="Buscar por médico o día de semana (ej: LUNES)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Renderizado de Estados */}
      {loading ? (
        <HorarioAtencionSkeleton />
      ) : error ? (
        <div className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center" style={{ borderRadius: '12px' }}>
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : medicosAgrupados.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {medicosAgrupados.map((grupo) => {
            const estaAbierto = medicoDesplegado === grupo.medicoId;

            return (
              <div 
                key={grupo.medicoId} 
                className="card border-0 shadow-sm bg-white overflow-hidden" 
                style={{ borderRadius: '12px' }}
              >
                {/* Cabecera de la Tarjeta del Médico */}
                <div 
                  className="p-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 bg-white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleDesplegar(grupo.medicoId)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="p-2 rounded-circle d-flex align-items-center justify-content-center text-white"
                      style={{ backgroundColor: '#00ACB2', width: '42px', height: '42px' }}
                    >
                      <BsCalendarCheck size={20} />
                    </div>
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{grupo.medicoNombreCompleto}</h5>
                      <span className="text-muted small">
                        {grupo.horarios.length} {grupo.horarios.length === 1 ? 'bloque horario cargado' : 'bloques horarios cargados'}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3 ms-auto ms-sm-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDesplegar(grupo.medicoId);
                    }}
                  >
                    <span>{estaAbierto ? 'Ocultar Agenda' : 'Ver Agenda'}</span>
                    {estaAbierto ? <BsChevronUp /> : <BsChevronDown />}
                  </button>
                </div>

                {/* Desplegable de la Agenda (Tabla de Horarios del Médico) */}
                {estaAbierto && (
                  <div className="border-top border-secondary-subtle bg-light-subtle p-3">
                    <div className="table-responsive bg-white rounded shadow-sm border border-secondary-subtle">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-uppercase fs-7 text-secondary">
                          <tr>
                            <th className="py-2 px-3">Día</th>
                            <th className="py-2">Rango Horario</th>
                            <th className="py-2">Duración Turno</th>
                            <th className="py-2">Estado</th>
                            <th className="py-2 text-end px-3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grupo.horarios.map((horario) => {
                            const horarioId = horario.id || horario.id || '';
                            return (
                              <tr key={horarioId}>
                                <td className="px-3 fw-bold text-dark">{horario.diaSemana}</td>
                                <td className="text-dark">
                                  {horario.horaInicio} a {horario.horaFin} <span className="text-muted">hs</span>
                                </td>
                                <td className="text-muted">{horario.duracionTurnoMinutos} mins</td>
                                <td>
                                  <span className={`badge px-2 py-1 text-uppercase ${horario.activo ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                    {horario.activo ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td className="text-end px-3">
                                  <ActionButtons 
                                    onView={() => handleView(horarioId)}
                                    onEdit={() => handleEdit(horarioId)}
                                    onDelete={() => handleDelete(horarioId)}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">No se encontraron horarios de atención registrados.</p>
        </div>
      )}

    </div>
  );
};
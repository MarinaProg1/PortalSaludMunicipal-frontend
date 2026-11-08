import React, { useState, useEffect } from 'react';
import { BsPlusCircle, BsSearch, BsClockHistory, BsChevronDown, BsChevronUp, BsCalendarCheck, BsArrowLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import clientesAxios from '../../config/axios';
import { HorarioAtencionSkeleton } from './HorarioAtencionSkeleton';
import type { HorarioItem, MedicoAgrupado, DiaDisponibilidad } from './horario.schema';
import { MedicoAgendaDesplegable } from './MedicoAgendaDesplegable'; 

export const HorarioAtencionLista: React.FC = () => {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState<HorarioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  
  const [medicoDesplegado, setMedicoDesplegado] = useState<string | null>(null);

  const [mesActual, setMesActual] = useState<Date>(new Date());
  const [diasMes, setDiasMes] = useState<DiaDisponibilidad[]>([]);
  const [cargandoMes, setCargandoMes] = useState<boolean>(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHorarios = async () => {
      try {
        const response = await clientesAxios.get('/horarioAtencion');
        if (isMounted) {
          const dataApi = response.data;
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
        if (isMounted) setError('No se pudo conectar con el servidor para cargar los horarios de atención.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHorarios();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!medicoDesplegado) return;
    const fetchDisponibilidadMes = async () => {
      setCargandoMes(true);
      try {
        const anio = mesActual.getFullYear();
        const mes = mesActual.getMonth() + 1;
        const res = await clientesAxios.get('/turnos/disponibilidad-mes', {
          params: { medico: medicoDesplegado, anio, mes }
        });
        if (res.data && res.data.ok) {
          setDiasMes(res.data.data || []);
        }
      } catch (err) {
        console.error('Error al cargar disponibilidad mensual:', err);
        setDiasMes([]);
      } finally {
        setCargandoMes(false);
      }
    };
    fetchDisponibilidadMes();
  }, [medicoDesplegado, mesActual]);

  const handleSeleccionarDia = async (fechaStr: string, tieneDisponibilidad: boolean) => {
    if (!tieneDisponibilidad || !medicoDesplegado) return;
    setFechaSeleccionada(fechaStr);
    setCargandoSlots(true);
    try {
      const res = await clientesAxios.get('/turnos/disponibles', {
        params: { medico: medicoDesplegado, fecha: fechaStr }
      });
      if (res.data && res.data.ok) {
        setSlotsDisponibles(res.data.data.horariosDisponibles || []);
      } else {
        setSlotsDisponibles([]);
      }
    } catch (err) {
      console.error('Error al obtener turnos disponibles:', err);
      setSlotsDisponibles([]);
    } finally {
      setCargandoSlots(false);
    }
  };

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    setMesActual(prev => {
      const nuevo = new Date(prev);
      if (direccion === 'anterior') nuevo.setMonth(nuevo.getMonth() - 1);
      else nuevo.setMonth(nuevo.getMonth() + 1);
      return nuevo;
    });
    setFechaSeleccionada('');
    setSlotsDisponibles([]);
  };

  const toggleDesplegar = (medicoId: string) => {
    if (medicoDesplegado === medicoId) {
      setMedicoDesplegado(null);
    } else {
      setMedicoDesplegado(medicoId);
      setFechaSeleccionada('');
      setSlotsDisponibles([]);
      setMesActual(new Date());
    }
  };

  const agruparPorMedico = (items: HorarioItem[]): MedicoAgrupado[] => {
    const mapa = new Map<string, MedicoAgrupado>();
    items.forEach(h => {
      const idMed = h.medico?._id || 'sin-medico';
      const nombreMed = h.medico && h.medico.nombre 
        ? `Dr./Dra. ${h.medico.nombre} ${h.medico.apellido || ''}`.trim() 
        : 'Sin médico asignado';

      if (!mapa.has(idMed)) {
        mapa.set(idMed, { medicoId: idMed, medicoNombreCompleto: nombreMed, horarios: [] });
      }
      mapa.get(idMed)?.horarios.push(h);
    });
    return Array.from(mapa.values());
  };

  const medicosAgrupados = agruparPorMedico(
    Array.isArray(horarios) ? horarios.filter(h => {
      const nombreMed = `${h.medico?.nombre || ''} ${h.medico?.apellido || ''}`.toLowerCase();
      const dia = (h.diaSemana || '').toLowerCase();
      const termino = busqueda.toLowerCase();
      return nombreMed.includes(termino) || dia.includes(termino);
    }) : []
  );

  const medicosAVisualizar = medicoDesplegado 
    ? medicosAgrupados.filter(g => g.medicoId === medicoDesplegado)
    : medicosAgrupados;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      
      {/* Cabecera institucional */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary-subtle">
        <div>
          <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-3">
            <BsClockHistory className="me-2" style={{ color: '#00ACB2' }} />
            Horarios y Agenda de Turnos por Médico
          </h2>
          <p className="text-muted mb-0 small">Consulta la disponibilidad horaria y visualiza la agenda de turnos en tiempo real.</p>
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
      {!medicoDesplegado && (
        <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted"><BsSearch size={18} /></span>
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
      )}

      {/* Botón de Regresar */}
      {medicoDesplegado && (
        <div className="mb-3">
          <button 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-none"
            onClick={() => setMedicoDesplegado(null)}
          >
            <BsArrowLeft /> Volver a la lista de médicos
          </button>
        </div>
      )}

      {/* Renderizado */}
      {loading ? (
        <HorarioAtencionSkeleton />
      ) : error ? (
        <div className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center" style={{ borderRadius: '12px' }}>
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : medicosAVisualizar.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {medicosAVisualizar.map((grupo) => {
            const estaAbierto = medicoDesplegado === grupo.medicoId;

            return (
              <div key={grupo.medicoId} className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
                
                {/* Cabecera del Médico */}
                <div 
                  className="p-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 bg-white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleDesplegar(grupo.medicoId)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-circle d-flex align-items-center justify-content-center text-white" style={{ backgroundColor: '#00ACB2', width: '42px', height: '42px' }}>
                      <BsCalendarCheck size={20} />
                    </div>
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{grupo.medicoNombreCompleto}</h5>
                      <span className="text-muted small">
                        {grupo.horarios.length} {grupo.horarios.length === 1 ? 'bloque horario configurado' : 'bloques horarios configurados'}
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
                    <span>{estaAbierto ? 'Ocultar Agenda' : 'Ver Agenda de Turnos'}</span>
                    {estaAbierto ? <BsChevronUp /> : <BsChevronDown />}
                  </button>
                </div>

                {/* 🌟 Agenda integrada limpiamente mediante el subcomponente */}
                {estaAbierto && (
                  <MedicoAgendaDesplegable 
                    mesActual={mesActual}
                    diasMes={diasMes}
                    cargandoMes={cargandoMes}
                    fechaSeleccionada={fechaSeleccionada}
                    slotsDisponibles={slotsDisponibles}
                    cargandoSlots={cargandoSlots}
                    onCambiarMes={cambiarMes}
                    onSeleccionarDia={handleSeleccionarDia}
                  />
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
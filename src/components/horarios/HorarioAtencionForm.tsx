import React, { useState, useEffect } from 'react';
import { BsClock } from 'react-icons/bs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import clientesAxios from '../../config/axios';
import { isAxiosError } from 'axios';
import type { MedicoItem, DiaConfig, HorarioApiResponse } from './horario.schema';
import { PageHeader } from '../../constants/PageHeader';
import { HorarioAtencionFormSkeleton } from './HorarioAtencionFromSkeleton';

const DIAS_SEMANA = [
  { key: 'LUNES', label: 'Lunes' },
  { key: 'MARTES', label: 'Martes' },
  { key: 'MIERCOLES', label: 'Miércoles' },
  { key: 'JUEVES', label: 'Jueves' },
  { key: 'VIERNES', label: 'Viernes' },
  { key: 'SABADO', label: 'Sábado' },
  { key: 'DOMINGO', label: 'Domingo' },
];

const estructuraInicialDias = (): Record<string, DiaConfig> => ({
  LUNES: { seleccionado: false, manana: { activo: true, horaInicio: '08:00', horaFin: '12:00' }, tarde: { activo: false, horaInicio: '16:00', horaFin: '20:00' } },
  MARTES: { seleccionado: false, manana: { activo: true, horaInicio: '08:00', horaFin: '12:00' }, tarde: { activo: false, horaInicio: '16:00', horaFin: '20:00' } },
  MIERCOLES: { seleccionado: false, manana: { activo: true, horaInicio: '08:00', horaFin: '12:00' }, tarde: { activo: false, horaInicio: '16:00', horaFin: '20:00' } },
  JUEVES: { seleccionado: false, manana: { activo: true, horaInicio: '08:00', horaFin: '12:00' }, tarde: { activo: false, horaInicio: '16:00', horaFin: '20:00' } },
  VIERNES: { seleccionado: false, manana: { activo: true, horaInicio: '08:00', horaFin: '12:00' }, tarde: { activo: false, horaInicio: '16:00', horaFin: '20:00' } },
  SABADO: { seleccionado: false, manana: { activo: false, horaInicio: '09:00', horaFin: '13:00' }, tarde: { activo: false, horaInicio: '16:00', horaFin: '20:00' } },
  DOMINGO: { seleccionado: false, manana: { activo: false, horaInicio: '09:00', horaFin: '13:00' }, tarde: { activo: false, horaInicio: '16:00', horaFin: '20:00' } },
});

export const HorarioAtencionForm: React.FC = () => {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState('');
  const [duracionTurno, setDuracionTurno] = useState<number>(30);
  const [agendaDias, setAgendaDias] = useState<Record<string, DiaConfig>>(estructuraInicialDias());
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadingHorariosMedico, setLoadingHorariosMedico] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 1. Cargar lista de médicos al montar el componente
  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await clientesAxios.get('/medicos');
        const data = response.data;
        let listaMedicos: MedicoItem[] = [];

        if (Array.isArray(data)) {
          listaMedicos = data as MedicoItem[];
        } else if (data && typeof data === 'object') {
          const record = data as Record<string, unknown>;
          if (Array.isArray(record.medicos)) listaMedicos = record.medicos as MedicoItem[];
          else if (Array.isArray(record.data)) listaMedicos = record.data as MedicoItem[];
        }

        setMedicos(listaMedicos);
      } catch (err) {
        console.error('Error al cargar médicos:', err);
        toast.error('No se pudo cargar la lista de médicos.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchMedicos();
  }, []);

  // 2. Función para consultar y precargar los horarios existentes del médico seleccionado
  const handleCambioMedico = async (idMedico: string) => {
    setMedicoSeleccionado(idMedico);

    if (!idMedico) {
      setAgendaDias(estructuraInicialDias());
      return;
    }

    setLoadingHorariosMedico(true);
    try {
      const response = await clientesAxios.get(`/horarioAtencion?medico=${idMedico}`);
      const dataApi = response.data;
      let horariosExistentes: HorarioApiResponse[] = [];

      if (Array.isArray(dataApi)) {
        horariosExistentes = dataApi as HorarioApiResponse[];
      } else if (dataApi && typeof dataApi === 'object') {
        const record = dataApi as Record<string, unknown>;
        if (Array.isArray(record.data)) horariosExistentes = record.data as HorarioApiResponse[];
        else if (Array.isArray(record.horarios)) horariosExistentes = record.horarios as HorarioApiResponse[];
      }

      const nuevaAgenda = estructuraInicialDias();

      if (horariosExistentes.length > 0) {
        const primerHorario = horariosExistentes[0];
        if (typeof primerHorario.duracionTurnoMinutos === 'number') {
          setDuracionTurno(primerHorario.duracionTurnoMinutos);
        }

        horariosExistentes.forEach((h) => {
          const dia = h.diaSemana;
          const horaInicioStr = h.horaInicio || '';
          const horaFinStr = h.horaFin || '';

          if (nuevaAgenda[dia]) {
            nuevaAgenda[dia].seleccionado = true;
            const horaInicioNum = parseInt(horaInicioStr.split(':')[0], 10);
            
            if (horaInicioNum < 13) {
              nuevaAgenda[dia].manana = {
                activo: true,
                horaInicio: horaInicioStr,
                horaFin: horaFinStr,
              };
            } else {
              nuevaAgenda[dia].tarde = {
                activo: true,
                horaInicio: horaInicioStr,
                horaFin: horaFinStr,
              };
            }
          }
        });
      }

      setAgendaDias(nuevaAgenda);
    } catch (err) {
      console.error('Error al consultar horarios del médico:', err);
      toast.error('No se pudieron cargar los horarios del médico.');
    } finally {
      setLoadingHorariosMedico(false);
    }
  };

  const handleToggleDia = (diaKey: string) => {
    setAgendaDias(prev => ({
      ...prev,
      [diaKey]: { ...prev[diaKey], seleccionado: !prev[diaKey].seleccionado }
    }));
  };

  const handleTurnoChange = (diaKey: string, turno: 'manana' | 'tarde', field: 'activo' | 'horaInicio' | 'horaFin', value: unknown) => {
    setAgendaDias(prev => ({
      ...prev,
      [diaKey]: {
        ...prev[diaKey],
        [turno]: {
          ...prev[diaKey][turno],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicoSeleccionado) {
      toast.error('Por favor, seleccione un médico.');
      return;
    }

    const diasSeleccionados = Object.entries(agendaDias).filter(([, config]) => config.seleccionado);

    if (diasSeleccionados.length === 0) {
      toast.error('Debe seleccionar al menos un día de la semana.');
      return;
    }

    setSubmitting(true);

    try {
      const promesas: Promise<unknown>[] = [];

      diasSeleccionados.forEach(([diaKey, config]) => {
        if (config.manana.activo) {
          promesas.push(
            clientesAxios.post('/horarioAtencion', {
              medico: medicoSeleccionado,
              diaSemana: diaKey,
              horaInicio: config.manana.horaInicio,
              horaFin: config.manana.horaFin,
              duracionTurnoMinutos: duracionTurno,
              activo: true
            })
          );
        }

        if (config.tarde.activo) {
          promesas.push(
            clientesAxios.post('/horarioAtencion', {
              medico: medicoSeleccionado,
              diaSemana: diaKey,
              horaInicio: config.tarde.horaInicio,
              horaFin: config.tarde.horaFin,
              duracionTurnoMinutos: duracionTurno,
              activo: true
            })
          );
        }
      });

      await Promise.all(promesas);

      toast.success('¡Horarios de atención registrados exitosamente!');
      
      setTimeout(() => {
        navigate('/horarioAtencion');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error al crear horarios:', err);
      const backendMessage = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Error al registrar los horarios de atención en el servidor.'
        : 'Error al registrar los horarios de atención en el servidor.';
      
      toast.error(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <HorarioAtencionFormSkeleton />;
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '850px', borderRadius: '12px' }}>
        
        {/* Cabecera Reutilizada */}
        <PageHeader 
          titulo="Configurar Horarios de Atención"
          subtitulo="Seleccione el profesional para consultar o actualizar su disponibilidad semanal."
          icon={<BsClock className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => navigate('/horarioAtencion')}
        />

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          
          {/* Configuración General */}
          <div className="row g-3 mb-4 p-3 bg-light rounded-3">
            <div className="col-md-8">
              <label className="form-label fw-semibold text-secondary small">Médico Profesional</label>
              <select 
                className="form-select shadow-none" 
                value={medicoSeleccionado}
                onChange={(e) => handleCambioMedico(e.target.value)}
                required
              >
                <option value="">Seleccione un médico...</option>
                {medicos.map(m => {
                  const medicoId = m.id || '';
                  return (
                    <option key={medicoId} value={medicoId}>
                      Dr./Dra. {m.nombre} {m.apellido}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold text-secondary small">Duración Turno (minutos)</label>
              <input 
                type="number" 
                className="form-control shadow-none" 
                value={duracionTurno}
                onChange={(e) => setDuracionTurno(Number(e.target.value))}
                min={5}
                max={120}
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Disponibilidad Semanal</h5>
            {loadingHorariosMedico && (
              <span className="text-muted small d-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" style={{ color: '#00ACB2' }}></span>
                Buscando agenda del médico...
              </span>
            )}
          </div>

          {/* Listado de Días */}
          <div className="d-flex flex-column gap-3">
            {DIAS_SEMANA.map(({ key, label }) => {
              const diaConf = agendaDias[key];
              return (
                <div key={key} className={`card border ${diaConf.seleccionado ? 'border-info bg-light-subtle shadow-sm' : 'border-secondary-subtle'} p-3`} style={{ borderRadius: '10px', transition: 'all 0.2s' }}>
                  
                  {/* Fila principal del Día */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`check-${key}`}
                        checked={diaConf.seleccionado}
                        onChange={() => handleToggleDia(key)}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                      <label className="form-check-label fw-bold text-dark ms-2 fs-6" htmlFor={`check-${key}`} style={{ cursor: 'pointer' }}>
                        {label}
                      </label>
                    </div>
                    <span className={`badge ${diaConf.seleccionado ? 'bg-info text-dark' : 'bg-secondary text-white'}`}>
                      {diaConf.seleccionado ? 'Habilitado' : 'Sin servicio'}
                    </span>
                  </div>

                  {/* Configuración de Turnos si el día está seleccionado */}
                  {diaConf.seleccionado && (
                    <div className="mt-3 pt-3 border-top border-secondary-subtle row g-3">
                      
                      {/* TURNO MAÑANA */}
                      <div className="col-md-6">
                        <div className="p-2 bg-white rounded border border-secondary-subtle">
                          <div className="form-check mb-2">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`manana-${key}`}
                              checked={diaConf.manana.activo}
                              onChange={(e) => handleTurnoChange(key, 'manana', 'activo', e.target.checked)}
                            />
                            <label className="form-check-label fw-semibold small text-muted" htmlFor={`manana-${key}`}>
                              Turno Mañana
                            </label>
                          </div>

                          {diaConf.manana.activo && (
                            <div className="row g-2">
                              <div className="col-6">
                                <label className="form-label text-muted x-small mb-0">Desde</label>
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm shadow-none" 
                                  value={diaConf.manana.horaInicio}
                                  onChange={(e) => handleTurnoChange(key, 'manana', 'horaInicio', e.target.value)}
                                  placeholder="08:00"
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label text-muted x-small mb-0">Hasta</label>
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm shadow-none" 
                                  value={diaConf.manana.horaFin}
                                  onChange={(e) => handleTurnoChange(key, 'manana', 'horaFin', e.target.value)}
                                  placeholder="12:00"
                                  required
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TURNO TARDE */}
                      <div className="col-md-6">
                        <div className="p-2 bg-white rounded border border-secondary-subtle">
                          <div className="form-check mb-2">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`tarde-${key}`}
                              checked={diaConf.tarde.activo}
                              onChange={(e) => handleTurnoChange(key, 'tarde', 'activo', e.target.checked)}
                            />
                            <label className="form-check-label fw-semibold small text-muted" htmlFor={`tarde-${key}`}>
                              Turno Tarde
                            </label>
                          </div>

                          {diaConf.tarde.activo && (
                            <div className="row g-2">
                              <div className="col-6">
                                <label className="form-label text-muted x-small mb-0">Desde</label>
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm shadow-none" 
                                  value={diaConf.tarde.horaInicio}
                                  onChange={(e) => handleTurnoChange(key, 'tarde', 'horaInicio', e.target.value)}
                                  placeholder="16:00"
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label text-muted x-small mb-0">Hasta</label>
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm shadow-none" 
                                  value={diaConf.tarde.horaFin}
                                  onChange={(e) => handleTurnoChange(key, 'tarde', 'horaFin', e.target.value)}
                                  placeholder="20:00"
                                  required
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
            <button 
              type="button" 
              className="btn btn-light px-4" 
              onClick={() => navigate('/horarioAtencion')} 
              disabled={submitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn text-white fw-semibold px-4 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar Horarios'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
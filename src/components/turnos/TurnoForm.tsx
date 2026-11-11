import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { BsCalendarPlus, BsSearch, BsX } from 'react-icons/bs';
import { TurnoFormSkeleton } from './TurnoFormSkeleton';
import clientesAxios from '../../config/axios';
import type { OptionItem, MedicoItem, HorarioAtencionItem, TurnoFormProps } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';
import { toast } from 'sonner';

export const TurnoForm: React.FC<TurnoFormProps> = ({ turnoId, onSuccess, onCancel }) => {
  const [searchParams] = useSearchParams();

  const [pacientes, setPacientes] = useState<OptionItem[]>([]);
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<OptionItem[]>([]);
  const [horariosAtencionMedico, setHorariosAtencionMedico] = useState<HorarioAtencionItem[]>([]);

  const [formData, setFormData] = useState({
    paciente: searchParams.get('paciente') || '',
    medico: '',
    especialidad: '',
    fecha: '',
    hora: '',
    estado: 'pendiente',
    observaciones: ''
  });

  // Estados específicos para los inputs de búsqueda interactiva
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [mostrarDropdownPaciente, setMostrarDropdownPaciente] = useState(false);

  const [busquedaMedico, setBusquedaMedico] = useState('');
  const [mostrarDropdownMedico, setMostrarDropdownMedico] = useState(false);

  // Referencias para detectar clics fuera y cerrar los desplegables
  const pacienteRef = useRef<HTMLDivElement>(null);
  const medicoRef = useRef<HTMLDivElement>(null);

  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadingHorarios, setLoadingHorarios] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const isEditing = Boolean(turnoId);

  // Cerrar los dropdowns si hacen clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pacienteRef.current && !pacienteRef.current.contains(event.target as Node)) {
        setMostrarDropdownPaciente(false);
      }
      if (medicoRef.current && !medicoRef.current.contains(event.target as Node)) {
        setMostrarDropdownMedico(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Función para obtener los horarios de atención configurados del médico
  const cargarHorariosAtencionMedico = async (medicoId: string) => {
    try {
      setLoadingHorarios(true);
      const response = await clientesAxios.get(`/horarioAtencion?medico=${medicoId}`);
      const data = response.data;
      let listaHorarios: HorarioAtencionItem[] = [];

      if (Array.isArray(data)) {
        listaHorarios = data;
      } else if (data && typeof data === 'object') {
        const record = data as Record<string, unknown>;
        if (Array.isArray(record.data)) listaHorarios = record.data as HorarioAtencionItem[];
        else if (Array.isArray(record.horarios)) listaHorarios = record.horarios as HorarioAtencionItem[];
      }

      setHorariosAtencionMedico(listaHorarios);
    } catch (err) {
      console.error('Error al cargar horarios de atención del médico:', err);
      setHorariosAtencionMedico([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  // 2. Función auxiliar para generar los bloques de horas
  const generarBloquesHorarios = (horaInicio: string, horaFin: string, duracionMinutos: number) => {
    const bloques: string[] = [];
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    let minutosActuales = hInicio * 60 + mInicio;
    const minutosFin = hFin * 60 + mFin;
    const duracion = duracionMinutos && duracionMinutos > 0 ? duracionMinutos : 30;

    while (minutosActuales < minutosFin) {
      const horas = Math.floor(minutosActuales / 60);
      const minutos = minutosActuales % 60;
      const horaFormateada = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
      bloques.push(horaFormateada);
      minutosActuales += duracion;
    }

    return bloques;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        const extraerArray = (responseData: unknown, claveSugerida: string): OptionItem[] => {
          if (Array.isArray(responseData)) {
            return responseData as OptionItem[];
          }
          if (responseData && typeof responseData === 'object') {
            const record = responseData as Record<string, unknown>;
            if (Array.isArray(record[claveSugerida])) {
              return record[claveSugerida] as OptionItem[];
            }
            if (Array.isArray(record.data)) {
              return record.data as OptionItem[];
            }
          }
          return [];
        };

        if (isEditing && turnoId) {
          const [resPacientes, resMedicos, resTurno] = await Promise.all([
            clientesAxios.get('/pacientes'),
            clientesAxios.get('/medicos'),
            clientesAxios.get(`/turnos/${turnoId}`)
          ]);

          const listaPacientes = extraerArray(resPacientes.data, 'pacientes');
          const listaMedicos = extraerArray(resMedicos.data, 'medicos') as MedicoItem[];

          setPacientes(listaPacientes);
          setMedicos(listaMedicos);

          const dataTurno = resTurno.data.turno || resTurno.data.data || resTurno.data;
          
          const pacienteId = dataTurno.paciente?._id || dataTurno.paciente?.id || dataTurno.paciente;
          const medicoId = dataTurno.medico?._id || dataTurno.medico?.id || dataTurno.medico;
          const especialidadId = dataTurno.especialidad?._id || dataTurno.especialidad?.id || dataTurno.especialidad;

          // Autocompletar textos visuales si estamos editando
          const pacienteEncontrado = listaPacientes.find(p => (p.id === pacienteId || p._id === pacienteId));
          if (pacienteEncontrado) {
            setBusquedaPaciente(`${pacienteEncontrado.nombre} ${pacienteEncontrado.apellido || ''}`);
          }

          const medicoEncontrado = listaMedicos.find(m => (m.id === medicoId || m._id === medicoId));
          if (medicoEncontrado) {
            setBusquedaMedico(`Dr./Dra. ${medicoEncontrado.nombre} ${medicoEncontrado.apellido || ''}`);
            if (Array.isArray(medicoEncontrado.especialidades)) {
              setEspecialidadesDisponibles(medicoEncontrado.especialidades);
            }
          }

          if (medicoId) {
            await cargarHorariosAtencionMedico(medicoId);
          }

          setFormData({
            paciente: pacienteId || '',
            medico: medicoId || '',
            especialidad: especialidadId || '',
            fecha: dataTurno.fecha ? dataTurno.fecha.split('T')[0] : '',
            hora: dataTurno.hora || '',
            estado: dataTurno.estado || 'pendiente',
            observaciones: dataTurno.observaciones || ''
          });

        } else {
          const [resPacientes, resMedicos] = await Promise.all([
            clientesAxios.get('/pacientes'),
            clientesAxios.get('/medicos')
          ]);

          setPacientes(extraerArray(resPacientes.data, 'pacientes'));
          setMedicos(extraerArray(resMedicos.data, 'medicos') as MedicoItem[]);
        }

      } catch (err) {
        console.error('Error al cargar datos del formulario:', err);
        toast.error('No se pudieron cargar los datos necesarios.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [turnoId, isEditing]);

  // Filtrado reactivo de pacientes según lo que escriba el usuario
  const pacientesFiltrados = pacientes.filter(p => {
    const texto = `${p.nombre} ${p.apellido || ''} ${p.razonSocial || ''}`.toLowerCase();
    return texto.includes(busquedaPaciente.toLowerCase());
  });

  // Filtrado reactivo de médicos
  const medicosFiltrados = medicos.filter(m => {
    const texto = `Dr. Dra. ${m.nombre} ${m.apellido || ''}`.toLowerCase();
    return texto.includes(busquedaMedico.toLowerCase());
  });

  // 3. Cálculo derivado de horas disponibles
  const obtenerHorasDisponibles = (): string[] => {
    if (!formData.fecha || horariosAtencionMedico.length === 0) {
      return [];
    }

    const fechaObj = new Date(formData.fecha + 'T00:00:00');
    const diasSemanaMap = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diaSeleccionado = diasSemanaMap[fechaObj.getDay()];

    const horariosDelDia = horariosAtencionMedico.filter(h => h.diaSemana === diaSeleccionado && h.activo !== false);

    let horasCalculadas: string[] = [];
    horariosDelDia.forEach(bloque => {
      const generadas = generarBloquesHorarios(bloque.horaInicio, bloque.horaFin, bloque.duracionTurnoMinutos);
      horasCalculadas = [...horasCalculadas, ...generadas];
    });

    return horasCalculadas;
  };

  const horasDisponibles = obtenerHorasDisponibles();

  const seleccionarPaciente = (p: OptionItem) => {
    const pId = p.id || p._id || '';
    setFormData(prev => ({ ...prev, paciente: pId }));
    setBusquedaPaciente(`${p.nombre} ${p.apellido || ''}`);
    setMostrarDropdownPaciente(false);
  };

  const seleccionarMedico = async (m: MedicoItem) => {
    const mId = m.id || m._id || '';
    
    setFormData(prev => ({ 
      ...prev, 
      medico: mId, 
      especialidad: '',
      fecha: '',
      hora: ''
    }));

    setBusquedaMedico(`Dr./Dra. ${m.nombre} ${m.apellido || ''}`);
    setMostrarDropdownMedico(false);
    setHorariosAtencionMedico([]);

    if (Array.isArray(m.especialidades)) {
      setEspecialidadesDisponibles(m.especialidades);
    } else {
      setEspecialidadesDisponibles([]);
    }

    await cargarHorariosAtencionMedico(mId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && turnoId) {
        await clientesAxios.put(`/turnos/${turnoId}`, formData);
        toast.success('¡Turno actualizado exitosamente!');
      } else {
        await clientesAxios.post('/turnos', formData);
        toast.success('¡Turno creado y guardado exitosamente!');
      }
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: unknown) {
      console.error('Error al guardar el turno:', err);
      const backendMessage = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Error al guardar el turno en el servidor.'
        : 'Error al guardar el turno en el servidor.';
      toast.error(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <TurnoFormSkeleton />;
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
       {/* Cabecera Reutilizada */}
        <PageHeader 
          titulo={isEditing ? 'Modificar Turno Médico' : 'Asignar Nuevo Turno'}
          subtitulo={isEditing ? 'Actualice los datos necesarios del turno.' : 'Complete los datos para registrar un turno médico.'}
          icon={<BsCalendarPlus className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={onCancel}
        />
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            
            {/* BUSCADOR INTELIGENTE DE PACIENTES */}
            <div className="col-12 position-relative" ref={pacienteRef}>
              <label className="form-label fw-semibold text-secondary small">Paciente</label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted border-end-0">
                  <BsSearch size={14} />
                </span>
                <input 
                  type="text" 
                  className="form-control shadow-none border-start-0 ps-0"
                  placeholder="Escriba el nombre o apellido del paciente para buscar..."
                  value={busquedaPaciente}
                  onChange={(e) => {
                    setBusquedaPaciente(e.target.value);
                    setMostrarDropdownPaciente(true);
                    if (!e.target.value) setFormData(prev => ({ ...prev, paciente: '' }));
                  }}
                  onFocus={() => setMostrarDropdownPaciente(true)}
                  required={!formData.paciente}
                />
                {busquedaPaciente && (
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary border bg-white"
                    onClick={() => {
                      setBusquedaPaciente('');
                      setFormData(prev => ({ ...prev, paciente: '' }));
                    }}
                  >
                    <BsX size={16} />
                  </button>
                )}
              </div>

              {/* Lista desplegable filtrada de pacientes */}
              {mostrarDropdownPaciente && (
                <div className="position-absolute w-100 bg-white shadow-sm border rounded-bottom mt-1 z-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {pacientesFiltrados.length > 0 ? (
                    pacientesFiltrados.map(p => {
                      const pId = p.id || p._id || '';
                      return (
                        <div 
                          key={pId} 
                          className="p-2 px-3 border-bottom text-dark"
                          style={{ cursor: 'pointer', fontSize: '14px' }}
                          onMouseDown={() => seleccionarPaciente(p)}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                          <strong>{p.nombre} {p.apellido}</strong>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2 text-muted small text-center">No se encontraron pacientes con ese nombre.</div>
                  )}
                </div>
              )}
            </div>

            {/* BUSCADOR INTELIGENTE DE MÉDICOS */}
            <div className="col-md-6 position-relative" ref={medicoRef}>
              <label className="form-label fw-semibold text-secondary small">Médico</label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted border-end-0">
                  <BsSearch size={14} />
                </span>
                <input 
                  type="text" 
                  className="form-control shadow-none border-start-0 ps-0"
                  placeholder="Buscar médico..."
                  value={busquedaMedico}
                  onChange={(e) => {
                    setBusquedaMedico(e.target.value);
                    setMostrarDropdownMedico(true);
                    if (!e.target.value) {
                      setFormData(prev => ({ ...prev, medico: '', especialidad: '', fecha: '', hora: '' }));
                      setEspecialidadesDisponibles([]);
                    }
                  }}
                  onFocus={() => setMostrarDropdownMedico(true)}
                  required={!formData.medico}
                />
                {busquedaMedico && (
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary border bg-white"
                    onClick={() => {
                      setBusquedaMedico('');
                      setFormData(prev => ({ ...prev, medico: '', especialidad: '', fecha: '', hora: '' }));
                      setEspecialidadesDisponibles([]);
                    }}
                  >
                    <BsX size={16} />
                  </button>
                )}
              </div>

              {/* Lista desplegable filtrada de médicos */}
              {mostrarDropdownMedico && (
                <div className="position-absolute w-100 bg-white shadow-sm border rounded-bottom mt-1 z-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {medicosFiltrados.length > 0 ? (
                    medicosFiltrados.map(m => {
                      const mId = m.id || m._id || '';
                      return (
                        <div 
                          key={mId} 
                          className="p-2 px-3 border-bottom text-dark"
                          style={{ cursor: 'pointer', fontSize: '14px' }}
                          onMouseDown={() => seleccionarMedico(m)}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                          <strong>Dr./Dra. {m.nombre} {m.apellido}</strong>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2 text-muted small text-center">No se encontraron médicos.</div>
                  )}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Especialidad</label>
              <select 
                className="form-select shadow-none" 
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                required
                disabled={!formData.medico}
              >
                <option value="">
                  {formData.medico ? 'Seleccione una especialidad...' : 'Primero seleccione un médico'}
                </option>
                {especialidadesDisponibles.map(e => {
                  const eId = e.id || e._id || '';
                  return (
                    <option key={eId} value={eId}>
                      {e.nombre}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Fecha</label>
              <input 
                type="date" 
                className="form-control shadow-none" 
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                disabled={!formData.medico}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Hora del Turno {loadingHorarios && <span className="text-info spinner-border spinner-border-sm ms-1"></span>}
              </label>
              <select 
                className="form-select shadow-none" 
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                required
                disabled={!formData.fecha || horasDisponibles.length === 0}
              >
                <option value="">
                  {!formData.fecha 
                    ? 'Primero seleccione una fecha' 
                    : horasDisponibles.length === 0 
                      ? 'No hay horarios configurados para este día' 
                      : 'Seleccione un horario disponible...'}
                </option>
                {horasDisponibles.map(horaBlock => (
                  <option key={horaBlock} value={horaBlock}>
                    {horaBlock} hs
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Estado del Turno</label>
              <select 
                className="form-select shadow-none text-uppercase" 
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="finalizado">Finalizado</option>
                <option value="atendido">Atendido</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Observaciones</label>
              <textarea
                className="form-control shadow-none"
                name="observaciones"
                rows={3}
                maxLength={500}
                placeholder="Observaciones del turno (opcional)"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              />
            </div>

          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
            {onCancel && (
              <button type="button" className="btn btn-light px-4" onClick={onCancel} disabled={submitting}>
                Cancelar
              </button>
            )}
            <button 
              type="submit" 
              className="btn text-white fw-semibold px-4 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : (isEditing ? 'Actualizar Turno' : 'Registrar Turno')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
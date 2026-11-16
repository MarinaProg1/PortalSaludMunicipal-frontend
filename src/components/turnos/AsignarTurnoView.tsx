import React, { useState, useEffect } from 'react';
import { BsCalendarCheck, BsArrowLeft, BsLightningCharge } from 'react-icons/bs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import type { EspecialidadItem, DiaMesDisponibilidad, MedicoItem } from './turno.schema';
import { TurnoSelectField } from './TurnoSelectField';
import { CalendarioMensual } from './CalendarioMensual';
import { HorariosDisponibles } from './HorariosDisponibles';

export const AsignarTurnoView: React.FC = () => {
  const navigate = useNavigate();
  const [especialidades, setEspecialidades] = useState<EspecialidadItem[]>([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>('');
  
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [loadingMedicos, setLoadingMedicos] = useState<boolean>(false);
  const [medicoActivo, setMedicoActivo] = useState<MedicoItem | null>(null);

  // Control del Mes y Año actual para el calendario
  const fechaActual = new Date();
  const [anioActual, setAnioActual] = useState<number>(fechaActual.getFullYear());
  const [mesActual, setMesActual] = useState<number>(fechaActual.getMonth() + 1); // 1-12

  // Días del mes con su estado de disponibilidad
  const [diasDelMes, setDiasDelMes] = useState<DiaMesDisponibilidad[]>([]);
  const [loadingMes, setLoadingMes] = useState<boolean>(false);

  // Fecha seleccionada específica para ver los slots detallados abajo
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [todosLosSlots, setTodosLosSlots] = useState<string[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState<boolean>(false);

  // 1. Cargar especialidades al montar
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const res = await clientesAxios.get('/especialidades');
        const data = res.data.data || res.data;
        setEspecialidades(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar especialidades:', err);
        toast.error('No se pudieron cargar las especialidades.');
      }
    };
    fetchEspecialidades();
  }, []);

  // 2. Manejar cambio de especialidad para filtrar médicos
  const handleCambioEspecialidad = async (nuevaEsp: string) => {
    setEspecialidadSeleccionada(nuevaEsp);
    setMedicoActivo(null);
    setDiasDelMes([]);
    setFechaSeleccionada('');

    if (!nuevaEsp) {
      setMedicos([]);
      return;
    }
    
    setLoadingMedicos(true);
    try {
      const res = await clientesAxios.get(`/medicos?especialidades=${nuevaEsp}`);
      const data = res.data.data || res.data;
      setMedicos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al filtrar médicos:', err);
      toast.error('Error al filtrar médicos.');
      setMedicos([]);
    } finally {
      setLoadingMedicos(false);
    }
  };

  // 3. Cargar la disponibilidad de TODO EL MES cuando cambia el médico, año o mes
  useEffect(() => {
    if (!medicoActivo) return;

    const fetchDisponibilidadMes = async () => {
      setLoadingMes(true);
      try {
        const res = await clientesAxios.get(`/turnos/disponibilidad-mes?medico=${medicoActivo.id}&anio=${anioActual}&mes=${mesActual}`);
        const data = res.data.data || res.data;
        setDiasDelMes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar disponibilidad mensual:', err);
        toast.error('No se pudo cargar la disponibilidad del mes.');
        setDiasDelMes([]);
      } finally {
        setLoadingMes(false);
      }
    };

    fetchDisponibilidadMes();
  }, [medicoActivo, anioActual, mesActual]);

  // 4. Consultar los slots detallados de un día específico cuando el operador hace clic en un día
  useEffect(() => {
    if (!medicoActivo || !fechaSeleccionada) return;

    const consultarSlotsDia = async () => {
      setLoadingDisponibilidad(true);
      try {
        const res = await clientesAxios.get(`/turnos/disponibles?medico=${medicoActivo.id}&fecha=${fechaSeleccionada}`);
        const dataRespuesta = res.data.data || res.data;
        setTodosLosSlots(dataRespuesta?.todosLosSlots || []);
        setHorariosDisponibles(dataRespuesta?.horariosDisponibles || []);
      } catch (err) {
        console.error('Error al consultar slots del día:', err);
        toast.error('No se pudieron consultar los horarios.');
        setTodosLosSlots([]);
        setHorariosDisponibles([]);
      } finally {
        setLoadingDisponibilidad(false);
      }
    };

    consultarSlotsDia();
  }, [medicoActivo, fechaSeleccionada]);

  // Navegación entre meses con las flechas
  const cambiarMes = (direccion: 'prev' | 'next') => {
    if (direccion === 'prev') {
      if (mesActual === 1) {
        setMesActual(12);
        setAnioActual(anioActual - 1);
      } else {
        setMesActual(mesActual - 1);
      }
    } else {
      if (mesActual === 12) {
        setMesActual(1);
        setAnioActual(anioActual + 1);
      } else {
        setMesActual(mesActual + 1);
      }
    }
  };

  // Al hacer clic en un slot libre (Turno Normal)
  const handleSeleccionarSlotLibre = (hora: string) => {
    const nombreCompleto = encodeURIComponent(`Dr./Dra. ${medicoActivo?.nombre || ''} ${medicoActivo?.apellido || ''}`);
    navigate(`/turnos/nuevo?medico=${medicoActivo?.id}&nombre=${nombreCompleto}&especialidad=${especialidadSeleccionada}&fecha=${fechaSeleccionada}&hora=${hora}`);
  };

 // 🌟 Acción para registrar turno urgente / guardia con fecha y hora actual automáticas
  const handleTurnoUrgente = () => {
    if (!medicoActivo) {
      toast.error('Debe seleccionar un médico profesional para registrar la urgencia.');
      return;
    }

    const hoy = new Date();
    
    // Fecha actual (YYYY-MM-DD)
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaHoyStr = `${anio}-${mes}-${dia}`;

    // Hora actual (HH:mm) exigida por la base de datos
    const horas = String(hoy.getHours()).padStart(2, '0');
    const minutos = String(hoy.getMinutes()).padStart(2, '0');
    const horaActualStr = `${horas}:${minutos}`;

    const nombreCompleto = encodeURIComponent(`Dr./Dra. ${medicoActivo?.nombre || ''} ${medicoActivo?.apellido || ''}`);
    
    // Redirigimos pasando la fecha, la hora actual y urgencia=true
    navigate(`/turnos/nuevo?medico=${medicoActivo?.id}&nombre=${nombreCompleto}&especialidad=${especialidadSeleccionada}&fecha=${fechaHoyStr}&hora=${horaActualStr}&urgencia=true`);
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '1000px', borderRadius: '12px' }}>
        
        <PageHeader 
          titulo="Asignación de Turnos"
          subtitulo="Seleccione una especialidad, elija el profesional y navegue por el calendario mensual."
          icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
        />

        {/* Botón de retorno rápido según el nivel de navegación actual */}
        {medicoActivo && (
          <div className="mb-3">
            <button 
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-none"
              onClick={() => {
                if (fechaSeleccionada) {
                  setFechaSeleccionada('');
                  setTodosLosSlots([]);
                  setHorariosDisponibles([]);
                } else {
                  setMedicoActivo(null);
                }
              }}
            >
              <BsArrowLeft /> {fechaSeleccionada ? 'Volver al calendario mensual' : 'Cambiar de médico o especialidad'}
            </button>
          </div>
        )}

        {/* PASO 1: Filtrar por Especialidad */}
        {!medicoActivo && (
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3">1. Filtrar por Especialidad</h5>
            <TurnoSelectField
              className="mb-0"
              label=""
              value={especialidadSeleccionada}
              onChange={(value) => void handleCambioEspecialidad(value)}
              placeholder="Seleccione una especialidad..."
              selectClassName="form-select shadow-none"
              options={especialidades.map((esp: EspecialidadItem) => ({
                value: esp._id,
                label: esp.nombre,
              }))}
            />
          </div>
        )}

        {/* PASO 2: Seleccionar Profesional */}
        {especialidadSeleccionada && !medicoActivo && (
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3">2. Seleccionar Profesional</h5>
            {loadingMedicos ? (
              <div className="text-muted text-center py-3">Cargando médicos...</div>
            ) : medicos.length === 0 ? (
              <div className="alert alert-warning text-center">No hay médicos en esta especialidad.</div>
            ) : (
              <div className="row g-3">
                {medicos.map(med => (
                  <div key={med.id} className="col-md-6">
                    <div 
                      className="card border border-secondary-subtle p-3 shadow-sm h-100 d-flex flex-column justify-content-between bg-white" 
                      style={{ borderRadius: '10px' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="fw-bold text-dark mb-1 fs-6">Dr./Dra. {med.nombre} {med.apellido}</h6>
                          <span className="text-muted small">Profesional de salud</span>
                        </div>
                        <button 
                          type="button"
                          className="btn btn-sm text-dark bg-primary-subtle px-2 text-center py-2 border-primary border border-primary rounded-2"
                          onClick={() => {
                            setMedicoActivo(med);
                            setFechaSeleccionada('');
                          }}
                        >
                          Ver Calendario
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 3: Calendario Mensual, Horarios y Opción de Urgencia */}
        {medicoActivo && (
          <div className="mt-2 pt-3">
            <div className="mb-3 p-3 bg-light rounded-3 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div>
                <span className="text-muted small d-block">Profesional seleccionado:</span>
                <h5 className="fw-bold text-dark mb-0">Dr./Dra. {medicoActivo.nombre} {medicoActivo.apellido}</h5>
              </div>

              {/* Botón de Turno Urgente / Guardia */}
              <button
                type="button"
                className="btn btn-outline-danger fw-semibold d-flex align-items-center gap-2 shadow-sm px-2 py-1"
                style={{ borderRadius: '8px' }}
                onClick={handleTurnoUrgente}
              >
                <BsLightningCharge size={18} />
                Registrar Turno Urgente 
              </button>
            </div>

            {/* Calendario Mensual */}
            {!fechaSeleccionada && (
              <CalendarioMensual
                titulo={`Agenda Mensual`}
                anio={anioActual}
                mes={mesActual}
                dias={diasDelMes}
                fechaSeleccionada={fechaSeleccionada}
                loading={loadingMes}
                onCambiarMes={cambiarMes}
                onSeleccionarFecha={setFechaSeleccionada}
              />
            )}

            {/* Horarios Disponibles */}
            {fechaSeleccionada && (
              <div className="mt-2">
                <HorariosDisponibles
                  fecha={fechaSeleccionada}
                  todosLosSlots={todosLosSlots}
                  horariosDisponibles={horariosDisponibles}
                  loading={loadingDisponibilidad}
                  onSeleccionar={handleSeleccionarSlotLibre}
                />
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
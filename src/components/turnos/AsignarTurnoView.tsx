import { useState, useEffect, useCallback } from 'react';
import { BsCalendarCheck, BsArrowLeft, BsLightningCharge } from 'react-icons/bs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { useAuth } from '../../context/AuthContext';
import type { EspecialidadItem, DiaMesDisponibilidad, MedicoItem } from './turno.schema';
import { TurnoSelectField } from './TurnoSelectField';
import { CalendarioMensual } from './CalendarioMensual';
import { HorariosDisponibles } from './HorariosDisponibles';
import { DEFAULT_PAGE_SIZE, parsePaginatedResponse } from '../../utils/pagination';
import { PaginationControls } from '../common/PaginationControls';

const obtenerIdEntidad = (item: { id?: string; _id?: string }): string =>
  String(item.id || item._id || '');

export const AsignarTurnoView = () => {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const rolActual = (rol || '').toUpperCase();
  const esPaciente = rolActual === 'PACIENTE';

  const [especialidades, setEspecialidades] = useState<EspecialidadItem[]>([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>('');

  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [loadingMedicos, setLoadingMedicos] = useState<boolean>(false);
  const [medicoActivo, setMedicoActivo] = useState<MedicoItem | null>(null);
  const [paginaMedicos, setPaginaMedicos] = useState(1);
  const [limiteMedicos, setLimiteMedicos] = useState(DEFAULT_PAGE_SIZE);
  const [totalMedicos, setTotalMedicos] = useState(0);

  const fechaActual = new Date();
  const [anioActual, setAnioActual] = useState<number>(fechaActual.getFullYear());
  const [mesActual, setMesActual] = useState<number>(fechaActual.getMonth() + 1);

  const [diasDelMes, setDiasDelMes] = useState<DiaMesDisponibilidad[]>([]);
  const [loadingMes, setLoadingMes] = useState<boolean>(false);

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [todosLosSlots, setTodosLosSlots] = useState<string[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState<boolean>(false);

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
    void fetchEspecialidades();
  }, []);

  const handleCambioEspecialidad = useCallback((nuevaEsp: string) => {
    setEspecialidadSeleccionada(nuevaEsp);
    setMedicoActivo(null);
    setDiasDelMes([]);
    setFechaSeleccionada('');
    setPaginaMedicos(1);
    if (!nuevaEsp) {
      setMedicos([]);
      setTotalMedicos(0);
    } else {
      setLoadingMedicos(true);
    }
  }, []);

  useEffect(() => {
    if (!especialidadSeleccionada) return;

    let activo = true;
    clientesAxios
      .get('/medicos', {
        params: {
          especialidades: especialidadSeleccionada,
          page: paginaMedicos,
          limit: limiteMedicos,
        },
      })
      .then((res) => {
        if (!activo) return;
        const resultado = parsePaginatedResponse<MedicoItem>(
          res.data,
          paginaMedicos,
          limiteMedicos,
          ['medicos']
        );
        setMedicos(resultado.items);
        setTotalMedicos(resultado.total);
      })
      .catch((err) => {
        if (!activo) return;
        console.error('Error al filtrar médicos:', err);
        toast.error('Error al filtrar médicos.');
        setMedicos([]);
      })
      .finally(() => {
        if (activo) setLoadingMedicos(false);
      });

    return () => {
      activo = false;
    };
  }, [especialidadSeleccionada, paginaMedicos, limiteMedicos]);

  useEffect(() => {
    if (!medicoActivo) return;
    const medicoId = obtenerIdEntidad(medicoActivo);
    if (!medicoId) return;

    let activo = true;
    const fetchDisponibilidadMes = async () => {
      setLoadingMes(true);
      try {
        const res = await clientesAxios.get('/turnos/disponibilidad-mes', {
          params: {
            medico: medicoId,
            anio: anioActual,
            mes: mesActual,
          },
        });
        if (!activo) return;
        const data = res.data.data || res.data;
        setDiasDelMes(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!activo) return;
        console.error('Error al cargar disponibilidad mensual:', err);
        toast.error('No se pudo cargar la disponibilidad del mes.');
        setDiasDelMes([]);
      } finally {
        if (activo) setLoadingMes(false);
      }
    };

    void fetchDisponibilidadMes();
    return () => {
      activo = false;
    };
  }, [medicoActivo, anioActual, mesActual]);

  useEffect(() => {
    if (!medicoActivo || !fechaSeleccionada) return;
    const medicoId = obtenerIdEntidad(medicoActivo);
    if (!medicoId) return;

    let activo = true;
    const consultarSlotsDia = async () => {
      setLoadingDisponibilidad(true);
      try {
        const res = await clientesAxios.get('/turnos/disponibles', {
          params: {
            medico: medicoId,
            fecha: fechaSeleccionada,
          },
        });
        if (!activo) return;
        const dataRespuesta = res.data.data || res.data;
        setTodosLosSlots(dataRespuesta?.todosLosSlots || []);
        setHorariosDisponibles(dataRespuesta?.horariosDisponibles || []);
      } catch (err) {
        if (!activo) return;
        console.error('Error al consultar slots del día:', err);
        toast.error('No se pudieron consultar los horarios.');
        setTodosLosSlots([]);
        setHorariosDisponibles([]);
      } finally {
        if (activo) setLoadingDisponibilidad(false);
      }
    };

    void consultarSlotsDia();
    return () => {
      activo = false;
    };
  }, [medicoActivo, fechaSeleccionada]);

  const cambiarMes = (direccion: 'prev' | 'next') => {
    setFechaSeleccionada('');
    setMesActual((prevMes) => {
      if (direccion === 'prev') {
        if (prevMes === 1) {
          setAnioActual((prevAnio) => prevAnio - 1);
          return 12;
        }
        return prevMes - 1;
      }

      if (prevMes === 12) {
        setAnioActual((prevAnio) => prevAnio + 1);
        return 1;
      }
      return prevMes + 1;
    });
  };

  const handleSeleccionarSlotLibre = (hora: string) => {
    if (!medicoActivo) return;
    const medicoId = obtenerIdEntidad(medicoActivo);
    const nombreCompleto = encodeURIComponent(
      `Dr./Dra. ${medicoActivo.nombre} ${medicoActivo.apellido || ''}`.trim()
    );
    navigate(
      `/turnos/nuevo?medico=${medicoId}&nombre=${nombreCompleto}&especialidad=${especialidadSeleccionada}&fecha=${fechaSeleccionada}&hora=${hora}`
    );
  };

  const handleTurnoUrgente = () => {
    if (esPaciente) return;
    if (!medicoActivo) {
      toast.error('Debe seleccionar un médico profesional para registrar la urgencia.');
      return;
    }

    const medicoId = obtenerIdEntidad(medicoActivo);
    const hoy = new Date();
    const fechaHoyStr = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');
    const horaActualStr = hoy.toTimeString().slice(0, 5);

    const nombreCompleto = encodeURIComponent(
      `Dr./Dra. ${medicoActivo.nombre} ${medicoActivo.apellido || ''}`.trim()
    );
    navigate(
      `/turnos/nuevo?medico=${medicoId}&nombre=${nombreCompleto}&especialidad=${especialidadSeleccionada}&fecha=${fechaHoyStr}&hora=${horaActualStr}&urgencia=true`
    );
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div
        className="card border-0 shadow-sm bg-white p-4 mx-auto"
        style={{ maxWidth: '1000px', borderRadius: '12px' }}
      >
        <PageHeader
          titulo="Asignación de Turnos"
          subtitulo="Seleccione una especialidad, elija el profesional y navegue por el calendario mensual."
          icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
        />

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
              <BsArrowLeft />{' '}
              {fechaSeleccionada
                ? 'Volver al calendario mensual'
                : 'Cambiar de médico o especialidad'}
            </button>
          </div>
        )}

        {!medicoActivo && (
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3">1. Filtrar por Especialidad</h5>
            <TurnoSelectField
              className="mb-0"
              label=""
              value={especialidadSeleccionada}
              onChange={handleCambioEspecialidad}
              placeholder="Seleccione una especialidad..."
              selectClassName="form-select shadow-none"
              options={especialidades.map((esp) => ({
                value: obtenerIdEntidad(esp),
                label: esp.nombre,
              }))}
            />
          </div>
        )}

        {especialidadSeleccionada && !medicoActivo && (
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3">2. Seleccionar Profesional</h5>
            {loadingMedicos ? (
              <div className="text-muted text-center py-3">Cargando médicos...</div>
            ) : medicos.length === 0 ? (
              <div className="alert alert-warning text-center">
                No hay médicos en esta especialidad.
              </div>
            ) : (
              <div className="row g-3">
                {medicos.map((med) => {
                  const medId = obtenerIdEntidad(med);
                  return (
                    <div key={medId} className="col-md-6">
                      <div
                        className="card border border-secondary-subtle p-3 shadow-sm h-100 d-flex flex-column justify-content-between bg-white"
                        style={{ borderRadius: '10px' }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="fw-bold text-dark mb-1 fs-6">
                              Dr./Dra. {med.nombre} {med.apellido || ''}
                            </h6>
                            <span className="text-muted small">Profesional de salud</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm text-dark bg-primary-subtle px-2 py-2 border-primary border rounded-2"
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
                  );
                })}
              </div>
            )}
            {!loadingMedicos && medicos.length > 0 && (
              <PaginationControls
                page={paginaMedicos}
                limit={limiteMedicos}
                total={totalMedicos}
                onPageChange={(newPage) => {
                  setLoadingMedicos(true);
                  setPaginaMedicos(newPage);
                }}
                onLimitChange={(newLimit) => {
                  setLoadingMedicos(true);
                  setLimiteMedicos(newLimit);
                  setPaginaMedicos(1);
                }}
              />
            )}
          </div>
        )}

        {medicoActivo && (
          <div className="mt-2 pt-3">
            <div className="mb-3 p-3 bg-light rounded-3 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div>
                <span className="text-muted small d-block">Profesional seleccionado:</span>
                <h5 className="fw-bold text-dark mb-0">
                  Dr./Dra. {medicoActivo.nombre} {medicoActivo.apellido || ''}
                </h5>
              </div>

              {!esPaciente && (
                <button
                  type="button"
                  className="btn btn-outline-danger fw-semibold d-flex align-items-center gap-2 shadow-sm px-2 py-1"
                  style={{ borderRadius: '8px' }}
                  onClick={handleTurnoUrgente}
                >
                  <BsLightningCharge size={18} />
                  Registrar Turno Urgente
                </button>
              )}
            </div>

            {!fechaSeleccionada && (
              <CalendarioMensual
                titulo="Agenda Mensual"
                anio={anioActual}
                mes={mesActual}
                dias={diasDelMes}
                fechaSeleccionada={fechaSeleccionada}
                loading={loadingMes}
                onCambiarMes={cambiarMes}
                onSeleccionarFecha={setFechaSeleccionada}
              />
            )}

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
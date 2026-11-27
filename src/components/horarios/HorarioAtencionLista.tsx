import React, { useState, useEffect, useRef } from 'react';
import {
  BsPlusCircle,
  BsSearch,
  BsChevronDown,
  BsChevronUp,
  BsCalendarCheck,
  BsArrowLeft,
  BsCheckCircle,
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import clientesAxios from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { HorarioAtencionSkeleton } from './HorarioAtencionSkeleton';
import type { HorarioItem, MedicoAgrupado, DiaDisponibilidad } from './horario.schema';
import { MedicoAgendaDesplegable } from './MedicoAgendaDesplegable';
import { PageHeader } from '../../constants/PageHeader';
import { DEFAULT_PAGE_SIZE, parsePaginatedResponse } from '../../utils/pagination';
import { PaginationControls } from '../common/PaginationControls';

const normalizarTextoBusqueda = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es');

export const HorarioAtencionLista: React.FC = () => {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const esMedico = (rol || '').toUpperCase() === 'MEDICO';
  const puedeAdministrar = ['ADMIN', 'RECEPCIONISTA'].includes((rol || '').toUpperCase());
  const [horarios, setHorarios] = useState<HorarioItem[]>([]);
  const [horariosBusqueda, setHorariosBusqueda] = useState<HorarioItem[] | null>(null);
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const horariosBusquedaRequest = useRef<Promise<HorarioItem[]> | null>(null);

  const [medicoDesplegadoManual, setMedicoDesplegadoManual] = useState<string | null>(null);

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
        const response = await clientesAxios.get('/horarioAtencion', { params: { page, limit } });
        if (isMounted) {
          const resultado = parsePaginatedResponse<HorarioItem>(
            response.data,
            page,
            limit,
            ['horarios']
          );
          setHorarios(resultado.items);
          setTotal(resultado.total);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar los horarios:', err);
        if (isMounted) {
          setError('No se pudo conectar con el servidor para cargar los horarios de atención.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHorarios();
    return () => {
      isMounted = false;
    };
  }, [page, limit]);

  const cargarHorariosParaBusqueda = async () => {
    if (horariosBusqueda !== null) return;

    setBuscandoHorarios(true);
    setError(null);

    try {
      if (!horariosBusquedaRequest.current) {
        horariosBusquedaRequest.current = (async () => {
          const firstResponse = await clientesAxios.get('/horarioAtencion', {
            params: { page: 1, limit: DEFAULT_PAGE_SIZE },
          });
          const firstPage = parsePaginatedResponse<HorarioItem>(
            firstResponse.data,
            1,
            DEFAULT_PAGE_SIZE,
            ['horarios']
          );
          const remainingPages = await Promise.all(
            Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
              clientesAxios.get('/horarioAtencion', {
                params: { page: index + 2, limit: firstPage.limit },
              })
            )
          );

          return [
            ...firstPage.items,
            ...remainingPages.flatMap((response, index) =>
              parsePaginatedResponse<HorarioItem>(
                response.data,
                index + 2,
                firstPage.limit,
                ['horarios']
              ).items
            ),
          ];
        })().catch((err: unknown) => {
          horariosBusquedaRequest.current = null;
          throw err;
        });
      }

      setHorariosBusqueda(await horariosBusquedaRequest.current);
    } catch (err) {
      console.error('Error al cargar horarios para la búsqueda:', err);
      setError('No se pudieron cargar todos los horarios para realizar la búsqueda.');
    } finally {
      setBuscandoHorarios(false);
    }
  };

  const medicoUnicoId =
    esMedico && !loading
      ? (() => {
          const ids = Array.from(new Set(horarios.map((h) => h.medico?._id).filter(Boolean)));
          return ids.length === 1 ? (ids[0] as string) : null;
        })()
      : null;

  const medicoDesplegado = medicoUnicoId ?? medicoDesplegadoManual;

  useEffect(() => {
    if (!medicoDesplegado) return;
    let activo = true;
    const fetchDisponibilidadMes = async () => {
      setCargandoMes(true);
      try {
        const anio = mesActual.getFullYear();
        const mes = mesActual.getMonth() + 1;
        const res = await clientesAxios.get('/turnos/disponibilidad-mes', {
          params: { medico: medicoDesplegado, anio, mes },
        });
        if (!activo) return;
        if (res.data && res.data.ok) {
          setDiasMes(res.data.data || []);
        }
      } catch (err) {
        if (!activo) return;
        console.error('Error al cargar disponibilidad mensual:', err);
        setDiasMes([]);
      } finally {
        if (activo) setCargandoMes(false);
      }
    };
    void fetchDisponibilidadMes();
    return () => {
      activo = false;
    };
  }, [medicoDesplegado, mesActual]);

  const handleSeleccionarDia = async (fechaStr: string, tieneDisponibilidad: boolean) => {
    if (!tieneDisponibilidad || !medicoDesplegado) return;
    setFechaSeleccionada(fechaStr);
    setCargandoSlots(true);
    try {
      const res = await clientesAxios.get('/turnos/disponibles', {
        params: { medico: medicoDesplegado, fecha: fechaStr },
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
    setMesActual((prev) => {
      const nuevo = new Date(prev);
      if (direccion === 'anterior') nuevo.setMonth(nuevo.getMonth() - 1);
      else nuevo.setMonth(nuevo.getMonth() + 1);
      return nuevo;
    });
    setFechaSeleccionada('');
    setSlotsDisponibles([]);
  };

  const toggleDesplegar = (medicoId: string) => {
    if (esMedico) return;
    if (medicoDesplegadoManual === medicoId) {
      setMedicoDesplegadoManual(null);
    } else {
      setMedicoDesplegadoManual(medicoId);
      setFechaSeleccionada('');
      setSlotsDisponibles([]);
      setMesActual(new Date());
    }
  };

  const agruparPorMedico = (items: HorarioItem[]): MedicoAgrupado[] => {
    const mapa = new Map<string, MedicoAgrupado>();
    items.forEach((h) => {
      const idMed = h.medico?._id || 'sin-medico';
      const nombreMed =
        h.medico && h.medico.nombre
          ? `Dr./Dra. ${h.medico.nombre} ${h.medico.apellido || ''}`.trim()
          : 'Sin médico asignado';

      if (!mapa.has(idMed)) {
        mapa.set(idMed, { medicoId: idMed, medicoNombreCompleto: nombreMed, horarios: [] });
      }
      mapa.get(idMed)?.horarios.push(h);
    });
    return Array.from(mapa.values());
  };

  const terminoBusqueda = normalizarTextoBusqueda(busqueda);
  const horariosParaFiltrar = terminoBusqueda ? horariosBusqueda || [] : horarios;
  const medicosAgrupados = agruparPorMedico(
    horariosParaFiltrar.filter((horario) => {
      const nombreMedico = normalizarTextoBusqueda(
        `${horario.medico?.nombre || ''} ${horario.medico?.apellido || ''}`
      );
      const dia = normalizarTextoBusqueda(horario.diaSemana || '');
      return nombreMedico.includes(terminoBusqueda) || dia.includes(terminoBusqueda);
    })
  );

  const medicosAVisualizar = medicoDesplegado
    ? medicosAgrupados.filter((g) => g.medicoId === medicoDesplegado)
    : medicosAgrupados;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={esMedico ? 'Mi horario de atención' : 'Horarios y Agenda de Turnos por Médico'}
        subtitulo={
          esMedico
            ? 'Consultá tus días y franjas horarias de atención.'
            : 'Consulta la disponibilidad horaria y visualiza la agenda de turnos en tiempo real'
        }
        icon={<BsCheckCircle className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
        rightContent={
          puedeAdministrar ? (
            <button
              className="btn text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '8px', padding: '4px 10px' }}
              onClick={() => navigate('/horarioAtencion/nuevo')}
            >
              <BsPlusCircle size={18} />
              Configurar horarios
            </button>
          ) : undefined
        }
      />

      {puedeAdministrar && (
        <button
          className="btn btn-outline-primary fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3"
          style={{ borderRadius: '6px', padding: '4px 16px', margin: '2px' }}
          onClick={() => navigate('/excepcion-crear')}
        >
          <BsPlusCircle size={18} />
          Registrar Excepción
        </button>
      )}

      {!medicoDesplegado && !esMedico && (
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
                onChange={(e) => {
                  const valor = e.target.value;
                  setBusqueda(valor);
                  if (valor.trim()) {
                    void cargarHorariosParaBusqueda();
                  } else {
                    setError(null);
                  }
                }}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}

      {medicoDesplegado && !esMedico && (
        <div className="mb-3">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-none"
            onClick={() => setMedicoDesplegadoManual(null)}
          >
            <BsArrowLeft /> Volver a la lista de médicos
          </button>
        </div>
      )}

      {loading || buscandoHorarios ? (
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
              <div
                key={grupo.medicoId}
                className="card border-0 shadow-sm bg-white overflow-hidden"
                style={{ borderRadius: '12px' }}
              >
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
                        {grupo.horarios.length}{' '}
                        {grupo.horarios.length === 1
                          ? 'bloque horario configurado'
                          : 'bloques horarios configurados'}
                      </span>
                    </div>
                  </div>

                  {!esMedico && (
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
                  )}
                </div>

                {grupo.horarios.length > 0 && (
                  <div className="px-3 pb-3 d-flex flex-wrap gap-2">
                    {grupo.horarios.map((bloque, idx) => {
                      const bloqueId =
                        (bloque as { id?: string; _id?: string }).id ||
                        (bloque as { _id?: string })._id ||
                        `${grupo.medicoId}-${bloque.diaSemana}-${bloque.horaInicio}-${idx}`;
                      return (
                        <span
                          key={bloqueId}
                          className="badge bg-light text-dark border px-3 py-2 fw-normal"
                        >
                          <strong className="me-1">{bloque.diaSemana}:</strong>
                          {bloque.horaInicio} - {bloque.horaFin} ({bloque.duracionTurnoMinutos || 30} min)
                        </span>
                      );
                    })}
                  </div>
                )}

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
      {!loading && !error && !medicoDesplegado && !terminoBusqueda && (
        <PaginationControls
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}
    </div>
  );
};
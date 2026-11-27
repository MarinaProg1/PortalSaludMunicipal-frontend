import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { BsPlusCircle, BsSearch, BsCalendarCheck } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { TurnosSkeleton } from './TurnosSkeleton';
import type { TurnoItem } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { TurnoCard } from './TurnoCard';
import {
  esFechaDeHoy,
  normalizarEstadoTurno,
  normalizarTurnoParaCard,
  obtenerIdTurno,
  obtenerNombrePacienteTurno,
  type TurnoConUrgencia,
} from './turno.utils';
import { ConfirmDeleteModal } from '../../constants/ConfirmDeleteModal';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PAGE_SIZE, parsePaginatedResponse } from '../../utils/pagination';
import { PaginationControls } from '../common/PaginationControls';

export type TurnoListaItem = TurnoConUrgencia;

export const TurnosLista = () => {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const rolActual = (rol || '').toUpperCase();
  const esMedico = rolActual === 'MEDICO';
  const fallbackVolver =
    rolActual === 'PACIENTE' ? '/mis-turnos' : esMedico ? '/medicos/home' : '/turnos';

  const [turnos, setTurnos] = useState<TurnoListaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [idTurnoACancelar, setIdTurnoACancelar] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTurnos = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get('/turnos', { params: { page, limit } });

        if (isMounted) {
          const resultado = parsePaginatedResponse<TurnoListaItem>(
            response.data,
            page,
            limit,
            ['turnos']
          );
          const normalizados = resultado.items.map((item, idx) => ({
            ...item,
            id: obtenerIdTurno(item, `turno-${idx}`),
          }));
          setTurnos(normalizados);
          setTotal(resultado.total);
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

    void fetchTurnos();

    return () => {
      isMounted = false;
    };
  }, [page, limit]);

  const handleView = (id: string) => {
    navigate(esMedico ? `/atencion/${id}` : `/turno-detalle/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/turnos/editar/${id}`);
  };

  const handleAtenderTurno = (id: string) => {
    navigate(`/consultas-medicas/nuevo/${id}`);
  };

  const handleOpenCancelModal = (id: string) => {
    setIdTurnoACancelar(id);
  };

  const handleConfirmCancel = async () => {
    if (!idTurnoACancelar) return;

    setCancelando(true);
    try {
      const response = await clientesAxios.patch(`/turnos/${idTurnoACancelar}/cancelar`);

      setTurnos((prevTurnos) =>
        prevTurnos.map((t, idx) =>
          obtenerIdTurno(t, `turno-${idx}`) === idTurnoACancelar
            ? {
                ...t,
                estado: normalizarEstadoTurno(response.data?.data?.estado || 'cancelado'),
              }
            : t
        )
      );

      toast.success(response.data?.message || 'Turno cancelado correctamente.');
      setIdTurnoACancelar(null);
    } catch (err: unknown) {
      console.error('Error al cancelar el turno:', err);
      const mensaje = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Hubo un error al intentar cancelar el turno.'
        : 'Hubo un error al intentar cancelar el turno.';
      toast.error(mensaje);
    } finally {
      setCancelando(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este turno definitivamente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await clientesAxios.delete(`/turnos/${id}`);
      setTurnos((prevTurnos) =>
        prevTurnos.filter((t, idx) => obtenerIdTurno(t, `turno-${idx}`) !== id)
      );
      setTotal((prevTotal) => Math.max(0, prevTotal - 1));
      toast.success('Turno eliminado definitivamente de la base de datos.');
    } catch (err) {
      console.error('Error al eliminar el turno:', err);
      toast.error('Hubo un error al intentar eliminar el registro.');
    }
  };

  const turnosFiltrados = Array.isArray(turnos)
    ? turnos
        .filter((t) => {
          const nombrePaciente = obtenerNombrePacienteTurno(t).toLowerCase();
          const nombreMedico = `${t.medico?.nombre || ''} ${t.medico?.apellido || ''}`.toLowerCase();
          const termino = busqueda.toLowerCase();

          return nombrePaciente.includes(termino) || nombreMedico.includes(termino);
        })
        .sort((a, b) => {
          const esHoyA = esFechaDeHoy(a.fecha);
          const esHoyB = esFechaDeHoy(b.fecha);

          if (esHoyA && !esHoyB) return -1;
          if (!esHoyA && esHoyB) return 1;

          const fechaA = new Date(a.fecha).getTime();
          const fechaB = new Date(b.fecha).getTime();

          if (fechaA !== fechaB) {
            return fechaA - fechaB;
          }

          return (a.hora || '').localeCompare(b.hora || '');
        })
    : [];

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader
        titulo="Gestión de Turnos Médicos"
        subtitulo="Control y administración de turnos asignados en la salita."
        icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate, fallbackVolver)}
        rightContent={
          !esMedico ? (
            <button
              type="button"
              className="btn text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '6px', padding: '4px 8px' }}
              onClick={() => navigate('/turnos/asignar')}
            >
              <BsPlusCircle size={18} />
              Asignar Nuevo Turno
            </button>
          ) : undefined
        }
      />

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
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPage(1);
              }}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <TurnosSkeleton />
      ) : error ? (
        <div
          className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center"
          style={{ borderRadius: '12px' }}
        >
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : turnosFiltrados.length > 0 ? (
        <div className="row g-3">
          {turnosFiltrados.map((turno, index) => {
            const turnoId = obtenerIdTurno(turno, `turno-${index}`);
            const esTurnoDeHoy = esFechaDeHoy(turno.fecha);
            const estadoNormalizado = normalizarEstadoTurno(turno.estado);
            const yaCerrado =
              Boolean(turno.tieneConsulta) ||
              ['atendido', 'finalizado', 'cancelado'].includes(estadoNormalizado);
            const puedeAtender = esMedico && esTurnoDeHoy && !yaCerrado;

            return (
              <TurnoCard
                key={turnoId}
                turno={normalizarTurnoParaCard({ ...turno, id: turnoId }) as TurnoItem}
                puedeAtender={puedeAtender}
                onView={() => handleView(turnoId)}
                onEdit={() => handleEdit(turnoId)}
                onCancel={() => handleOpenCancelModal(turnoId)}
                onDelete={() => handleDelete(turnoId)}
                onMarkAttended={() => {
                  if (puedeAtender) {
                    handleAtenderTurno(turnoId);
                  }
                }}
              />
            );
          })}

          <ConfirmDeleteModal
            isOpen={idTurnoACancelar !== null}
            titulo="Confirmar Cancelación de Turno"
            mensaje="¿Estás seguro de que deseas cancelar este turno? Su estado cambiará a cancelado."
            cargando={cancelando}
            onClose={() => setIdTurnoACancelar(null)}
            onConfirm={handleConfirmCancel}
          />
        </div>
      ) : (
        <div
          className="card border-0 shadow-sm bg-white p-5 text-center"
          style={{ borderRadius: '12px' }}
        >
          <p className="text-muted mb-0">
            No se encontraron turnos registrados en la base de datos.
          </p>
        </div>
      )}
      {!loading && !error && (
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
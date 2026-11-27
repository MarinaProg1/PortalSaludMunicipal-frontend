import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { BsCalendarDay } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { TurnosSkeleton } from './TurnosSkeleton';
import type { TurnoItem } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';
import { TurnoCard } from './TurnoCard';
import { toast } from 'sonner';
import { DEFAULT_PAGE_SIZE, parsePaginatedResponse } from '../../utils/pagination';
import { PaginationControls } from '../common/PaginationControls';
import {
  normalizarEstadoTurno,
  normalizarTurnoParaCard,
  obtenerIdTurno,
  type TurnoConUrgencia,
} from './turno.utils';
import { useAuth } from '../../context/AuthContext';

type TurnoDiaItem = TurnoConUrgencia;

const obtenerHoyStr = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const esTurnoAtendido = (turno: TurnoDiaItem): boolean => {
  const estado = normalizarEstadoTurno(turno.estado);
  return estado === 'atendido' || estado === 'finalizado' || Boolean(turno.tieneConsulta);
};

export const TurnosDelDia = () => {
  const navigate = useNavigate();
  const auth = useAuth() as {
    rol?: string;
  };

  const rolActual = (auth.rol || '').toUpperCase();
  const esMedico = rolActual === 'MEDICO';

  const [turnos, setTurnos] = useState<TurnoDiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let activo = true;

    const cargarTurnosHoy = async () => {
      try {
        setLoading(true);
        const hoy = obtenerHoyStr();
        const response = await clientesAxios.get('/turnos', {
          params: { fecha: hoy, page, limit },
        });
        if (!activo) return;

        const resultado = parsePaginatedResponse<TurnoDiaItem>(
          response.data,
          page,
          limit,
          ['turnos']
        );

        setTurnos(resultado.items);
        setTotal(resultado.total);
      } catch (err) {
        if (!activo) return;
        console.error('Error al cargar turnos del día:', err);
        toast.error('No se pudieron cargar los turnos de hoy.');
      } finally {
        if (activo) setLoading(false);
      }
    };

    void cargarTurnosHoy();

    return () => {
      activo = false;
    };
  }, [page, limit]);

  const turnosOrdenados = useMemo(() => {
    return [...turnos].sort((a, b) => {
      const atendidoA = esTurnoAtendido(a);
      const atendidoB = esTurnoAtendido(b);

      if (atendidoA !== atendidoB) {
        return atendidoA ? 1 : -1;
      }

      return String(a.hora || '').localeCompare(String(b.hora || ''));
    });
  }, [turnos]);

  const handleMarcarAtendido = async (turnoId: string) => {
    if (esMedico) {
      navigate(`/consultas-medicas/nuevo/${turnoId}`);
      return;
    }

    try {
      const response = await clientesAxios.patch(`/turnos/${turnoId}/atendido`);
      const mensaje = response.data?.message || 'Turno marcado como atendido.';
      toast.success(mensaje);

      const estadoActualizado = normalizarEstadoTurno(
        response.data?.data?.estado || 'atendido'
      ).toUpperCase() as TurnoItem['estado'];

      setTurnos((prev) =>
        prev.map((t, idx) =>
          obtenerIdTurno(t, `turno-${idx}`) === turnoId
            ? { ...t, estado: estadoActualizado, tieneConsulta: true }
            : t
        )
      );
    } catch (err: unknown) {
      console.error('Error al marcar turno como atendido:', err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorObj.response?.data?.message || 'No se pudo marcar el turno como atendido.'
      );
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader
        titulo="Turnos del Día"
        subtitulo={`Programación para hoy (${new Date().toLocaleDateString()})`}
        icon={<BsCalendarDay className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate, '/turnos')}
      />

      {loading ? (
        <TurnosSkeleton />
      ) : turnosOrdenados.length > 0 ? (
        <div className="row g-3">
          {turnosOrdenados.map((turno, index) => {
            const turnoId = obtenerIdTurno(turno, `turno-${index}`);
            const estadoNormalizado = normalizarEstadoTurno(turno.estado);
            const yaCerrado =
              Boolean(turno.tieneConsulta) ||
              ['atendido', 'finalizado', 'cancelado'].includes(estadoNormalizado);
            const puedeAtender = !yaCerrado;

            return (
              <TurnoCard
                key={turnoId}
                turno={normalizarTurnoParaCard({ ...turno, id: turnoId })}
                puedeAtender={puedeAtender}
                onView={() =>
                  navigate(esMedico ? `/atencion/${turnoId}` : `/turno-detalle/${turnoId}`)
                }
                onEdit={() => navigate(`/turnos/editar/${turnoId}`)}
                onCancel={() => {}}
                onDelete={() => {}}
                onMarkAttended={() => {
                  if (puedeAtender) {
                    void handleMarcarAtendido(turnoId);
                  }
                }}
              />
            );
          })}
        </div>
      ) : (
        <div
          className="card border-0 shadow-sm bg-white p-5 text-center"
          style={{ borderRadius: '12px' }}
        >
          <p className="text-muted mb-0">No hay turnos programados para el día de hoy.</p>
        </div>
      )}
      {!loading && (
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

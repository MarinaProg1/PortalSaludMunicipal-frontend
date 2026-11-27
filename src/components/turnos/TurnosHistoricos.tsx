import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { BsClockHistory } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { TurnosSkeleton } from './TurnosSkeleton';
import { PageHeader } from '../../constants/PageHeader';
import { TurnoCard } from './TurnoCard';
import { toast } from 'sonner';
import { DEFAULT_PAGE_SIZE, parsePaginatedResponse } from '../../utils/pagination';
import { PaginationControls } from '../common/PaginationControls';
import {
  normalizarTurnoParaCard,
  obtenerIdTurno,
  type TurnoConUrgencia,
} from './turno.utils';

export const TurnosHistoricos = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<TurnoConUrgencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let activo = true;

    const fetchHistoricos = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get('/turnos/pendientes-historicos', {
          params: { page, limit },
        });
        if (!activo) return;
        const resultado = parsePaginatedResponse<TurnoConUrgencia>(
          response.data,
          page,
          limit,
          ['turnos']
        );
        setTurnos(resultado.items);
        setTotal(resultado.total);
      } catch (err) {
        if (!activo) return;
        console.error('Error al cargar turnos históricos:', err);
        toast.error('No se pudo cargar la auditoría de turnos.');
      } finally {
        if (activo) setLoading(false);
      }
    };

    void fetchHistoricos();

    return () => {
      activo = false;
    };
  }, [page, limit]);

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader
        titulo="Turnos Pendientes Históricos"
        subtitulo="Auditoría de turnos pasados que no fueron marcados como atendidos o cancelados."
        icon={<BsClockHistory className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate, '/turnos')}
      />

      {loading ? (
        <TurnosSkeleton />
      ) : turnos.length > 0 ? (
        <div className="row g-3">
          {turnos.map((turno, index) => {
            const turnoId = obtenerIdTurno(turno, `hist-${index}`);
            return (
              <TurnoCard
                key={turnoId}
                turno={normalizarTurnoParaCard({ ...turno, id: turnoId })}
                onView={() => navigate(`/turno-detalle/${turnoId}`)}
                onEdit={() => navigate(`/turnos/editar/${turnoId}`)}
                onCancel={() => {}}
                onDelete={() => {}}
                onMarkAttended={() => {}}
              />
            );
          })}
        </div>
      ) : (
        <div
          className="card border-0 shadow-sm bg-white p-5 text-center"
          style={{ borderRadius: '12px' }}
        >
          <p className="text-muted mb-0">No hay turnos pendientes en el histórico.</p>
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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { BsCalendarDate, BsSearch } from 'react-icons/bs';
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

export const TurnosPorFecha = () => {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [turnos, setTurnos] = useState<TurnoConUrgencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const cargarTurnos = async (pagina: number, limite: number) => {
    setLoading(true);
    try {
      const response = await clientesAxios.get('/turnos', {
        params: { fecha: fechaSeleccionada, page: pagina, limit: limite },
      });
      const resultado = parsePaginatedResponse<TurnoConUrgencia>(
        response.data,
        pagina,
        limite,
        ['turnos']
      );
      setTurnos(resultado.items);
      setTotal(resultado.total);
    } catch (err) {
      console.error('Error al buscar turnos por fecha:', err);
      toast.error('Error al consultar los turnos de la fecha.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaSeleccionada) {
      toast.error('Por favor seleccione una fecha.');
      return;
    }

    setBuscado(true);
    setPage(1);
    await cargarTurnos(1, limit);
  };

  const handlePageChange = (pagina: number) => {
    setPage(pagina);
    void cargarTurnos(pagina, limit);
  };

  const handleLimitChange = (limite: number) => {
    setLimit(limite);
    setPage(1);
    void cargarTurnos(1, limite);
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader
        titulo="Consultar Turnos por Fecha"
        subtitulo="Seleccione un día para ver el detalle de turnos asignados."
        icon={<BsCalendarDate className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate, '/turnos')}
      />

      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <form onSubmit={handleBuscar} className="row g-2 align-items-center">
            <div className="col-12 col-md-8">
              <input
                type="date"
                className="form-control shadow-none"
                value={fechaSeleccionada}
                onChange={(e) => {
                  setFechaSeleccionada(e.target.value);
                  setBuscado(false);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-12 col-md-4">
              <button
                type="submit"
                disabled={loading}
                className="btn text-white w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: '#00ACB2', borderRadius: '6px' }}
              >
                <BsSearch size={16} /> Buscar Turnos
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <TurnosSkeleton />
      ) : buscado ? (
        turnos.length > 0 ? (
          <div className="row g-3">
            {turnos.map((turno, index) => {
              const turnoId = obtenerIdTurno(turno, `fecha-${index}`);
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
            <p className="text-muted mb-0">
              No se encontraron turnos para la fecha {fechaSeleccionada}.
            </p>
          </div>
        )
      ) : null}
      {buscado && !loading && (
        <PaginationControls
          page={page}
          limit={limit}
          total={total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}
    </div>
  );
};
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { BsHeartPulse, BsPlusLg, BsSearch } from 'react-icons/bs';
import toast from 'react-hot-toast';
import clientesAxios from '../../config/axios';
import { ActionButtons } from '../../constants/ActionButtons';
import { PageHeader } from '../../constants/PageHeader';
import { EspecialidadesSkeleton } from './EspecialidadesSkeleton.tsx';
import { DEFAULT_PAGE_SIZE, parsePaginatedResponse } from '../../utils/pagination';
import { PaginationControls } from '../common/PaginationControls';
import { useAuth } from '../../context/AuthContext';

interface Especialidad {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export const EspecialidadLista: React.FC = () => {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const esPaciente = (rol || '').toUpperCase() === 'PACIENTE';

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const cargarEspecialidades = useCallback(async () => {
    try {
      const res = await clientesAxios.get('/especialidades', { params: { page, limit } });
      const resultado = parsePaginatedResponse<Especialidad>(
        res.data,
        page,
        limit,
        ['especialidades']
      );
      setEspecialidades(resultado.items);
      setTotal(resultado.total);
    } catch (err: unknown) {
      console.error(err);
      toast.error('No se pudieron cargar las especialidades');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await clientesAxios.get('/especialidades', { params: { page, limit } });
        if (!activo) return;
        const resultado = parsePaginatedResponse<Especialidad>(
          res.data,
          page,
          limit,
          ['especialidades']
        );
        setEspecialidades(resultado.items);
        setTotal(resultado.total);
      } catch (err: unknown) {
        if (!activo) return;
        console.error(err);
        toast.error('No se pudieron cargar las especialidades');
      } finally {
        if (activo) setLoading(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [page, limit]);

  const handleDelete = async (id: string) => {
    if (esPaciente) return;
    if (!confirm('¿Eliminar esta especialidad? Esta acción no se puede deshacer.')) return;
    try {
      await clientesAxios.delete(`/especialidades/${id}`);
      toast.success('Especialidad eliminada');
      setLoading(true);
      await cargarEspecialidades();
    } catch (err: unknown) {
      console.error(err);
      toast.error('Error al eliminar la especialidad');
      setLoading(false);
    }
  };

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return especialidades;
    return especialidades.filter(
      (esp) =>
        (esp.nombre || '').toLowerCase().includes(q) ||
        (esp.descripcion || '').toLowerCase().includes(q)
    );
  }, [especialidades, busqueda]);

  if (loading) return <EspecialidadesSkeleton />;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Especialidades"
        subtitulo="Listado de especialidades del centro de salud."
        icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
        rightContent={
          !esPaciente ? (
            <button
              type="button"
              className="btn text-white fw-semibold d-flex align-items-center gap-2 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '10px', padding: '8px 16px' }}
              onClick={() => navigate('/especialidades/nuevo')}
            >
              <BsPlusLg size={16} />
              Nueva Especialidad
            </button>
          ) : undefined
        }
      />

      <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <BsSearch size={14} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 shadow-none"
                  placeholder="Buscar por nombre"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    if (page !== 1) setLoading(true);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 text-md-end">
              <span className="text-muted small">
                Mostrando <strong>{filtradas.length}</strong> de <strong>{especialidades.length}</strong> especialidades
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Especialidad</th>
                <th>Descripción</th>
                {!esPaciente && <th>Estado</th>}
                {!esPaciente && <th className="text-end pe-4">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={esPaciente ? 2 : 4} className="text-center text-muted py-5">
                    {busqueda
                      ? 'No se encontraron especialidades con ese criterio.'
                      : 'No hay especialidades registradas.'}
                  </td>
                </tr>
              ) : (
                filtradas.map((esp, idx) => {
                  const espId = esp.id || esp._id || String(idx);
                  const tieneIdReal = Boolean(esp.id || esp._id);
                  const estaActiva = esp.activo !== false;

                  return (
                    <tr key={espId}>
                      <td className="ps-4 fw-semibold text-dark">{esp.nombre}</td>
                      <td className="text-muted small">{esp.descripcion || 'Sin descripción'}</td>
                      {!esPaciente && (
                        <td>
                          <span
                            className={`badge rounded-pill px-2 py-1 ${
                              estaActiva
                                ? 'bg-success-subtle text-success'
                                : 'bg-secondary-subtle text-secondary'
                            }`}
                          >
                            {estaActiva ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                      )}
                      {!esPaciente && (
                        <td className="text-end pe-4">
                          <ActionButtons
                            onView={tieneIdReal ? () => navigate(`/especialidades/${espId}`) : undefined}
                            onEdit={tieneIdReal ? () => navigate(`/especialidades/editar/${espId}`) : undefined}
                            onDelete={tieneIdReal ? () => handleDelete(espId) : undefined}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls
        page={page}
        limit={limit}
        total={total}
        onPageChange={(newPage) => {
          setLoading(true);
          setPage(newPage);
        }}
        onLimitChange={(newLimit) => {
          setLoading(true);
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
};
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { BsJournalMedical, BsSearch } from 'react-icons/bs';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import { ActionButtons } from '../../constants/ActionButtons';
import { PageHeader } from '../../constants/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PAGE_SIZE, parsePaginatedResponse } from '../../utils/pagination';
import { PaginationControls } from '../common/PaginationControls';
import { HistorialMedicoSkeleton } from './HistorialMedicoSkeleton';

interface ItemDescripcion {
  descripcion?: string;
  fechaDeCreacion?: string;
}

interface PacienteRef {
  id?: string;
  _id?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
}

interface HistorialItem {
  id?: string;
  _id?: string;
  paciente?: PacienteRef | string;
  grupoSanguineo?: string;
  alergias?: Array<ItemDescripcion | string>;
  medicacionActual?: Array<ItemDescripcion | string>;
  enfermedadesCronicas?: Array<ItemDescripcion | string>;
  observacionesGenerales?: string;
  updatedAt?: string;
  createdAt?: string;
}

const getId = (h: HistorialItem): string => String(h.id || h._id || '');

const nombrePaciente = (p: HistorialItem['paciente']): string => {
  if (!p || typeof p !== 'object') return 'Paciente';
  const nombre = `${p.apellido || ''} ${p.nombre || ''}`.trim();
  return nombre || 'Paciente';
};

const dniPaciente = (p: HistorialItem['paciente']): string => {
  if (!p || typeof p !== 'object') return '-';
  return p.dni || '-';
};

const descripcionesOrdenadas = (items?: Array<ItemDescripcion | string>): string[] => {
  if (!Array.isArray(items)) return [];
  const conOrden = items.map((item, idx) => {
    if (typeof item === 'string') {
      return { desc: item.trim(), ts: 0, idx };
    }
    const tsRaw = item?.fechaDeCreacion ? new Date(item.fechaDeCreacion).getTime() : 0;
    return {
      desc: String(item?.descripcion || '').trim(),
      ts: Number.isNaN(tsRaw) ? 0 : tsRaw,
      idx,
    };
  });

  return conOrden
    .filter((entry) => Boolean(entry.desc))
    .sort((a, b) => {
      if (a.ts !== b.ts) return b.ts - a.ts;
      return a.idx - b.idx;
    })
    .map((entry) => entry.desc);
};

const resumen = (items?: Array<ItemDescripcion | string>): string => {
  const vals = descripcionesOrdenadas(items);
  if (vals.length === 0) return 'Sin datos';
  if (vals.length <= 2) return vals.join(', ');
  return `${vals.slice(0, 2).join(', ')} +${vals.length - 2}`;
};

const formatFecha = (fecha?: string): string => {
  if (!fecha) return '-';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-AR');
};

export const HistorialMedicoLista: React.FC = () => {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const rolActual = (rol || '').toUpperCase();
  const esMedico = rolActual === 'MEDICO';
  const esPaciente = rolActual === 'PACIENTE';
  const puedeAdministrar = ['ADMIN', 'RECEPCIONISTA', 'MEDICO'].includes(rolActual);

  const [historiales, setHistoriales] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await clientesAxios.get('/historiales', { params: { page, limit } });
        if (!mounted) return;
        const resultado = parsePaginatedResponse<HistorialItem>(
          res.data,
          page,
          limit,
          ['historiales', 'historial']
        );
        setHistoriales(resultado.items);
        setTotal(resultado.total);
      } catch (error) {
        console.error(error);
        if (mounted) {
          const mensaje = isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message || 'No se pudo cargar el historial médico.'
            : 'No se pudo cargar el historial médico.';
          toast.error(mensaje);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este historial clínico? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await clientesAxios.delete(`/historiales/${id}`);
      setHistoriales((prev) => prev.filter((historial) => getId(historial) !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success('Historial clínico eliminado correctamente.');

      if (historiales.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      }
    } catch (error: unknown) {
      console.error('Error al eliminar el historial clínico:', error);
      const mensaje = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || 'No se pudo eliminar el historial clínico.'
        : 'No se pudo eliminar el historial clínico.';
      toast.error(mensaje);
    }
  };

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const listaBase = [...historiales].sort((a, b) => {
      const fechaA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const fechaB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return (Number.isNaN(fechaB) ? 0 : fechaB) - (Number.isNaN(fechaA) ? 0 : fechaA);
    });

    if (!termino) return listaBase;
    return listaBase.filter((h) => {
      const paciente = nombrePaciente(h.paciente).toLowerCase();
      const dni = dniPaciente(h.paciente).toLowerCase();
      const grupo = (h.grupoSanguineo || '').toLowerCase();
      const alergias = descripcionesOrdenadas(h.alergias).join(' ').toLowerCase();
      const cronicas = descripcionesOrdenadas(h.enfermedadesCronicas).join(' ').toLowerCase();
      const medicacion = descripcionesOrdenadas(h.medicacionActual).join(' ').toLowerCase();
      return [paciente, dni, grupo, alergias, cronicas, medicacion].some((v) =>
        v.includes(termino)
      );
    });
  }, [historiales, busqueda]);

  const tituloPagina = esPaciente
    ? 'Mi historial médico'
    : esMedico
      ? 'Historial de mis pacientes'
      : 'Historial médico';

  const subtituloPagina = esPaciente
    ? 'Consulta de tu ficha clínica, alergias, medicación y antecedentes.'
    : esMedico
      ? 'Historiales clínicos de pacientes atendidos por el profesional.'
      : 'Control y administración del historial clínico.';

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={tituloPagina}
        subtitulo={subtituloPagina}
        icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
      />

      {!esPaciente && (
        <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted">
                <BsSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0 shadow-none ps-0"
                placeholder="Buscar por paciente, DNI, grupo sanguíneo, alergia o medicación..."
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
      )}

      {loading ? (
        <HistorialMedicoSkeleton />
      ) : filtrados.length === 0 ? (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">
            {busqueda.trim()
              ? 'No se encontraron historiales para esa búsqueda.'
              : esPaciente
                ? 'Aún no tenés un historial clínico registrado.'
                : 'No hay historiales clínicos registrados.'}
          </p>
        </div>
      ) : (
        <>
          <div
            className="d-none d-lg-block card border-0 shadow-sm bg-white overflow-hidden"
            style={{ borderRadius: '12px' }}
          >
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase small text-secondary border-bottom">
                <tr>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3">DNI</th>
                  <th className="py-3">Grupo</th>
                  <th className="py-3">Alergias</th>
                  <th className="py-3">Enf. crónicas</th>
                  <th className="py-3">Medicación</th>
                  <th className="py-3">Actualizado</th>
                  <th className="py-3 text-end px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((h, index) => {
                  const id = getId(h);
                  return (
                    <tr key={id || `hist-${index}`}>
                      <td className="px-4 fw-semibold">{nombrePaciente(h.paciente)}</td>
                      <td>{dniPaciente(h.paciente)}</td>
                      <td>{h.grupoSanguineo || '-'}</td>
                      <td className="text-truncate" style={{ maxWidth: 180 }}>
                        {resumen(h.alergias)}
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 180 }}>
                        {resumen(h.enfermedadesCronicas)}
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 180 }}>
                        {resumen(h.medicacionActual)}
                      </td>
                      <td>{formatFecha(h.updatedAt || h.createdAt)}</td>
                      <td className="text-end px-4">
                        <ActionButtons
                          onView={id ? () => navigate(`/historial-medico/${id}`) : undefined}
                          onEdit={
                            puedeAdministrar && id
                              ? () => navigate(`/historial-medico/editar/${id}`)
                              : undefined
                          }
                          onDelete={
                            puedeAdministrar && id ? () => void handleDelete(id) : undefined
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-block d-lg-none">
            <div className="row g-3">
              {filtrados.map((h, index) => {
                const id = getId(h);
                return (
                  <div className="col-12" key={id || `hist-m-${index}`}>
                    <div
                      className="card border-0 shadow-sm p-3 bg-white"
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <div>
                          <small className="text-muted d-block">Paciente</small>
                          <h6 className="fw-bold mb-0">{nombrePaciente(h.paciente)}</h6>
                          <small className="text-muted">DNI {dniPaciente(h.paciente)}</small>
                        </div>
                        <span className="badge bg-light text-dark border">
                          {h.grupoSanguineo || '-'}
                        </span>
                      </div>
                      <div className="small mb-2">
                        <div>
                          <span className="text-muted">Alergias:</span> {resumen(h.alergias)}
                        </div>
                        <div>
                          <span className="text-muted">Enf. crónicas:</span>{' '}
                          {resumen(h.enfermedadesCronicas)}
                        </div>
                        <div>
                          <span className="text-muted">Medicación:</span>{' '}
                          {resumen(h.medicacionActual)}
                        </div>
                        <div>
                          <span className="text-muted">Actualizado:</span>{' '}
                          {formatFecha(h.updatedAt || h.createdAt)}
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <ActionButtons
                          onView={id ? () => navigate(`/historial-medico/${id}`) : undefined}
                          onEdit={
                            puedeAdministrar && id
                              ? () => navigate(`/historial-medico/editar/${id}`)
                              : undefined
                          }
                          onDelete={
                            puedeAdministrar && id ? () => void handleDelete(id) : undefined
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      {!loading && !esPaciente && (
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

export default HistorialMedicoLista;

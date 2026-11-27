import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import {
  BsJournalMedical,
  BsSearch,
} from 'react-icons/bs';
import { isAxiosError } from 'axios';
import clientesAxios from '../../config/axios';
import { ActionButtons } from '../../constants/ActionButtons';
import { PageHeader } from '../../constants/PageHeader';
import { DEFAULT_PAGE_SIZE, parsePaginatedResponse } from '../../utils/pagination';
import { PaginationControls } from '../common/PaginationControls';
import { useAuth } from '../../context/AuthContext';
import { estadoTurnoClase, formatearFecha } from '../pacientePortal/pacientePortal.schema';

export interface ConsultaMedicaItem {
  id?: string;
  _id?: string;
  fecha?: string;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  estado?: string;
  paciente?:
    | string
    | {
        _id?: string;
        id?: string;
        nombre?: string;
        apellido?: string;
        dni?: string;
        email?: string;
      };
  medico?:
    | string
    | {
        _id?: string;
        id?: string;
        nombre?: string;
        apellido?: string;
        numeroMatricula?: string;
      };
  turno?:
    | string
    | {
        _id?: string;
        id?: string;
        fecha?: string;
        hora?: string;
      };
}

const getConsultaId = (consulta: ConsultaMedicaItem, index = 0): string =>
  String(consulta.id || consulta._id || `consulta-${index}`);

const formatearNombrePaciente = (paciente: ConsultaMedicaItem['paciente']): string => {
  if (!paciente) return 'Paciente';
  if (typeof paciente === 'string') return paciente;
  const apellido = paciente.apellido || '';
  const nombre = paciente.nombre || '';
  return `${apellido}${apellido && nombre ? ', ' : ''}${nombre}`.trim() || 'Paciente';
};

const formatearNombreMedico = (medico: ConsultaMedicaItem['medico']): string => {
  if (!medico) return '-';
  if (typeof medico === 'string') return '-';
  const nombre = medico.nombre || '';
  const apellido = medico.apellido || '';
  const full = `${nombre} ${apellido}`.trim();
  return full ? `Dr./Dra. ${full}` : '-';
};

const obtenerDniPaciente = (paciente: ConsultaMedicaItem['paciente']): string => {
  if (!paciente || typeof paciente === 'string') return '-';
  return paciente.dni || '-';
};

export const ConsultasMedicasLista = () => {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const rolActual = (rol || '').toUpperCase();
  const esMedico = rolActual === 'MEDICO';
  const puedeAdministrar = ['ADMIN', 'MEDICO'].includes(rolActual);

  const [consultas, setConsultas] = useState<ConsultaMedicaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const fetchConsultas = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get('/consultasmedicas', {
          params: { page, limit },
        });

        if (!isMounted) return;

        const resultado = parsePaginatedResponse<ConsultaMedicaItem>(
          response.data,
          page,
          limit,
          ['consultas', 'consultasMedicas', 'consultasmedicas']
        );
        setConsultas(resultado.items);
        setTotal(resultado.total);
        setError(null);
      } catch (err) {
        console.error('Error al cargar consultas médicas:', err);
        if (isMounted) {
          setError('No se pudo conectar con el servidor para cargar las consultas médicas.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchConsultas();

    return () => {
      isMounted = false;
    };
  }, [page, limit]);

  const handleEliminarConsulta = async (consultaId: string) => {
    const confirmado = window.confirm(
      '¿Eliminar esta consulta médica? Esta acción no se puede deshacer.'
    );
    if (!confirmado) return;

    try {
      await clientesAxios.delete(`/consultasmedicas/${consultaId}`);
      setConsultas((prev) => prev.filter((item, idx) => getConsultaId(item, idx) !== consultaId));
      setTotal((prev) => Math.max(0, prev - 1));

      window.alert('Consulta médica eliminada correctamente.');
    } catch (err: unknown) {
      console.error('Error al eliminar consulta médica:', err);
      const mensaje = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'No se pudo eliminar la consulta.'
        : 'No se pudo eliminar la consulta.';
      window.alert(mensaje);
    }
  };

  const filtradas = Array.isArray(consultas)
    ? consultas.filter((item) => {
        const termino = busqueda.trim().toLowerCase();
        if (!termino) return true;

        const pacienteStr = formatearNombrePaciente(item.paciente).toLowerCase();
        const dniStr = obtenerDniPaciente(item.paciente).toLowerCase();
        const medicoStr = formatearNombreMedico(item.medico).toLowerCase();
        const motivoStr = String(item.motivo || '').toLowerCase();
        const diagnosticoStr = String(item.diagnostico || '').toLowerCase();

        return (
          pacienteStr.includes(termino) ||
          dniStr.includes(termino) ||
          medicoStr.includes(termino) ||
          motivoStr.includes(termino) ||
          diagnosticoStr.includes(termino)
        );
      })
    : [];

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={esMedico ? 'Mis Consultas Médicas' : 'Consultas Médicas'}
        subtitulo={
          esMedico
            ? 'Registro de atenciones y evoluciones clínicas realizadas.'
            : 'Administración de consultas médicas del sistema.'
        }
        icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
      />

      {/* Buscador */}
      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted">
              <BsSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none ps-0"
              placeholder="Buscar por paciente, DNI, médico, motivo o diagnóstico..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                if (page !== 1) setLoading(true);
                setPage(1);
              }}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-5 text-muted">Cargando...</div>
      ) : error ? (
        <div
          className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center"
          style={{ borderRadius: '12px' }}
        >
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : filtradas.length > 0 ? (
        <div className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase fs-7 text-secondary border-bottom">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3">Paciente</th>
                  <th className="py-3">DNI</th>
                  {!esMedico && <th className="py-3">Médico</th>}
                  <th className="py-3">Motivo</th>
                  <th className="py-3">Diagnóstico</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3 text-end px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((consulta, index) => {
                  const consultaId = getConsultaId(consulta, index);

                  return (
                    <tr key={consultaId}>
                      <td className="px-4 text-muted">
                        {formatearFecha(consulta.fecha || '')}
                      </td>
                      <td className="fw-semibold text-dark">
                        {formatearNombrePaciente(consulta.paciente)}
                      </td>
                      <td className="text-muted">
                        {obtenerDniPaciente(consulta.paciente)}
                      </td>
                      {!esMedico && (
                        <td className="text-muted">
                          {formatearNombreMedico(consulta.medico)}
                        </td>
                      )}
                      <td className="text-muted text-truncate" style={{ maxWidth: 180 }}>
                        {consulta.motivo || '-'}
                      </td>
                      <td className="text-muted text-truncate" style={{ maxWidth: 180 }}>
                        {consulta.diagnostico || '-'}
                      </td>
                      <td>
                        {consulta.estado ? (
                          <span
                            className={`badge px-2 py-1 text-uppercase ${estadoTurnoClase(consulta.estado)}`}
                          >
                            {consulta.estado}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-end px-4">
                        <ActionButtons
                          onView={() => navigate(`/consultas-medicas/${consultaId}`)}
                          onEdit={
                            puedeAdministrar
                              ? () => navigate(`/consultas-medicas/editar/${consultaId}`)
                              : undefined
                          }
                          onDelete={
                            puedeAdministrar
                              ? () => void handleEliminarConsulta(consultaId)
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">No se encontraron consultas médicas registradas.</p>
        </div>
      )}

      {!loading && !error && (
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
      )}
    </div>
  );
};
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsJournalMedical, BsSearch, BsEye } from 'react-icons/bs';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { useAuth } from '../../context/AuthContext';

interface ItemDescripcion {
  descripcion?: string;
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

const getId = (h: HistorialItem): string => h.id || h._id || '';

const nombrePaciente = (p: HistorialItem['paciente']): string => {
  if (!p || typeof p !== 'object') return 'Paciente';
  const nombre = `${p.apellido || ''} ${p.nombre || ''}`.trim();
  return nombre || 'Paciente';
};

const dniPaciente = (p: HistorialItem['paciente']): string => {
  if (!p || typeof p !== 'object') return '-';
  return p.dni || '-';
};

const descripciones = (items?: Array<ItemDescripcion | string>): string[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => (typeof item === 'string' ? item : item?.descripcion || ''))
    .map((s) => s.trim())
    .filter(Boolean);
};

const resumen = (items?: Array<ItemDescripcion | string>): string => {
  const vals = descripciones(items);
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

const extractArray = (responseData: unknown): HistorialItem[] => {
  if (Array.isArray(responseData)) return responseData as HistorialItem[];
  if (responseData && typeof responseData === 'object') {
    const obj = responseData as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as HistorialItem[];
    if (Array.isArray(obj.historiales)) return obj.historiales as HistorialItem[];
    if (Array.isArray(obj.historial)) return obj.historial as HistorialItem[];
  }
  return [];
};

export const HistorialMedicoLista: React.FC = () => {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const esMedico = (rol || '').toUpperCase() === 'MEDICO';

  const [historiales, setHistoriales] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await clientesAxios.get('/historiales');
        if (!mounted) return;
        setHistoriales(extractArray(res.data));
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
  }, []);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return historiales;
    return historiales.filter((h) => {
      const paciente = nombrePaciente(h.paciente).toLowerCase();
      const dni = dniPaciente(h.paciente).toLowerCase();
      const grupo = (h.grupoSanguineo || '').toLowerCase();
      const alergias = descripciones(h.alergias).join(' ').toLowerCase();
      const cronicas = descripciones(h.enfermedadesCronicas).join(' ').toLowerCase();
      const medicacion = descripciones(h.medicacionActual).join(' ').toLowerCase();
      return [paciente, dni, grupo, alergias, cronicas, medicacion].some((v) => v.includes(termino));
    });
  }, [historiales, busqueda]);

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={esMedico ? 'Historial de mis pacientes' : 'Historial médico'}
        subtitulo={
          esMedico
            ? 'Historiales clínicos de pacientes atendidos por el profesional.'
            : 'Control y administración del historial clínico.'
        }
        icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
      />

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
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Cargando historiales...</div>
      ) : filtrados.length === 0 ? (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">
            {busqueda.trim() ? 'No se encontraron historiales para esa búsqueda.' : 'No hay historiales clínicos registrados.'}
          </p>
        </div>
      ) : (
        <>
          <div className="d-none d-lg-block card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
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
                  <th className="py-3 text-end px-4">Acción</th>
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
                      <td className="text-truncate" style={{ maxWidth: 180 }}>{resumen(h.alergias)}</td>
                      <td className="text-truncate" style={{ maxWidth: 180 }}>{resumen(h.enfermedadesCronicas)}</td>
                      <td className="text-truncate" style={{ maxWidth: 180 }}>{resumen(h.medicacionActual)}</td>
                      <td>{formatFecha(h.updatedAt || h.createdAt)}</td>
                      <td className="text-end px-4">
                        <button
                          type="button"
                          className="btn btn-sm text-white fw-semibold d-inline-flex align-items-center gap-1"
                          style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                          onClick={() => id && navigate(`/historial-medico/${id}`)}
                          disabled={!id}
                        >
                          <BsEye /> Ver
                        </button>
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
                    <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <div>
                          <small className="text-muted d-block">Paciente</small>
                          <h6 className="fw-bold mb-0">{nombrePaciente(h.paciente)}</h6>
                          <small className="text-muted">DNI {dniPaciente(h.paciente)}</small>
                        </div>
                        <span className="badge bg-light text-dark border">{h.grupoSanguineo || '-'}</span>
                      </div>
                      <div className="small mb-2">
                        <div><span className="text-muted">Alergias:</span> {resumen(h.alergias)}</div>
                        <div><span className="text-muted">Enf. crónicas:</span> {resumen(h.enfermedadesCronicas)}</div>
                        <div><span className="text-muted">Medicación:</span> {resumen(h.medicacionActual)}</div>
                        <div><span className="text-muted">Actualizado:</span> {formatFecha(h.updatedAt || h.createdAt)}</div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm text-white fw-semibold"
                        style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                        onClick={() => id && navigate(`/historial-medico/${id}`)}
                        disabled={!id}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistorialMedicoLista;

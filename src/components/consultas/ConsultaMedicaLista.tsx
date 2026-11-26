import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsJournalMedical, BsSearch } from 'react-icons/bs';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { PageHeader } from '../../constants/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { atencionService } from '../../services/atencion.service';
import type { ConsultaMedica } from '../medico/atencion.schema';

const getId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as { id?: string; _id?: string };
    return obj.id || obj._id || '';
  }
  return '';
};

const nombrePersona = (value: unknown): string => {
  if (!value || typeof value !== 'object') return '-';
  const obj = value as { nombre?: string; apellido?: string };
  const nombre = `${obj.apellido || ''} ${obj.nombre || ''}`.trim();
  return nombre || '-';
};

const dniPaciente = (value: unknown): string => {
  if (!value || typeof value !== 'object') return '-';
  const obj = value as { dni?: string };
  return obj.dni || '-';
};

const formatFecha = (fecha?: string): string => {
  if (!fecha) return '-';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

export const ConsultaMedicaLista: React.FC = () => {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const esMedico = (rol || '').toUpperCase() === 'MEDICO';

  const [consultas, setConsultas] = useState<ConsultaMedica[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await atencionService.consultas({});
        if (mounted) setConsultas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        if (mounted) {
          const mensaje = isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message || 'No se pudieron cargar las consultas médicas.'
            : 'No se pudieron cargar las consultas médicas.';
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

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return consultas;
    return consultas.filter((c) => {
      const paciente = nombrePersona(c.paciente).toLowerCase();
      const dni = dniPaciente(c.paciente).toLowerCase();
      const motivo = (c.motivo || '').toLowerCase();
      const diagnostico = (c.diagnostico || '').toLowerCase();
      const tratamiento = (c.tratamiento || '').toLowerCase();
      return [paciente, dni, motivo, diagnostico, tratamiento].some((v) => v.includes(termino));
    });
  }, [consultas, busqueda]);

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={esMedico ? 'Mis consultas médicas' : 'Consultas médicas'}
        subtitulo={
          esMedico
            ? 'Consultas realizadas por el profesional autenticado.'
            : 'Listado de consultas médicas registradas.'
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
              placeholder="Buscar por paciente, DNI, motivo, diagnóstico o tratamiento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Cargando consultas...</div>
      ) : filtradas.length === 0 ? (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">
            {busqueda.trim() ? 'No se encontraron consultas para esa búsqueda.' : 'No hay consultas médicas registradas.'}
          </p>
        </div>
      ) : (
        <>
          <div className="d-none d-lg-block card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: 980 }}>
              <thead className="table-light text-uppercase small text-secondary border-bottom">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3">Paciente</th>
                  <th className="py-3">DNI</th>
                  <th className="py-3">Motivo</th>
                  <th className="py-3">Diagnóstico</th>
                  <th className="py-3">Tratamiento</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3 text-end px-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((c, index) => {
                  const turnoId = getId(c.turno);
                  return (
                    <tr key={getId(c) || `consulta-${index}`}>
                      <td className="px-4">{formatFecha(c.fecha)}</td>
                      <td className="fw-semibold">{nombrePersona(c.paciente)}</td>
                      <td>{dniPaciente(c.paciente)}</td>
                      <td className="text-truncate" style={{ maxWidth: 180 }}>{c.motivo || '-'}</td>
                      <td className="text-truncate" style={{ maxWidth: 180 }}>{c.diagnostico || '-'}</td>
                      <td className="text-truncate" style={{ maxWidth: 180 }}>{c.tratamiento || '-'}</td>
                      <td>
                        <span className="badge bg-light text-dark border text-uppercase">{c.estado || '-'}</span>
                      </td>
                      <td className="text-end px-4">
                        {turnoId ? (
                          <button
                            type="button"
                            className="btn btn-sm text-white fw-semibold"
                            style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                            onClick={() => navigate(esMedico ? `/atencion/${turnoId}` : `/turno-detalle/${turnoId}`)}
                          >
                            Ver turno
                          </button>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          <div className="d-block d-lg-none">
            <div className="row g-3">
              {filtradas.map((c, index) => {
                const turnoId = getId(c.turno);
                return (
                  <div className="col-12" key={getId(c) || `consulta-m-${index}`}>
                    <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <div>
                          <small className="text-muted d-block">Paciente</small>
                          <h6 className="fw-bold mb-0">{nombrePersona(c.paciente)}</h6>
                          <small className="text-muted">DNI {dniPaciente(c.paciente)}</small>
                        </div>
                        <span className="badge bg-light text-dark border text-uppercase">{c.estado || '-'}</span>
                      </div>
                      <div className="small mb-2">
                        <div><span className="text-muted">Fecha:</span> {formatFecha(c.fecha)}</div>
                        <div><span className="text-muted">Motivo:</span> {c.motivo || '-'}</div>
                        <div><span className="text-muted">Diagnóstico:</span> {c.diagnostico || '-'}</div>
                        <div><span className="text-muted">Tratamiento:</span> {c.tratamiento || '-'}</div>
                      </div>
                      {turnoId && (
                        <button
                          type="button"
                          className="btn btn-sm text-white fw-semibold"
                          style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                          onClick={() => navigate(esMedico ? `/atencion/${turnoId}` : `/turno-detalle/${turnoId}`)}
                        >
                          Ver turno
                        </button>
                      )}
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

export default ConsultaMedicaLista;

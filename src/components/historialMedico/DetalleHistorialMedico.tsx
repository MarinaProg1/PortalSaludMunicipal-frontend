import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { BsArrowLeft, BsJournalMedical, BsPerson } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';

interface ItemDescripcion { descripcion?: string; fechaDeCreacion?: string }
interface PacienteRef { nombre?: string; apellido?: string; dni?: string; email?: string; telefono?: { codigoArea?: string; numero?: string } }
interface HistorialDetalle {
  id?: string; _id?: string;
  paciente?: PacienteRef | string;
  grupoSanguineo?: string;
  alergias?: Array<ItemDescripcion | string>;
  medicacionActual?: Array<ItemDescripcion | string>;
  enfermedadesCronicas?: Array<ItemDescripcion | string>;
  antecedentesFamiliares?: string;
  antecedentesQuirurgicos?: string;
  habitos?: { tabaquismo?: boolean; alcoholismo?: boolean; drogas?: boolean };
  observacionesGenerales?: string;
  updatedAt?: string;
}

const descripciones = (items?: Array<ItemDescripcion | string>): string[] =>
  (Array.isArray(items) ? items : [])
    .map((i) => (typeof i === 'string' ? i : i?.descripcion || ''))
    .map((s) => s.trim())
    .filter(Boolean);

const Lista: React.FC<{ titulo: string; items: string[] }> = ({ titulo, items }) => (
  <div className="mb-3">
    <div className="text-muted small fw-semibold mb-1">{titulo}</div>
    {items.length ? (
      <div className="d-flex flex-wrap gap-1">
        {items.map((it, i) => (
          <span key={`${titulo}-${i}`} className="badge bg-light text-dark border fw-normal text-wrap text-start">{it}</span>
        ))}
      </div>
    ) : (
      <span className="small text-muted">Sin datos</span>
    )}
  </div>
);

export const DetalleHistorialMedico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState<HistorialDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setError('ID de historial no válido.'); setLoading(false); return; }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await clientesAxios.get(`/historiales/${id}`);
        const data = res.data?.data ?? res.data?.historial ?? res.data;
        if (mounted) setHistorial(data as HistorialDetalle);
      } catch (err) {
        if (mounted) {
          setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || 'No se pudo cargar el historial.' : 'No se pudo cargar el historial.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="container-fluid py-4 text-muted">Cargando historial...</div>;

  if (error || !historial) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div className="alert alert-danger">{error || 'Historial no encontrado.'}</div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}><BsArrowLeft /> Volver</button>
      </div>
    );
  }

  const p = typeof historial.paciente === 'object' ? historial.paciente : null;
  const nombre = p ? `${p.apellido || ''} ${p.nombre || ''}`.trim() : 'Paciente';
  const tel = p?.telefono ? `${p.telefono.codigoArea || ''} ${p.telefono.numero || ''}`.trim() : '';

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Detalle de historial clínico"
        subtitulo={nombre}
        icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><BsPerson style={{ color: '#00ACB2' }} /> Paciente</h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Nombre</dt><dd className="col-7">{nombre || '-'}</dd>
                <dt className="col-5 text-muted">DNI</dt><dd className="col-7">{p?.dni || '-'}</dd>
                <dt className="col-5 text-muted">Email</dt><dd className="col-7">{p?.email || '-'}</dd>
                <dt className="col-5 text-muted">Teléfono</dt><dd className="col-7">{tel || '-'}</dd>
                <dt className="col-5 text-muted">Grupo sanguíneo</dt><dd className="col-7">{historial.grupoSanguineo || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Información clínica</h6>
              <Lista titulo="Alergias" items={descripciones(historial.alergias)} />
              <Lista titulo="Enfermedades crónicas" items={descripciones(historial.enfermedadesCronicas)} />
              <Lista titulo="Medicación actual" items={descripciones(historial.medicacionActual)} />
              <div className="mb-3"><div className="text-muted small fw-semibold">Antecedentes familiares</div><div className="small">{historial.antecedentesFamiliares || 'Sin datos'}</div></div>
              <div className="mb-3"><div className="text-muted small fw-semibold">Antecedentes quirúrgicos</div><div className="small">{historial.antecedentesQuirurgicos || 'Sin datos'}</div></div>
              <div className="mb-3"><div className="text-muted small fw-semibold">Hábitos</div><div className="small">{[
                historial.habitos?.tabaquismo ? 'Tabaquismo' : null,
                historial.habitos?.alcoholismo ? 'Alcoholismo' : null,
                historial.habitos?.drogas ? 'Drogas' : null,
              ].filter(Boolean).join(', ') || 'Sin datos'}</div></div>
              {historial.observacionesGenerales && (
                <div className="p-2 rounded-3 bg-light small text-muted">{historial.observacionesGenerales}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleHistorialMedico;

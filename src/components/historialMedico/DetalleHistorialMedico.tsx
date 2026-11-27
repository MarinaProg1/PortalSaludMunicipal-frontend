import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { isAxiosError } from 'axios';
import { BsArrowLeft, BsJournalMedical, BsPerson } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { DetalleHistorialMedicoSkeleton } from './DetalleHistorialMedicoSkeleton';

interface ItemDescripcion {
  descripcion?: string;
  fechaDeCreacion?: string;
}

interface PacienteRef {
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  telefono?: { codigoArea?: string; numero?: string };
}

interface HistorialDetalle {
  id?: string;
  _id?: string;
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

const Lista: React.FC<{ titulo: string; items: string[] }> = ({ titulo, items }) => (
  <div className="mb-3">
    <div className="text-muted small fw-semibold mb-1">{titulo}</div>
    {items.length ? (
      <div className="d-flex flex-wrap gap-1">
        {items.map((it, i) => (
          <span
            key={`${titulo}-${i}`}
            className="badge bg-light text-dark border fw-normal text-wrap text-start"
          >
            {it}
          </span>
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
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await clientesAxios.get(`/historiales/${id}`);
        const data = res.data?.data ?? res.data?.historial ?? res.data;
        if (mounted) setHistorial(data as HistorialDetalle);
      } catch (err) {
        if (mounted) {
          setError(
            isAxiosError<{ message?: string }>(err)
              ? err.response?.data?.message || 'No se pudo cargar el historial.'
              : 'No se pudo cargar el historial.'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!id) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div className="alert alert-danger">ID de historial no válido.</div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => goBackSafe(navigate)}
        >
          <BsArrowLeft /> Volver
        </button>
      </div>
    );
  }

  if (loading) return <DetalleHistorialMedicoSkeleton />;

  if (error || !historial) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <div className="alert alert-danger">{error || 'Historial no encontrado.'}</div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => goBackSafe(navigate)}
        >
          <BsArrowLeft /> Volver
        </button>
      </div>
    );
  }

  const p = typeof historial.paciente === 'object' ? historial.paciente : null;
  const nombre = p ? `${p.apellido || ''} ${p.nombre || ''}`.trim() : 'Paciente';
  const tel = p?.telefono
    ? `${p.telefono.codigoArea || ''} ${p.telefono.numero || ''}`.trim()
    : '';

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Detalle de historial clínico"
        subtitulo={nombre}
        icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <BsPerson style={{ color: '#00ACB2' }} /> Paciente
              </h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Nombre</dt>
                <dd className="col-7">{nombre || '-'}</dd>
                <dt className="col-5 text-muted">DNI</dt>
                <dd className="col-7">{p?.dni || '-'}</dd>
                <dt className="col-5 text-muted">Email</dt>
                <dd className="col-7">{p?.email || '-'}</dd>
                <dt className="col-5 text-muted">Teléfono</dt>
                <dd className="col-7">{tel || '-'}</dd>
                <dt className="col-5 text-muted">Grupo sanguíneo</dt>
                <dd className="col-7">{historial.grupoSanguineo || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Información clínica</h6>
              <Lista titulo="Alergias" items={descripcionesOrdenadas(historial.alergias)} />
              <Lista
                titulo="Enfermedades crónicas"
                items={descripcionesOrdenadas(historial.enfermedadesCronicas)}
              />
              <Lista
                titulo="Medicación actual"
                items={descripcionesOrdenadas(historial.medicacionActual)}
              />
              <div className="mb-3">
                <div className="text-muted small fw-semibold">Antecedentes familiares</div>
                <div className="small">{historial.antecedentesFamiliares || 'Sin datos'}</div>
              </div>
              <div className="mb-3">
                <div className="text-muted small fw-semibold">Antecedentes quirúrgicos</div>
                <div className="small">{historial.antecedentesQuirurgicos || 'Sin datos'}</div>
              </div>
              <div className="mb-3">
                <div className="text-muted small fw-semibold">Hábitos</div>
                <div className="small">
                  {[
                    historial.habitos?.tabaquismo ? 'Tabaquismo' : null,
                    historial.habitos?.alcoholismo ? 'Alcoholismo' : null,
                    historial.habitos?.drogas ? 'Drogas' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Sin datos'}
                </div>
              </div>
              {historial.observacionesGenerales && (
                <div className="p-2 rounded-3 bg-light small text-muted">
                  {historial.observacionesGenerales}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleHistorialMedico;
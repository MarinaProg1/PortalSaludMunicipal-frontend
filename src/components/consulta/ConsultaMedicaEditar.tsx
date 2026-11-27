import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { BsJournalMedical, BsSave } from 'react-icons/bs';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { estadoTurnoClase, formatearFecha } from '../pacientePortal/pacientePortal.schema';
import type { ConsultaMedicaItem } from './ConsultasMedicasLista';

interface EditarConsultaForm {
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  estado: string;
}

const normalizarFechaInput = (fecha?: string): string => {
  if (!fecha) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    return fecha.slice(0, 10);
  }
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
};

const extraerConsulta = (payload: unknown): ConsultaMedicaItem | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  if (record.data && typeof record.data === 'object') {
    return record.data as ConsultaMedicaItem;
  }
  return record as ConsultaMedicaItem;
};

export const ConsultaMedicaEditar = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [consultaOriginal, setConsultaOriginal] = useState<ConsultaMedicaItem | null>(null);
  const [form, setForm] = useState<EditarConsultaForm>({
    fecha: normalizarFechaInput(),
    motivo: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    estado: 'ATENDIDA',
  });

  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchConsulta = async () => {
      try {
        setLoading(true);
        const response = await clientesAxios.get(`/consultasmedicas/${id}`);
        if (!isMounted) return;

        const data = extraerConsulta(response.data);
        if (!data) {
          setError('No se encontró la consulta médica solicitada.');
          return;
        }

        setConsultaOriginal(data);
        setForm({
          fecha: normalizarFechaInput(data.fecha),
          motivo: data.motivo || '',
          diagnostico: data.diagnostico || '',
          tratamiento: data.tratamiento || '',
          observaciones: data.observaciones || '',
          estado: data.estado || 'ATENDIDA',
        });
        setError(null);
      } catch (err) {
        console.error('Error al cargar consulta médica para editar:', err);
        if (isMounted) {
          const msg = isAxiosError<{ message?: string }>(err)
            ? err.response?.data?.message || 'No se pudo cargar la consulta médica.'
            : 'No se pudo cargar la consulta médica.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchConsulta();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (campo: keyof EditarConsultaForm, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      const payload = {
        fecha: form.fecha,
        motivo: form.motivo.trim(),
        diagnostico: form.diagnostico.trim(),
        tratamiento: form.tratamiento.trim(),
        observaciones: form.observaciones.trim(),
        estado: form.estado,
      };

      const response = await clientesAxios.put(`/consultasmedicas/${id}`, payload);
      toast.success(response.data?.message || 'Consulta médica actualizada correctamente.');
      navigate(`/consultas-medicas/${id}`);
    } catch (err: unknown) {
      console.error('Error al actualizar consulta médica:', err);
      const mensaje = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'No se pudo actualizar la consulta médica.'
        : 'No se pudo actualizar la consulta médica.';
      toast.error(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '850px' }}>
        <PageHeader
          titulo="Editar Consulta Médica"
          subtitulo="Identificador de consulta no válido."
          icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => goBackSafe(navigate)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid py-4 text-muted">
        Cargando datos de la consulta...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '850px' }}>
        <PageHeader
          titulo="Editar Consulta Médica"
          subtitulo={error}
          icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => goBackSafe(navigate)}
        />
      </div>
    );
  }

  const pacienteObj =
    consultaOriginal?.paciente && typeof consultaOriginal.paciente === 'object'
      ? consultaOriginal.paciente
      : null;

  const nombrePaciente = pacienteObj
    ? `${pacienteObj.apellido || ''}${pacienteObj.apellido && pacienteObj.nombre ? ', ' : ''}${pacienteObj.nombre || ''}`
    : typeof consultaOriginal?.paciente === 'string'
      ? consultaOriginal.paciente
      : 'Paciente';

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '850px' }}>
      <PageHeader
        titulo="Editar Consulta Médica"
        subtitulo={`${nombrePaciente} · Registrada el ${formatearFecha(consultaOriginal?.fecha || form.fecha)}`}
        icon={<BsJournalMedical className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate)}
        rightContent={
          form.estado ? (
            <span className={`badge px-2 py-1 text-uppercase ${estadoTurnoClase(form.estado)}`}>
              {form.estado}
            </span>
          ) : undefined
        }
      />

      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">Fecha</label>
                <input
                  type="date"
                  className="form-control shadow-none"
                  value={form.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">Estado</label>
                <select
                  className="form-select shadow-none"
                  value={form.estado}
                  onChange={(e) => handleChange('estado', e.target.value)}
                >
                  <option value="ATENDIDA">ATENDIDA</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CERRADA">CERRADA</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Motivo de consulta</label>
              <input
                type="text"
                className="form-control shadow-none"
                value={form.motivo}
                onChange={(e) => handleChange('motivo', e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Diagnóstico</label>
              <textarea
                className="form-control shadow-none"
                rows={3}
                value={form.diagnostico}
                onChange={(e) => handleChange('diagnostico', e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Tratamiento</label>
              <textarea
                className="form-control shadow-none"
                rows={3}
                value={form.tratamiento}
                onChange={(e) => handleChange('tratamiento', e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">Observaciones</label>
              <textarea
                className="form-control shadow-none"
                rows={2}
                value={form.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top border-secondary-subtle">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn text-white fw-semibold px-4 d-flex align-items-center gap-2 shadow-sm"
                style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                disabled={submitting}
              >
                <BsSave />
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
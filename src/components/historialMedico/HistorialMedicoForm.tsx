import React, { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { BsCalendarPlus, BsArrowLeft, BsCheckCircle } from 'react-icons/bs';
import { HistorialMedicoFormSkeleton } from './HistorialMedicoFormSkeleton';
import clientesAxios from '../../config/axios';

type GrupoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

interface OptionItem {
  id?: string;
  _id?: string;
  nombre: string;
  apellido?: string;
  dni?: string;
}

interface HistorialMedicoFormProps {
  historialId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GRUPOS_SANGUINEOS: readonly GrupoSanguineo[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const getEntityId = (item?: { id?: string; _id?: string } | string | null): string => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return String(item.id || item._id || '');
};

const formatearEtiquetaPaciente = (p: OptionItem): string => {
  const apellidoNombre = `${p.apellido || ''}${p.apellido && p.nombre ? ', ' : ''}${
    p.nombre || ''
  }`.trim();
  const base = apellidoNombre || 'Paciente sin nombre';
  return p.dni ? `${base} - DNI: ${p.dni}` : base;
};

const extraerDescripcionesTexto = (items: unknown): string => {
  if (!Array.isArray(items)) return '';
  return items
    .map((it) =>
      typeof it === 'string' ? it : (it as { descripcion?: string })?.descripcion || ''
    )
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ');
};

const parsearListaObjetos = (texto: string) =>
  texto
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((descripcion) => ({ descripcion }));

export const HistorialMedicoForm: React.FC<HistorialMedicoFormProps> = ({
  historialId,
  onSuccess,
  onCancel,
}) => {
  const [pacientes, setPacientes] = useState<OptionItem[]>([]);
  const [formData, setFormData] = useState({
    paciente: '',
    grupoSanguineo: 'O+' as GrupoSanguineo,
    alergiasTexto: '',
    enfermedadesCronicasTexto: '',
    medicacionActualTexto: '',
    antecedentesFamiliares: 'Sin antecedentes',
    antecedentesQuirurgicos: 'Sin antecedentes',
    tabaquismo: false,
    alcoholismo: false,
    drogas: false,
    observacionesGenerales: '',
  });

  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const isEditing = Boolean(historialId);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const extraerArray = (responseData: unknown, claveSugerida: string): OptionItem[] => {
          if (Array.isArray(responseData)) return responseData as OptionItem[];
          if (responseData && typeof responseData === 'object') {
            const record = responseData as Record<string, unknown>;
            if (Array.isArray(record[claveSugerida])) return record[claveSugerida] as OptionItem[];
            const dataObj = record.data as Record<string, unknown> | undefined;
            if (Array.isArray(dataObj?.[claveSugerida])) {
              return dataObj[claveSugerida] as OptionItem[];
            }
            if (Array.isArray(record.data)) return record.data as OptionItem[];
          }
          return [];
        };

        const resPacientes = await clientesAxios.get('/pacientes', { params: { page: 1, limit: 100 } });
        if (!mounted) return;
        setPacientes(extraerArray(resPacientes.data, 'pacientes'));

        if (isEditing && historialId) {
          const resHistorial = await clientesAxios.get(`/historiales/${historialId}`);
          if (!mounted) return;
          const dataHistorial =
            resHistorial.data?.data ?? resHistorial.data?.historial ?? resHistorial.data;

          const grupo = String(dataHistorial?.grupoSanguineo || 'O+') as GrupoSanguineo;
          setFormData({
            paciente: getEntityId(dataHistorial?.paciente),
            grupoSanguineo: GRUPOS_SANGUINEOS.includes(grupo) ? grupo : 'O+',
            alergiasTexto: extraerDescripcionesTexto(dataHistorial?.alergias),
            enfermedadesCronicasTexto: extraerDescripcionesTexto(
              dataHistorial?.enfermedadesCronicas
            ),
            medicacionActualTexto: extraerDescripcionesTexto(dataHistorial?.medicacionActual),
            antecedentesFamiliares:
              dataHistorial?.antecedentesFamiliares || 'Sin antecedentes',
            antecedentesQuirurgicos:
              dataHistorial?.antecedentesQuirurgicos || 'Sin antecedentes',
            tabaquismo: Boolean(dataHistorial?.habitos?.tabaquismo),
            alcoholismo: Boolean(dataHistorial?.habitos?.alcoholismo),
            drogas: Boolean(dataHistorial?.habitos?.drogas),
            observacionesGenerales: dataHistorial?.observacionesGenerales || '',
          });
        }
      } catch (err) {
        console.error('Error al cargar datos del formulario:', err);
        if (mounted) {
          setError('No se pudieron cargar los datos necesarios.');
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    };
    void fetchData();
    return () => {
      mounted = false;
    };
  }, [historialId, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!OBJECT_ID_REGEX.test(formData.paciente.trim())) {
      setError('Debe seleccionar un paciente válido de la lista.');
      return;
    }

    setSubmitting(true);

    const payload = {
      paciente: formData.paciente.trim(),
      grupoSanguineo: formData.grupoSanguineo,
      alergias: parsearListaObjetos(formData.alergiasTexto),
      enfermedadesCronicas: parsearListaObjetos(formData.enfermedadesCronicasTexto),
      medicacionActual: parsearListaObjetos(formData.medicacionActualTexto),
      antecedentesFamiliares: formData.antecedentesFamiliares.trim() || 'Sin antecedentes',
      antecedentesQuirurgicos: formData.antecedentesQuirurgicos.trim() || 'Sin antecedentes',
      habitos: {
        tabaquismo: formData.tabaquismo,
        alcoholismo: formData.alcoholismo,
        drogas: formData.drogas,
      },
      observacionesGenerales: formData.observacionesGenerales.trim(),
    };

    try {
      if (isEditing && historialId) {
        await clientesAxios.put(`/historiales/${historialId}`, payload);
      } else {
        await clientesAxios.post('/historiales', payload);
      }
      setSuccessMsg(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: unknown) {
      console.error('Error al guardar el historial:', err);
      const backendMessage = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Error al guardar el historial en el servidor.'
        : 'Error al guardar el historial en el servidor.';
      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <HistorialMedicoFormSkeleton />;
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div
        className="card border-0 shadow-sm bg-white p-4 mx-auto"
        style={{ maxWidth: '750px', borderRadius: '12px' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h3 className="fw-bold text-dark mb-1">
              <BsCalendarPlus className="me-2" style={{ color: '#00ACB2' }} />
              {isEditing ? 'Modificar Historial Médico' : 'Registrar Nuevo Historial Médico'}
            </h3>
            <p className="text-muted mb-0 small">
              {isEditing
                ? 'Actualice los datos clínicos del historial.'
                : 'Seleccione al paciente para registrar su historial médico.'}
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              onClick={onCancel}
            >
              <BsArrowLeft /> Volver
            </button>
          )}
        </div>

        {successMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <BsCheckCircle size={20} />
            <div>
              {isEditing
                ? 'Historial actualizado exitosamente'
                : 'Historial creado y guardado exitosamente'}
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label fw-semibold text-secondary small">
                Paciente
              </label>
              <select
                className="form-select shadow-none"
                name="paciente"
                value={formData.paciente}
                onChange={handleChange}
                disabled={isEditing}
                required
              >
                <option value="">Seleccione un paciente...</option>
                {pacientes.map((p) => {
                  const pid = getEntityId(p);
                  return (
                    <option key={pid} value={pid}>
                      {formatearEtiquetaPaciente(p)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold text-secondary small">
                Grupo sanguíneo
              </label>
              <select
                className="form-select shadow-none"
                name="grupoSanguineo"
                value={formData.grupoSanguineo}
                onChange={handleChange}
                required
              >
                {GRUPOS_SANGUINEOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">
                Alergias (separadas por coma)
              </label>
              <input
                type="text"
                className="form-control shadow-none"
                name="alergiasTexto"
                placeholder="Ej: Penicilina, Polen"
                value={formData.alergiasTexto}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">
                Enfermedades crónicas (separadas por coma)
              </label>
              <input
                type="text"
                className="form-control shadow-none"
                name="enfermedadesCronicasTexto"
                placeholder="Ej: Hipertensión arterial, Diabetes tipo 2"
                value={formData.enfermedadesCronicasTexto}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">
                Medicación actual (separada por coma)
              </label>
              <input
                type="text"
                className="form-control shadow-none"
                name="medicacionActualTexto"
                placeholder="Ej: Enalapril 10mg, Metformina 850mg"
                value={formData.medicacionActualTexto}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Antecedentes familiares
              </label>
              <textarea
                className="form-control shadow-none"
                name="antecedentesFamiliares"
                rows={2}
                value={formData.antecedentesFamiliares}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Antecedentes quirúrgicos
              </label>
              <textarea
                className="form-control shadow-none"
                name="antecedentesQuirurgicos"
                rows={2}
                value={formData.antecedentesQuirurgicos}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small d-block">
                Hábitos
              </label>
              <div className="d-flex flex-wrap gap-4">
                <div className="form-check">
                  <input
                    id="habito-tabaquismo"
                    type="checkbox"
                    className="form-check-input"
                    name="tabaquismo"
                    checked={formData.tabaquismo}
                    onChange={handleChange}
                  />
                  <label htmlFor="habito-tabaquismo" className="form-check-label small">
                    Tabaquismo
                  </label>
                </div>
                <div className="form-check">
                  <input
                    id="habito-alcoholismo"
                    type="checkbox"
                    className="form-check-input"
                    name="alcoholismo"
                    checked={formData.alcoholismo}
                    onChange={handleChange}
                  />
                  <label htmlFor="habito-alcoholismo" className="form-check-label small">
                    Alcoholismo
                  </label>
                </div>
                <div className="form-check">
                  <input
                    id="habito-drogas"
                    type="checkbox"
                    className="form-check-input"
                    name="drogas"
                    checked={formData.drogas}
                    onChange={handleChange}
                  />
                  <label htmlFor="habito-drogas" className="form-check-label small">
                    Drogas
                  </label>
                </div>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">
                Observaciones generales
              </label>
              <textarea
                className="form-control shadow-none"
                name="observacionesGenerales"
                rows={3}
                placeholder="Notas adicionales..."
                value={formData.observacionesGenerales}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
            {onCancel && (
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="btn text-white fw-semibold px-4 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
              disabled={submitting || successMsg}
            >
              {submitting
                ? 'Guardando...'
                : isEditing
                  ? 'Actualizar Historial'
                  : 'Registrar Historial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HistorialMedicoForm;

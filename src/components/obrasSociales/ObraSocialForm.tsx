import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCapsule, BsSave } from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { obraSocialSchema, type ObraSocialFormValues } from './obraSocial.schema';
import { obraSocialService } from '../../services/obraSocial.service';
import toast from 'react-hot-toast';

interface Props {
  obraSocialId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ObraSocialForm: React.FC<Props> = ({ obraSocialId, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const isEdit = !!obraSocialId;
  const [values, setValues] = useState<ObraSocialFormValues>({ nombre: '', email: '', telefono: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!obraSocialId) return;
    setLoading(true);
    (async () => {
      try {
        const data = await obraSocialService.obtener(obraSocialId);
        if (data) {
          setValues({
            nombre: data.nombre || '',
            email: data.email || '',
            telefono: data.telefono || '',
            activo: data.activo,
          });
        }
      } catch (e) {
        console.error(e);
        toast.error('No se pudo cargar la obra social');
      } finally {
        setLoading(false);
      }
    })();
  }, [obraSocialId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = obraSocialSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] || '');
        if (key) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setSaving(true);
      if (isEdit && obraSocialId) {
        await obraSocialService.actualizar(obraSocialId, parsed.data);
        toast.success('Obra social actualizada');
      } else {
        await obraSocialService.crear(parsed.data);
        toast.success('Obra social creada');
      }
      if (onSuccess) onSuccess();
      else navigate('/obras-sociales');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container-fluid py-4 text-muted">Cargando...</div>;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={isEdit ? 'Editar Obra Social' : 'Nueva Obra Social'}
        subtitulo={isEdit ? 'Modificar datos de la obra social.' : 'Registrar una nueva obra social.'}
        icon={<BsCapsule className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={onCancel || (() => navigate(-1))}
      />

      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-4">
          <form onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Nombre *</label>
                <input
                  name="nombre"
                  value={values.nombre}
                  onChange={handleChange}
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={values.email || ''}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Telefono</label>
                <input name="telefono" value={values.telefono || ''} onChange={handleChange} className="form-control" />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel || (() => navigate(-1))}>
                Cancelar
              </button>
              <button type="submit" className="btn text-white fw-semibold d-flex align-items-center gap-2" style={{ backgroundColor: '#00ACB2' }} disabled={saving}>
                <BsSave /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

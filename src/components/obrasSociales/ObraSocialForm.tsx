import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ObraSocialFormValues>({
    resolver: zodResolver(obraSocialSchema),
    defaultValues: { nombre: '', email: '', telefono: '' },
  });

  useEffect(() => {
    if (!obraSocialId) return;
    (async () => {
      try {
        const data = await obraSocialService.obtener(obraSocialId);
        if (data) {
          reset({
            nombre: data.nombre || '',
            email: data.email || '',
            telefono: data.telefono || '',
            activo: data.activo,
          });
        }
      } catch (e) {
        console.error(e);
        toast.error('No se pudo cargar la obra social');
      }
    })();
  }, [obraSocialId, reset]);

  const onSubmit = async (values: ObraSocialFormValues) => {
    try {
      if (isEdit && obraSocialId) {
        await obraSocialService.actualizar(obraSocialId, values);
        toast.success('Obra social actualizada');
      } else {
        await obraSocialService.crear(values);
        toast.success('Obra social creada');
      }
      if (onSuccess) onSuccess();
      else navigate('/obras-sociales');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Error al guardar');
    }
  };

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Nombre *</label>
                <input className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} {...register('nombre')} />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Telefono</label>
                <input className="form-control" {...register('telefono')} />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel || (() => navigate(-1))}>
                Cancelar
              </button>
              <button type="submit" className="btn text-white fw-semibold d-flex align-items-center gap-2" style={{ backgroundColor: '#00ACB2' }} disabled={isSubmitting}>
                <BsSave /> {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

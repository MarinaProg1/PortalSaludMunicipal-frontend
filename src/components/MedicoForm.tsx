import React, { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { BsArrowLeft, BsCheckCircle, BsCalendarPlus} from 'react-icons/bs';
import { MedicoFormSkeleton } from './MedicoFormSkeleton';
import clientesAxios from '../config/axios';

interface EspecialidadItem {
  id?: string;
  _id?: string;
  nombre: string;
}

interface MedicoFormProps {
  medicoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const MedicoForm: React.FC<MedicoFormProps> = ({ medicoId, onSuccess, onCancel }) => {
  const [especialidades, setEspecialidades] = useState<EspecialidadItem[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    especialidad: '',
    telefono: '',
    estado: 'activo'
  });

  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const isEditing = Boolean(medicoId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const extraerArray = (responseData: unknown, claveSugerida: string): EspecialidadItem[] => {
          if (Array.isArray(responseData)) return responseData as EspecialidadItem[];
          if (responseData && typeof responseData === 'object') {
            const record = responseData as Record<string, unknown>;
            if (Array.isArray(record[claveSugerida])) return record[claveSugerida] as EspecialidadItem[];
            if (Array.isArray(record.data)) return record.data as EspecialidadItem[];
          }
          return [];
        };

        if (isEditing && medicoId) {
          const [resEspecialidades, resMedico] = await Promise.all([
            clientesAxios.get('/especialidades'),
            clientesAxios.get(`/medicos/${medicoId}`)
          ]);
          setEspecialidades(extraerArray(resEspecialidades.data, 'especialidades'));
          const dataMedico = (resMedico.data.medico) || (resMedico.data.data)|| resMedico.data;
          const especialidadId = dataMedico.especialidad?._id || dataMedico.especialidad?.id || dataMedico.especialidad;
          setFormData({
            nombre: dataMedico.nombre || '',
            apellido: dataMedico.apellido || '',
            matricula: dataMedico.matricula || '',
            especialidad: especialidadId || '',
            telefono: dataMedico.telefono || '',
            estado: dataMedico.estado || 'activo'
          });
        } else {
          const resEspecialidades = await clientesAxios.get('/especialidades');
          setEspecialidades(extraerArray(resEspecialidades.data, 'especialidades'));
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [medicoId, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isEditing && medicoId) {
        await clientesAxios.put(`/medicos/${medicoId}`, formData);
      } else {
        await clientesAxios.post('/medicos', formData);
      }
      setSuccessMsg(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: unknown) {
      console.error('Error al guardar el medico:', err);
      const backendMessage = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Error al guardar el medico en el servidor.'
        : 'Error al guardar el medico en el servidor.';
      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <MedicoFormSkeleton />;
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>
        
        {/* Cabecera dinámica - IGUAL QUE TURNO */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h3 className="fw-bold text-dark mb-1">
              <BsCalendarPlus className="me-2" style={{ color: '#00ACB2' }} />
              {isEditing ? 'Modificar Médico' : 'Asignar Nuevo Médico'}
            </h3>
            <p className="text-muted mb-0 small">
              {isEditing ? 'Actualice los datos necesarios del médico.' : 'Complete los datos para registrar un médico.'}
            </p>
          </div>
          {onCancel && (
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={onCancel}>
              <BsArrowLeft /> Volver
            </button>
          )}
        </div>

        {/* Mensaje de Éxito - IGUAL */}
        {successMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <BsCheckCircle size={20} />
            <div>{isEditing ? 'Médico actualizado exitosamente!' : 'Médico creado y guardado exitosamente!'}</div>
          </div>
        )}

        {/* Mensaje de Error - IGUAL */}
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Nombre</label>
              <input type="text" className="form-control shadow-none" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Apellido</label>
              <input type="text" className="form-control shadow-none" name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Matrícula</label>
              <input type="text" className="form-control shadow-none" name="matricula" value={formData.matricula} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Especialidad</label>
              <select className="form-select shadow-none" name="especialidad" value={formData.especialidad} onChange={handleChange} required>
                <option value="">Seleccione una especialidad...</option>
                {especialidades.map(e => (
                  <option key={e._id || e.id} value={e._id || e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Teléfono</label>
              <input type="text" className="form-control shadow-none" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Estado del Médico</label>
              <select className="form-select shadow-none text-uppercase" name="estado" value={formData.estado} onChange={handleChange} required>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="vacaciones">Vacaciones</option>
              </select>
            </div>
          </div>

          {/* Botones de acción - IGUAL */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
            {onCancel && (
              <button type="button" className="btn btn-light px-4" onClick={onCancel} disabled={submitting}>
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="btn text-white fw-semibold px-4 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
              disabled={submitting || successMsg}
            >
              {submitting ? 'Guardando...' : (isEditing ? 'Actualizar Médico' : 'Registrar Médico')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { BsCalendarPlus, BsArrowLeft, BsCheckCircle } from 'react-icons/bs';
import { HistorialMedicoFormSkeleton } from './HistorialMedicoFormSkeleton';
import clientesAxios from '../../config/axios';

interface OptionItem {
  id?: string;
  _id?: string;
  nombre: string;
  apellido?: string;
  razonSocial?: string;
}

interface MedicoItem extends OptionItem {
  especialidades?: OptionItem[];
}

interface HistorialMedicoFormProps {
  historialId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const HistorialMedicoForm: React.FC<HistorialMedicoFormProps> = ({ historialId, onSuccess, onCancel }) => {
  const [pacientes, setPacientes] = useState<OptionItem[]>([]);
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<OptionItem[]>([]);

  const [formData, setFormData] = useState({
    paciente: '',
    medico: '',
    especialidad: '',
    fecha: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
  });

  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const isEditing = Boolean(historialId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const extraerArray = (responseData: unknown, claveSugerida: string): OptionItem[] => {
          if (Array.isArray(responseData)) return responseData as OptionItem[];
          if (responseData && typeof responseData === 'object') {
            const record = responseData as Record<string, unknown>;
            if (Array.isArray(record[claveSugerida])) return record[claveSugerida] as OptionItem[];
            if (Array.isArray(record.data)) return record.data as OptionItem[];
          }
          return [];
        };

        if (isEditing && historialId) {
          const [resPacientes, resMedicos, resHistorial] = await Promise.all([
            clientesAxios.get('/pacientes'),
            clientesAxios.get('/medicos'),
            clientesAxios.get(`/historial-medico/${historialId}`)
          ]);
          const listaPacientes = extraerArray(resPacientes.data, 'pacientes');
          const listaMedicos = extraerArray(resMedicos.data, 'medicos') as MedicoItem[];
          setPacientes(listaPacientes);
          setMedicos(listaMedicos);
          const dataHistorial = resHistorial.data.historial || resHistorial.data.data || resHistorial.data;
          const pacienteId = dataHistorial.paciente?._id || dataHistorial.paciente?.id || dataHistorial.paciente;
          const medicoId = dataHistorial.medico?._id || dataHistorial.medico?.id || dataHistorial.medico;
          const especialidadId = dataHistorial.especialidad?._id || dataHistorial.especialidad?.id || dataHistorial.especialidad;
          const medicoEncontrado = listaMedicos.find(m => (m.id === medicoId || m._id === medicoId));
          if (medicoEncontrado && Array.isArray(medicoEncontrado.especialidades)) {
            setEspecialidadesDisponibles(medicoEncontrado.especialidades);
          }
          setFormData({
            paciente: pacienteId || '',
            medico: medicoId || '',
            especialidad: especialidadId || '',
            fecha: dataHistorial.fecha ? dataHistorial.fecha.split('T')[0] : '',
            diagnostico: dataHistorial.diagnostico || '',
            tratamiento: dataHistorial.tratamiento || '',
            observaciones: dataHistorial.observaciones || '',
          });
        } else {
          const [resPacientes, resMedicos] = await Promise.all([
            clientesAxios.get('/pacientes'),
            clientesAxios.get('/medicos')
          ]);
          setPacientes(extraerArray(resPacientes.data, 'pacientes'));
          setMedicos(extraerArray(resMedicos.data, 'medicos') as MedicoItem[]);
        }
      } catch (err) {
        console.error('Error al cargar datos del formulario:', err);
        setError('No se pudieron cargar los datos necesarios.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [historialId, isEditing]);

  const handleMedicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const medicoId = e.target.value;
    setFormData(prev => ({ ...prev, medico: medicoId, especialidad: '' }));
    if (!medicoId) { setEspecialidadesDisponibles([]); return; }
    const medicoSeleccionado = medicos.find(m => m.id === medicoId || m._id === medicoId);
    if (medicoSeleccionado && Array.isArray(medicoSeleccionado.especialidades)) {
      setEspecialidadesDisponibles(medicoSeleccionado.especialidades);
    } else { setEspecialidadesDisponibles([]); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isEditing && historialId) {
        await clientesAxios.put(`/historial-medico/${historialId}`, formData);
      } else {
        await clientesAxios.post('/historial-medico', formData);
      }
      setSuccessMsg(true);
      setTimeout(() => { if (onSuccess) onSuccess(); }, 1500);
    } catch (err: unknown) {
      console.error('Error al guardar el historial:', err);
      const backendMessage = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Error al guardar el historial en el servidor.'
        : 'Error al guardar el historial en el servidor.';
      setError(backendMessage);
    } finally { setSubmitting(false); }
  };

  if (loadingData) { return <HistorialMedicoFormSkeleton />; }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '12px' }}>

        {/* Cabecera dinámica */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
          <div>
            <h3 className="fw-bold text-dark mb-1">
              <BsCalendarPlus className="me-2" style={{ color: '#00ACB2' }} />
              {isEditing ? 'Modificar Historial Médico' : 'Registrar Nuevo Historial Médico'}
            </h3>
            <p className="text-muted mb-0 small">
              {isEditing ? 'Actualice los datos necesarios del historial.' : 'Complete los datos para registrar un historial médico.'}
            </p>
          </div>
          {onCancel && (
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={onCancel}>
              <BsArrowLeft /> Volver
            </button>
          )}
        </div>

        {/* Mensaje de Éxito */}
        {successMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <BsCheckCircle size={20} />
            <div>{isEditing ? 'Historial actualizado exitosamente' : 'Historial creado y guardado exitosamente'}</div>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">

            {/* Paciente */}
            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Paciente</label>
              <select className="form-select shadow-none" name="paciente" value={formData.paciente} onChange={handleChange} required>
                <option value="">Seleccione un paciente...</option>
                {pacientes.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Médico */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Médico</label>
              <select className="form-select shadow-none" name="medico" value={formData.medico} onChange={handleMedicoChange} required>
                <option value="">Seleccione un médico...</option>
                {medicos.map(m => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    Dr./Dra. {m.nombre} {m.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Especialidad */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Especialidad</label>
              <select className="form-select shadow-none" name="especialidad" value={formData.especialidad} onChange={handleChange} required disabled={!formData.medico}>
                <option value="">
                  {formData.medico ? 'Seleccione una especialidad...' : 'Primero seleccione un médico'}
                </option>
                {especialidadesDisponibles.map(e => (
                  <option key={e._id || e.id} value={e._id || e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Fecha</label>
              <input type="date" className="form-control shadow-none" name="fecha" value={formData.fecha} onChange={handleChange} required />
            </div>

            {/* Diagnóstico - REEMPLAZA A HORA */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Diagnóstico</label>
              <input type="text" placeholder="Ej: Gripe, Hipertensión..." className="form-control shadow-none" name="diagnostico" value={formData.diagnostico} onChange={handleChange} required />
            </div>

            {/* Tratamiento */}
            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Tratamiento</label>
              <textarea className="form-control shadow-none" name="tratamiento" rows={3} placeholder="Ej: Reposo 3 días, Ibuprofeno cada 8hs..." value={formData.tratamiento} onChange={handleChange} required />
            </div>

            {/* Observaciones - REEMPLAZA A ESTADO */}
            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Observaciones</label>
              <textarea className="form-control shadow-none" name="observaciones" rows={3} placeholder="Notas adicionales..." value={formData.observaciones} onChange={handleChange} />
            </div>

          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
            {onCancel && (
              <button type="button" className="btn btn-light px-4" onClick={onCancel} disabled={submitting}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn text-white fw-semibold px-4 shadow-sm" style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }} disabled={submitting || successMsg}>
              {submitting ? 'Guardando...' : (isEditing ? 'Actualizar Historial' : 'Registrar Historial')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default HistorialMedicoForm;
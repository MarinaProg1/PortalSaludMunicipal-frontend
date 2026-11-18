import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCalendarX, BsChatText, BsPersonBadge, BsTag, BsExclamationTriangle, BsTelephone, BsEnvelope } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import type { MedicoItem } from '../turnos/turno.schema';
import { SelectField } from '../../constants/SelectField';
import { InputField } from '../../constants/InputField';
import { formatearTelefono } from '../utils/formatters';

const TipoExcepcion = {
  BLOQUEO_TOTAL: 'BLOQUEO_TOTAL',
  MODIFICACION_HORARIO: 'MODIFICACION_HORARIO',
} as const;

type TipoExcepcionType = typeof TipoExcepcion[keyof typeof TipoExcepcion];

const CategoriaMotivo = {
  LICENCIA: 'Licencia médica',
  FERIADO: 'Feriado',
  CONGRESO: 'Congreso',
  PERSONAL: 'Motivos personales',
  CAPACITACION: 'Capacitación',
  OTRO: 'Otro',
} as const;

type CategoriaMotivoType = typeof CategoriaMotivo[keyof typeof CategoriaMotivo];

interface TurnoAfectado {
  _id: string;
  fecha: string;
  hora: string;
  paciente: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    email?: string;
  };
}
export const CrearExcepcionView = () => {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [loadingMedicos, setLoadingMedicos] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [turnosAfectados, setTurnosAfectados] = useState<TurnoAfectado[] | null>(null);

  // Campos del formulario
  const [medicoId, setMedicoId] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [tipo, setTipo] = useState<TipoExcepcionType>(TipoExcepcion.BLOQUEO_TOTAL);
  const [horaInicio, setHoraInicio] = useState<string>('08:00');
  const [horaFin, setHoraFin] = useState<string>('12:00');
  const [categoriaMotivo, setCategoriaMotivo] = useState<CategoriaMotivoType>(CategoriaMotivo.LICENCIA);
  const [motivoCustom, setMotivoCustom] = useState<string>('');

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const res = await clientesAxios.get('/medicos');
        const data = res.data?.data || res.data || [];
        setMedicos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar médicos:', err);
        toast.error('No se pudo cargar la lista de médicos.');
      } finally {
        setLoadingMedicos(false);
      }
    };
    fetchMedicos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTurnosAfectados(null);

    if (!medicoId || !fecha) {
      toast.error('Por favor, seleccione el médico y la fecha.');
      return;
    }

    if (tipo === TipoExcepcion.MODIFICACION_HORARIO && (!horaInicio || !horaFin)) {
      toast.error('Debe especificar la hora de inicio y fin para una modificación de horario.');
      return;
    }

    const motivoFinal = categoriaMotivo === CategoriaMotivo.OTRO 
      ? motivoCustom 
      : `${categoriaMotivo}${motivoCustom ? ` - ${motivoCustom}` : ''}`;

    if (!motivoFinal || motivoFinal.trim().length < 3) {
      toast.error('El motivo debe tener al menos 3 caracteres.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        medico: medicoId,
        fecha,
        tipo,
        horaInicio: tipo === TipoExcepcion.MODIFICACION_HORARIO ? horaInicio : undefined,
        horaFin: tipo === TipoExcepcion.MODIFICACION_HORARIO ? horaFin : undefined,
        motivo: motivoFinal,
      };

      const response = await clientesAxios.post('/excepciones', payload);

      if (response.data && response.data.ok) {
        const turnosRepo = response.data.data?.turnosAReprogramar || [];

        if (turnosRepo.length > 0) {
          // Si hay turnos afectados, los guardamos en el estado para mostrárselos al usuario
          setTurnosAfectados(turnosRepo);
          toast.warning(`Excepción registrada, pero hay ${turnosRepo.length} turnos que requieren reprogramación.`);
        } else {
          toast.success('¡Excepción de agenda registrada exitosamente sin turnos afectados!');
          navigate('/excepcion-horario');
        }
      } else {
        setError(response.data.message || 'No se pudo registrar la excepción.');
      }
    } catch (err: unknown) {
      console.error('Error al crear excepción:', err);
      const mensaje = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Error al conectar con el servidor.'
        : 'Error al conectar con el servidor.';
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '750px' }}>
      <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
        
        <PageHeader 
          titulo="Registrar Excepción de Agenda"
          subtitulo="Bloquea un día completo o modifica temporalmente el horario de un profesional."
          icon={<BsCalendarX className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => navigate('/excepcion-horario')}
        />

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Panel de Advertencia si hay turnos afectados que reprogramar */}
        {turnosAfectados && turnosAfectados.length > 0 && (
          <div className="alert alert-warning border-warning mb-4 shadow-sm" role="alert">
            <div className="d-flex align-items-center gap-2 mb-2">
              <BsExclamationTriangle size={20} className="text-warning-emphasis" />
              <h5 className="alert-heading fw-bold mb-0 text-dark">¡Atención! Turnos afectados a reprogramar</h5>
            </div>
            <p className="small text-secondary mb-3">
              La excepción se registró correctamente, pero se encontraron los siguientes turnos pendientes o confirmados en esta fecha que necesitan ser reprogramados:
            </p>
            <div className="list-group mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {turnosAfectados.map((turno) => (
                <div key={turno._id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3">
                  <div>
                    <strong className="text-dark">
                      {turno.paciente?.apellido?.toUpperCase()}, {turno.paciente?.nombre}
                    </strong>
                    <div className="text-muted small">
                      Hora de la cita: <span className="fw-semibold text-danger">{turno.hora} hs</span>
                    </div>
                  </div>
                  <div className="text-end small">
                     {turno.paciente?.telefono && (
                     <div className="d-flex align-items-center gap-1 text-muted">
                       <BsTelephone size={12} /> 
                       {formatearTelefono(turno.paciente.telefono)}
                    </div>
                     )}
                    {turno.paciente?.email && (
                      <div className="d-flex align-items-center gap-1 text-muted">
                        <BsEnvelope size={12} /> {turno.paciente.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-end">
              <button 
                type="button" 
                className="btn btn-sm btn-dark px-4 fw-semibold"
                onClick={() => navigate('/excepcion-horario')}
              >
                Entendido / Finalizar
              </button>
            </div>
          </div>
        )}

        {/* Formulario (se oculta o deshabilita si ya se mostraron los turnos afectados) */}
        {!turnosAfectados && (
          <form onSubmit={handleSubmit}>
            <SelectField
              label="Médico Profesional"
              labelIcon={<BsPersonBadge className="me-1" />}
              value={medicoId}
              onChange={setMedicoId}
              placeholder={loadingMedicos ? "Cargando médicos..." : "Seleccione o busque un médico..."}
              required
              disabled={loadingMedicos}
              className="mb-3"
              options={medicos.map(m => {
                const id = m.id || m._id || '';
                return {
                  value: id,
                  label: `Dr./Dra. ${m.nombre} ${m.apellido}`
                };
              })}
            />

            {/* Tipo de Excepción */}
            <SelectField
              label="Tipo de Excepción"
              labelIcon={<BsTag className="me-1" />}
              value={tipo}
              onChange={(val) => setTipo(val as TipoExcepcionType)}
              required
              options={[
                { value: TipoExcepcion.BLOQUEO_TOTAL, label: 'Bloqueo Total (Feriado, Vacaciones, Licencia)' },
                { value: TipoExcepcion.MODIFICACION_HORARIO, label: 'Modificación de Horario (Horario especial)' }
              ]}
            />

            {/* Fecha */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Fecha de la Excepción</label>
              <input 
                type="date" 
                className="form-control shadow-none" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                required 
              />
            </div>

            {/* Horas condicionales si es MODIFICACION_HORARIO */}
            {tipo === TipoExcepcion.MODIFICACION_HORARIO && (
              <div className="row p-3 bg-light rounded-3 mb-3">
                <div className="col-md-6 mb-2 mb-md-0">
                  <label className="form-label fw-semibold text-secondary small">Hora Inicio</label>
                  <input 
                    type="text" 
                    className="form-control shadow-none" 
                    value={horaInicio} 
                    onChange={(e) => setHoraInicio(e.target.value)} 
                    placeholder="08:00"
                    required 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Hora Fin</label>
                  <input 
                    type="text" 
                    className="form-control shadow-none" 
                    value={horaFin} 
                    onChange={(e) => setHoraFin(e.target.value)} 
                    placeholder="12:00"
                    required 
                  />
                </div>
              </div>
            )}

            {/* Categoría de Motivo */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Categoría del Motivo</label>
              <select 
                className="form-select shadow-none"
                value={categoriaMotivo}
                onChange={(e) => setCategoriaMotivo(e.target.value as CategoriaMotivoType)}
                required
              >
                {Object.entries(CategoriaMotivo).map(([, label]) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Detalle o motivo personalizado */}
            <InputField
              label="Detalle / Observaciones (Opcional)"
              labelIcon={<BsChatText className="me-1" />}
              containerClassName="mb-4"
              value={motivoCustom}
              onChange={(e) => setMotivoCustom(e.target.value)}
              placeholder="Ej: Congreso provincial de cardiología..."
            />

            {/* Botones */}
            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <button 
                type="button" 
                className="btn btn-light px-4" 
                onClick={() => navigate('/excepcion-horario')}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn text-white fw-semibold px-4 shadow-sm" 
                style={{ backgroundColor: '#00ACB2' }}
                disabled={submitting}
              >
                {submitting ? 'Registrando...' : 'Guardar Excepción'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
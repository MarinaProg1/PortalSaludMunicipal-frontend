import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { BsCalendarPlus, BsPerson, BsClock, BsHeartPulse, BsLightningCharge } from 'react-icons/bs';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import type { PacienteItem, EspecialidadItem, TurnoFormProps } from './turno.schema';
import { SelectField } from '../../constants/SelectField';

export const TurnoForm = ({ turnoId, onSuccess, onCancel }: TurnoFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: idParam } = useParams<{ id: string }>();

  // Determinamos si estamos editando (por prop o por parámetro de ruta)
  const idEditando = turnoId || idParam;

  // Query Params para turnos nuevos desde la agenda
  const medicoId = searchParams.get('medico');
  const medicoNombre = searchParams.get('nombre');
  const especialidadUrl = searchParams.get('especialidad');
  const fechaUrl = searchParams.get('fecha');
  const horaUrl = searchParams.get('hora');
  const esUrgente = searchParams.get('urgencia') === 'true';

  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);
  const [especialidades, setEspecialidades] = useState<EspecialidadItem[]>([]);

  // Campos del formulario
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>('');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>(especialidadUrl || '');
  const [fechaTurno, setFechaTurno] = useState<string>(fechaUrl || '');
  const [horaTurno, setHoraTurno] = useState<string>(horaUrl || '');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 1. Cargar datos iniciales y el turno si estamos editando
  useEffect(() => {
    let activo = true;

    const fetchDataInicial = async () => {
      try {
        const [resPacientes, resEspecialidades] = await Promise.all([
          clientesAxios.get('/pacientes'),
          clientesAxios.get('/especialidades'),
        ]);

        if (!activo) return;

        const dataPac = resPacientes.data.data || resPacientes.data || [];
        const dataEsp = resEspecialidades.data.data || resEspecialidades.data || [];

        setPacientes(Array.isArray(dataPac) ? dataPac : []);
        setEspecialidades(Array.isArray(dataEsp) ? dataEsp : []);

        // Si viene una especialidad por URL pero es el nombre en vez de ID, la buscamos y resolvemos
        if (especialidadUrl && especialidadUrl.length !== 24 && Array.isArray(dataEsp)) {
          const encontrada = dataEsp.find(
            (esp: EspecialidadItem) => esp.nombre?.toLowerCase() === especialidadUrl.toLowerCase()
          );
          if (encontrada) {
            setEspecialidadSeleccionada(encontrada.id || encontrada._id || '');
          }
        }

        // Si estamos en modo edición, cargamos los datos del turno existente
        if (idEditando) {
          const resTurno = await clientesAxios.get(`/turnos/${idEditando}`);
          if (!activo) return;

          const turnoData = resTurno.data.data || resTurno.data;
          if (turnoData) {
            const pacRef = turnoData.paciente;
            const pacValor =
              typeof pacRef === 'object' && pacRef !== null
                ? pacRef._id || pacRef.id || ''
                : pacRef || '';

            const espRef = turnoData.especialidad;
            const espValor =
              typeof espRef === 'object' && espRef !== null
                ? espRef._id || espRef.id || ''
                : espRef || '';

            setPacienteSeleccionado(String(pacValor));
            setEspecialidadSeleccionada(String(espValor));
            if (turnoData.fecha) setFechaTurno(String(turnoData.fecha).split('T')[0]);
            if (turnoData.hora) setHoraTurno(String(turnoData.hora).slice(0, 5));
          }
        }
      } catch (err) {
        if (!activo) return;
        console.error('Error al cargar datos:', err);
        toast.error('No se pudieron cargar los datos necesarios.');
      }
    };

    fetchDataInicial();

    return () => {
      activo = false;
    };
  }, [idEditando, especialidadUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPaciente = pacienteSeleccionado.trim();
    const finalEspecialidad = especialidadSeleccionada || especialidadUrl;
    const finalFecha = fechaUrl || fechaTurno;
    const horaRaw = horaUrl || horaTurno;
    const finalHora = horaRaw ? String(horaRaw).slice(0, 5) : '';

    if (!finalPaciente || !finalEspecialidad || !finalFecha || !finalHora) {
      toast.error('Por favor, complete todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      if (idEditando) {
        // Modo Edición
        await clientesAxios.put(`/turnos/${idEditando}`, {
          paciente: finalPaciente,
          especialidad: finalEspecialidad,
          fecha: finalFecha,
          hora: finalHora,
        });
        toast.success('¡Turno actualizado exitosamente!');
      } else {
        // Modo Creación (con médico por query params)
        if (!medicoId) {
          toast.error('Falta el médico asignado. Por favor, seleccione un horario desde la agenda.');
          setSubmitting(false);
          return;
        }

        const payload = {
          paciente: finalPaciente,
          medico: medicoId,
          especialidad: finalEspecialidad,
          fecha: finalFecha,
          hora: finalHora,
        };

        const endpoint = esUrgente ? '/turnos?urgencia=true' : '/turnos';
        await clientesAxios.post(endpoint, payload);
        toast.success(
          esUrgente ? '¡Turno urgente registrado exitosamente!' : '¡Turno registrado exitosamente!'
        );
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate('/turnos'), 1500);
      }
    } catch (err: unknown) {
      console.error('Error al guardar turno:', err);
      const errorObj = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const mensaje =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.error ||
        'Error al procesar la solicitud en el servidor.';
      toast.error(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelar = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '750px', borderRadius: '12px' }}>
        <PageHeader
          titulo={
            idEditando
              ? 'Editar Turno Médico'
              : esUrgente
                ? 'Registrar Turno Urgente'
                : 'Registrar Nuevo Turno'
          }
          subtitulo={
            esUrgente
              ? 'Ingreso rápido por guardia o demanda espontánea (no requiere paciente registrado).'
              : 'Confirme los datos del paciente y la cita médica.'
          }
          icon={
            esUrgente
              ? <BsLightningCharge className="me-2 text-danger" />
              : <BsCalendarPlus className="me-2" style={{ color: '#00ACB2' }} />
          }
          onBack={handleCancelar}
        />

        <form onSubmit={handleSubmit} className="mt-4">
          {/* Información precargada del Médico y Horario (si viene por agenda) */}
          {medicoNombre && (
            <div className={`row g-3 mb-4 p-3 rounded-3 border ${esUrgente ? 'bg-danger-subtle border-danger-subtle' : 'bg-light'}`}>
              <div className="col-md-6">
                <span className="text-muted small d-block mb-1">
                  <BsHeartPulse className="me-1 text-info" /> Profesional Asignado
                </span>
                <strong className="text-dark">{decodeURIComponent(medicoNombre)}</strong>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block mb-1">
                  <BsCalendarPlus className="me-1 text-info" /> Fecha
                </span>
                <strong className="text-dark">{fechaUrl}</strong>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block mb-1">
                  <BsClock className="me-1 text-info" /> Hora
                </span>
                <strong className={esUrgente ? 'text-danger fs-5' : 'text-success fs-5'}>
                  {horaUrl ? String(horaUrl).slice(0, 5) : ''}
                </strong>
              </div>
            </div>
          )}

          {/* Campo dinámico de Paciente: input libre si es urgente, select si es regular */}
          {esUrgente ? (
            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center text-secondary small">
                <BsPerson className="me-1" />
                Paciente (Nombre completo o DNI) <span className="text-danger ms-1">*</span>
              </label>
              <input
                type="text"
                className="form-control shadow-none"
                placeholder="Ej: Juan Pérez - DNI 32456789"
                value={pacienteSeleccionado}
                onChange={(e) => setPacienteSeleccionado(e.target.value)}
                required
              />
              <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
                Escriba el nombre y apellido o el número de documento del paciente para atención inmediata.
              </div>
            </div>
          ) : (
            <SelectField
              label="Seleccionar Paciente"
              labelIcon={<BsPerson className="me-1" />}
              value={pacienteSeleccionado}
              onChange={setPacienteSeleccionado}
              placeholder="Seleccione un paciente..."
              required
              selectClassName="form-select shadow-none"
              options={pacientes.map((pac: PacienteItem) => {
                const pacId = pac.id || pac.id || '';
                return {
                  value: pacId,
                  label: `${pac.apellido}, ${pac.nombre} ${pac.dni ? `- DNI: ${pac.dni}` : ''}`,
                };
              })}
            />
          )}

          <div className="mb-4">
            <label className="form-label fw-semibold d-flex align-items-center text-secondary small">
              <BsHeartPulse className="me-1" />
              Especialidad del Turno
            </label>
            <input
              type="text"
              className="form-control shadow-none bg-light text-secondary fw-medium"
              value={
                especialidades.find(
                  (esp: EspecialidadItem) => (esp._id) === especialidadSeleccionada
                )?.nombre || 'Cargando especialidad...'
              }
              readOnly
              disabled
            />
            <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
              La especialidad elegida.
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              className="btn btn-outline-danger text-danger border-danger px-3"
              onClick={handleCancelar}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn fw-semibold px-4 shadow-sm ${esUrgente ? 'btn-danger' : 'btn-outline-primary text-primary'}`}
              disabled={submitting}
            >
              {submitting
                ? 'Guardando...'
                : idEditando
                  ? 'Actualizar Turno'
                  : esUrgente
                    ? 'Confirmar Urgencia'
                    : 'Confirmar y Asignar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
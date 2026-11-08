import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { BsCalendarPlus, BsPerson, BsClock, BsHeartPulse } from 'react-icons/bs';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import type { PacienteItem, EspecialidadItem, TurnoFormProps } from './turno.schema';
import { TurnoSelectField } from './TurnoSelectField';

export const TurnoForm: React.FC<TurnoFormProps> = ({ turnoId, onSuccess, onCancel }) => {
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
    const fetchDataInicial = async () => {
      try {
        const [resPacientes, resEspecialidades] = await Promise.all([
          clientesAxios.get('/pacientes'),
          clientesAxios.get('/especialidades')
        ]);

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
          const turnoData = resTurno.data.data || resTurno.data;
          
          if (turnoData) {
            setPacienteSeleccionado(turnoData.paciente?._id || turnoData.paciente?.id || turnoData.paciente || '');
            setEspecialidadSeleccionada(turnoData.especialidad?._id || turnoData.especialidad?.id || turnoData.especialidad || '');
            if (turnoData.fecha) setFechaTurno(turnoData.fecha.split('T')[0]);
            if (turnoData.hora) setHoraTurno(turnoData.hora);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        toast.error('No se pudieron cargar los datos necesarios.');
      }
    };

    fetchDataInicial();
  }, [idEditando, especialidadUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalEspecialidad = especialidadSeleccionada || especialidadUrl;
    const finalFecha = fechaUrl || fechaTurno;
    const finalHora = horaUrl || horaTurno;

    if (!pacienteSeleccionado || !finalEspecialidad || !finalFecha || !finalHora) {
      toast.error('Por favor, complete todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      if (idEditando) {
        // Modo Edición
        await clientesAxios.put(`/turnos/${idEditando}`, {
          paciente: pacienteSeleccionado,
          especialidad: finalEspecialidad,
          fecha: finalFecha,
          hora: finalHora
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
          paciente: pacienteSeleccionado,
          medico: medicoId,
          especialidad: finalEspecialidad,
          fecha: finalFecha,
          hora: finalHora
        };

        await clientesAxios.post('/turnos', payload);
        toast.success('¡Turno registrado exitosamente!');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate('/turnos'), 1500);
      }

    } catch (err: unknown) {
      console.error('Error al guardar turno:', err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      const mensaje = errorObj.response?.data?.message || 'Error al procesar la solicitud en el servidor.';
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
          titulo={idEditando ? "Editar Turno Médico" : "Registrar Nuevo Turno"}
          subtitulo="Confirme los datos del paciente y la cita médica."
          icon={<BsCalendarPlus className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={handleCancelar}
        />

        <form onSubmit={handleSubmit} className="mt-4">
          
          {/* Información precargada del Médico y Horario (si viene por agenda) */}
          {medicoNombre && (
            <div className="row g-3 mb-4 p-3 bg-light rounded-3 border">
              <div className="col-md-6">
                <span className="text-muted small d-block mb-1"><BsHeartPulse className="me-1 text-info" /> Profesional Asignado</span>
                <strong className="text-dark">{decodeURIComponent(medicoNombre)}</strong>
                <p>{decodeURIComponent(especialidadSeleccionada)}</p>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block mb-1"><BsCalendarPlus className="me-1 text-info" /> Fecha</span>
                <strong className="text-dark">{fechaUrl}</strong>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block mb-1"><BsClock className="me-1 text-info" /> Hora</span>
                <strong className="text-success fs-5">{horaUrl}</strong>
              </div>
            </div>
          )}

          <TurnoSelectField
            label="Seleccionar Paciente"
            labelIcon={<BsPerson className="me-1" />}
            value={pacienteSeleccionado}
            onChange={setPacienteSeleccionado}
            placeholder="Seleccione un paciente..."
            required
            selectClassName="form-select shadow-none"
            options={pacientes.map((pac: PacienteItem) => {
              const pacId = pac.id || pac.id;
              return {
                value: pacId,
                label: `${pac.apellido}, ${pac.nombre} ${pac.dni ? `- DNI: ${pac.dni}` : ''}`,
              };
            })}
          />

          <TurnoSelectField
            label="Especialidad del Turno"
            labelIcon={<BsHeartPulse className="me-1" />}
            value={especialidadSeleccionada}
            onChange={setEspecialidadSeleccionada}
            placeholder="Seleccione la especialidad..."
            required
            disabled={Boolean(especialidadUrl)}
            className="mb-4"
            selectClassName="form-select shadow-none bg-light"
            options={especialidades.map((esp: EspecialidadItem) => ({
              value: esp._id || esp._id,
              label: esp.nombre,
            }))}
            helpText={especialidadUrl ? (
              <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
                La especialidad está fijada por la selección previa en la agenda.
              </div>
            ) : undefined}
          />

          {/* Botones de acción */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button 
              type="button" 
              className="btn btn-light px-4" 
              onClick={handleCancelar}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn text-white fw-semibold px-4 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : (idEditando ? 'Actualizar Turno' : 'Confirmar y Asignar Turno')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
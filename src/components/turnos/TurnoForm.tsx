import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import { isAxiosError } from 'axios';
import {
  BsCalendarPlus,
  BsPerson,
  BsClock,
  BsHeartPulse,
  BsLightningCharge,
} from 'react-icons/bs';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { useAuth } from '../../context/AuthContext';
import type { PacienteItem, EspecialidadItem, TurnoFormProps } from './turno.schema';
import { SelectField } from '../../constants/SelectField';

const obtenerIdEntidad = (item?: { id?: string; _id?: string } | null): string =>
  item ? String(item.id || item._id || '') : '';

export const TurnoForm = ({ turnoId, onSuccess, onCancel }: TurnoFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: idParam } = useParams<{ id: string }>();
  const { rol, usuario } = useAuth() as {
    rol?: string;
    usuario?: {
      id?: string;
      _id?: string;
      email?: string;
      nombre?: string;
      apellido?: string;
      dni?: string;
    };
  };

  const rolActual = (rol || '').toUpperCase();
  const esPaciente = rolActual === 'PACIENTE';

  const idEditando = turnoId || idParam;

  const medicoId = searchParams.get('medico');
  const medicoNombre = searchParams.get('nombre');
  const especialidadUrl = searchParams.get('especialidad');
  const fechaUrl = searchParams.get('fecha');
  const horaUrl = searchParams.get('hora');
  const esUrgente = !esPaciente && searchParams.get('urgencia') === 'true';

  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);
  const [especialidades, setEspecialidades] = useState<EspecialidadItem[]>([]);

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>('');
  const [datosPacienteLogueado, setDatosPacienteLogueado] = useState<string>('');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>(
    especialidadUrl || ''
  );
  const [fechaTurno, setFechaTurno] = useState<string>(fechaUrl || '');
  const [horaTurno, setHoraTurno] = useState<string>(horaUrl || '');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!rolActual) return;

    let activo = true;

    const fetchDataInicial = async () => {
      try {
        const resEspecialidades = await clientesAxios.get('/especialidades');
        if (!activo) return;

        const dataEsp =
          resEspecialidades.data?.data?.especialidades ||
          resEspecialidades.data?.data ||
          resEspecialidades.data ||
          [];
        const listaEsp = Array.isArray(dataEsp) ? dataEsp : [];
        setEspecialidades(listaEsp);

        if (especialidadUrl && especialidadUrl.length !== 24) {
          const encontrada = listaEsp.find(
            (esp: EspecialidadItem) =>
              esp.nombre?.toLowerCase() === especialidadUrl.toLowerCase()
          );
          if (encontrada) {
            setEspecialidadSeleccionada(obtenerIdEntidad(encontrada));
          }
        }

        if (esPaciente && !idEditando) {
          let pacienteActual: PacienteItem | undefined;

          try {
            const resPerfil = await clientesAxios.get('/pacientes/mi-perfil');
            const perfilData = resPerfil.data?.data || resPerfil.data;
            if (perfilData && (perfilData.id || perfilData._id)) {
              pacienteActual = perfilData;
            }
          } catch {
            // Si no existe ese endpoint, se usan los datos disponibles en sesión
          }

          if (!activo) return;

          if (pacienteActual) {
            setPacienteSeleccionado(obtenerIdEntidad(pacienteActual));
            const textoPerfil = `${pacienteActual.apellido || ''}${
              pacienteActual.apellido && pacienteActual.nombre ? ', ' : ''
            }${pacienteActual.nombre || ''}${
              pacienteActual.dni ? ` - DNI: ${pacienteActual.dni}` : ''
            }`.trim();
            setDatosPacienteLogueado(textoPerfil || 'Paciente autenticado');
          } else {
            const pacIdFallback = String(usuario?.id || usuario?._id || '');
            setPacienteSeleccionado(pacIdFallback);
            const textoFallback = `${usuario?.apellido || ''}${
              usuario?.apellido && usuario?.nombre ? ', ' : ''
            }${usuario?.nombre || ''}${usuario?.dni ? ` - DNI: ${usuario.dni}` : ''}`.trim();
            setDatosPacienteLogueado(textoFallback || usuario?.email || 'Paciente autenticado');
          }
        } else if (!esPaciente) {
          const resPacientes = await clientesAxios.get('/pacientes');
          if (!activo) return;

          const dataPac =
            resPacientes.data?.data?.pacientes ||
            resPacientes.data?.data ||
            resPacientes.data ||
            [];
          setPacientes(Array.isArray(dataPac) ? dataPac : []);
        }

        if (idEditando) {
          const resTurno = await clientesAxios.get(`/turnos/${idEditando}`);
          if (!activo) return;

          const turnoData = resTurno.data?.data || resTurno.data?.turno || resTurno.data;
          if (turnoData) {
            const pacRef = turnoData.paciente;
            const pacValor =
              typeof pacRef === 'object' && pacRef !== null
                ? obtenerIdEntidad(pacRef)
                : pacRef || '';

            const espRef = turnoData.especialidad;
            const espValor =
              typeof espRef === 'object' && espRef !== null
                ? obtenerIdEntidad(espRef)
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

    void fetchDataInicial();

    return () => {
      activo = false;
    };
  }, [idEditando, especialidadUrl, esPaciente, rolActual, usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPaciente = pacienteSeleccionado.trim();
    const finalEspecialidad = especialidadSeleccionada || especialidadUrl;
    const finalFecha = fechaUrl || fechaTurno;
    const horaRaw = horaUrl || horaTurno;
    const finalHora = horaRaw ? String(horaRaw).slice(0, 5) : '';

    if (!finalEspecialidad || !finalFecha || !finalHora || (!esPaciente && !finalPaciente)) {
      toast.error('Por favor, complete todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      if (idEditando) {
        await clientesAxios.put(`/turnos/${idEditando}`, {
          paciente: finalPaciente,
          especialidad: finalEspecialidad,
          fecha: finalFecha,
          hora: finalHora,
        });
        toast.success('¡Turno actualizado exitosamente!');
      } else {
        if (!medicoId) {
          toast.error(
            'Falta el médico asignado. Por favor, seleccione un horario desde la agenda.'
          );
          setSubmitting(false);
          return;
        }

        if (esPaciente) {
          await clientesAxios.post('/turnos/mis-turnos', {
            medico: medicoId,
            especialidad: finalEspecialidad,
            fecha: finalFecha,
            hora: finalHora,
          });
          toast.success('¡Turno solicitado exitosamente!');
        } else {
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
            esUrgente
              ? '¡Turno urgente registrado exitosamente!'
              : '¡Turno registrado exitosamente!'
          );
        }
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate(esPaciente ? '/mis-turnos' : '/turnos'), 1500);
      }
    } catch (err: unknown) {
      console.error('Error al guardar turno:', err);
      const mensaje = isAxiosError<{ message?: string; error?: string }>(err)
        ? err.response?.data?.message ||
          err.response?.data?.error ||
          'Error al procesar la solicitud en el servidor.'
        : 'Error al procesar la solicitud en el servidor.';
      toast.error(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelar = () => {
    if (onCancel) {
      onCancel();
    } else {
      goBackSafe(navigate, esPaciente ? '/mis-turnos' : '/turnos');
    }
  };

  const especialidadEncontrada = especialidades.find(
    (esp: EspecialidadItem) => obtenerIdEntidad(esp) === especialidadSeleccionada
  );

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <div
        className="card border-0 shadow-sm bg-white p-4 mx-auto"
        style={{ maxWidth: '750px', borderRadius: '12px' }}
      >
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
              : esPaciente
                ? 'Verificá tus datos y confirmá la cita médica.'
                : 'Confirme los datos del paciente y la cita médica.'
          }
          icon={
            esUrgente ? (
              <BsLightningCharge className="me-2 text-danger" />
            ) : (
              <BsCalendarPlus className="me-2" style={{ color: '#00ACB2' }} />
            )
          }
          onBack={handleCancelar}
        />

        <form onSubmit={handleSubmit} className="mt-4">
          {medicoNombre && (
            <div
              className={`row g-3 mb-4 p-3 rounded-3 border ${
                esUrgente ? 'bg-danger-subtle border-danger-subtle' : 'bg-light'
              }`}
            >
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
                <strong className="text-dark">{fechaUrl || fechaTurno}</strong>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block mb-1">
                  <BsClock className="me-1 text-info" /> Hora
                </span>
                <strong className={esUrgente ? 'text-danger fs-5' : 'text-success fs-5'}>
                  {horaUrl ? String(horaUrl).slice(0, 5) : horaTurno}
                </strong>
              </div>
            </div>
          )}

          {esPaciente && !idEditando ? (
            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center text-secondary small">
                <BsPerson className="me-1" />
                Paciente
              </label>
              <input
                type="text"
                className="form-control shadow-none bg-light text-dark fw-medium"
                value={datosPacienteLogueado || 'Cargando datos del paciente...'}
                readOnly
                disabled
              />
            </div>
          ) : esUrgente ? (
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
                Escriba el nombre y apellido o el número de documento del paciente para atención
                inmediata.
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
              options={pacientes.map((pac: PacienteItem) => ({
                value: obtenerIdEntidad(pac),
                label: `${pac.apellido}, ${pac.nombre}${pac.dni ? ` - DNI: ${pac.dni}` : ''}`,
              }))}
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
              value={especialidadEncontrada?.nombre || 'Cargando especialidad...'}
              readOnly
              disabled
            />
            <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
              La especialidad elegida.
            </div>
          </div>

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
              className={`btn fw-semibold px-4 shadow-sm ${
                esUrgente ? 'btn-danger' : 'btn-outline-primary text-primary'
              }`}
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
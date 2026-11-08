import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clientesAxios from '../../config/axios';
import { toast } from 'sonner';
import { BsCalendarCheck } from 'react-icons/bs';
import type { PacienteItem, MedicoItem, EspecialidadItem } from './turno.schema';
import { TurnoFormSkeleton } from './TurnoFormSkeleton';
import { TurnoSelectField } from './TurnoSelectField';
import { PageHeader } from '../../constants/PageHeader'; 

export const EditarTurnoView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Listas para los selects
  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [especialidades, setEspecialidades] = useState<EspecialidadItem[]>([]);

  // Estados del formulario
  const [pacienteId, setPacienteId] = useState<string>('');
  const [medicoId, setMedicoId] = useState<string>('');
  const [especialidadId, setEspecialidadId] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [hora, setHora] = useState<string>('');

  // 1. Cargar datos iniciales (Listas de selectores + Datos del Turno actual)
  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        setLoading(true);

        const [resTurno, resPacientes, resMedicos, resEspecialidades] = await Promise.all([
          clientesAxios.get(`/turnos/${id}`),
          clientesAxios.get('/pacientes').catch(() => ({ data: [] })),
          clientesAxios.get('/medicos').catch(() => ({ data: [] })),
          clientesAxios.get('/especialidades').catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        const dataPacientes = resPacientes.data?.data || resPacientes.data || [];
        const dataMedicos = resMedicos.data?.data || resMedicos.data || [];
        const dataEspecialidades = resEspecialidades.data?.data || resEspecialidades.data || [];

        setPacientes(Array.isArray(dataPacientes) ? dataPacientes : []);
        setMedicos(Array.isArray(dataMedicos) ? dataMedicos : []);
        setEspecialidades(Array.isArray(dataEspecialidades) ? dataEspecialidades : []);

        if (resTurno.data && resTurno.data.ok) {
          const turno = resTurno.data.data;
          
          const idPac = turno.paciente?._id || turno.paciente?.id || turno.paciente || '';
          const idMed = turno.medico?._id || turno.medico?.id || turno.medico || '';
          const idEsp = turno.especialidad?._id || turno.especialidad?.id || turno.especialidad || '';

          setPacienteId(idPac);
          setMedicoId(idMed);
          setEspecialidadId(idEsp);

          if (turno.fecha) {
            const fechaIso = new Date(turno.fecha).toISOString().split('T')[0];
            setFecha(fechaIso);
          }
          
          setHora(turno.hora || '');
        } else {
          setError('No se pudo cargar la información del turno.');
        }

      } catch (err) {
        console.error('Error al cargar datos de edición:', err);
        if (isMounted) setError('Error al conectar con el servidor.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      cargarDatos();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Manejar la actualización
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      const datosActualizados = {
        paciente: pacienteId,
        medico: medicoId,
        especialidad: especialidadId,
        fecha,
        hora,
      };

      const response = await clientesAxios.put(`/turnos/${id}`, datosActualizados);

      if (response.data && response.data.ok) {
        toast.success('¡Turno actualizado exitosamente!');
        navigate('/turnos');
      } else {
        setError(response.data.message || 'No se pudo actualizar el turno.');
      }
    } catch (err: unknown) {
      console.error('Error al actualizar el turno:', err);
      const mensajeError = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Ocurrió un error al guardar los cambios.';
      setError(mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <TurnoFormSkeleton />;
  }

  return (
    <div className="container py-4" style={{ maxWidth: '700px' }}>
      <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>

        <PageHeader 
          titulo="Editar Turno Médico"
          subtitulo="Confirme los datos del paciente y la cita médica."
          icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
          onBack={() => navigate('/turnos')}
        />

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <TurnoSelectField
            label="Seleccionar Paciente"
            value={pacienteId}
            onChange={setPacienteId}
            placeholder="Seleccione un paciente..."
            required
            options={pacientes.map((p: PacienteItem) => {
              const pId = p.id || p.id || '';
              return {
                value: pId,
                label: `${p.apellido.toUpperCase()}, ${p.nombre} - DNI: ${p.dni}`,
              };
            })}
          />

          <TurnoSelectField
            label="Especialidad del Turno"
            value={especialidadId}
            onChange={setEspecialidadId}
            placeholder="Seleccione una especialidad..."
            required
            options={especialidades.map((esp: EspecialidadItem) => ({
              value: esp._id || esp._id || '',
              label: esp.nombre.toUpperCase(),
            }))}
          />

          <TurnoSelectField
            label="Médico Asignado"
            value={medicoId}
            onChange={setMedicoId}
            placeholder="Seleccione un médico..."
            required
            options={medicos.map((med: MedicoItem) => ({
              value: med.id || med._id || '',
              label: `Dr./Dra. ${med.nombre} ${med.apellido}`,
            }))}
          />

          {/* Fila para Fecha y Hora */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-secondary small">Fecha del Turno</label>
              <input 
                type="date" 
                className="form-control" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                required 
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-secondary small">Hora (Ej: 08:30)</label>
              <input 
                type="text" 
                className="form-control" 
                value={hora} 
                onChange={(e) => setHora(e.target.value)} 
                placeholder="08:30" 
                required 
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button 
              type="button" 
              className="btn btn-light px-4" 
              onClick={() => navigate('/turnos')}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn text-white fw-semibold px-4" 
              style={{ backgroundColor: '#00ACB2' }}
              disabled={guardando}
            >
              {guardando ? 'Actualizando...' : 'Actualizar Turno'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
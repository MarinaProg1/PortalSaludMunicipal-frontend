import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPlusCircle, BsSearch, BsCalendarCheck } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { TurnosSkeleton } from './TurnosSkeleton';
import type { TurnoItem } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { TurnoCard } from './TurnoCard';
import { esFechaDeHoy } from './turno.utils';
import { ConfirmDeleteModal } from '../../constants/ConfirmDeleteModal';

export const TurnosLista: React.FC = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

const [idTurnoAEliminar, setIdTurnoAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTurnos = async () => {
      try {
        const response = await clientesAxios.get('/turnos');
        
        if (isMounted) {
          const dataApi = response.data;
          let listaTurnos: TurnoItem[] = [];
          if (Array.isArray(dataApi)) {
            listaTurnos = dataApi;
          } else if (dataApi && Array.isArray(dataApi.turnos)) {
            listaTurnos = dataApi.turnos;
          } else if (dataApi && Array.isArray(dataApi.data)) {
            listaTurnos = dataApi.data;
          }

          setTurnos(listaTurnos);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar los turnos:', err);
        if (isMounted) {
          setError('No se pudo conectar con el servidor para cargar los turnos.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTurnos();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleView = (id: string) => {
    navigate(`/turno-detalle/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/turnos/editar/${id}`);
  };

 const handleOpenDeleteModal = (id: string) => {
    setIdTurnoAEliminar(id);
  };

  const handleConfirmDelete = async () => {
    if (!idTurnoAEliminar) return;

    setEliminando(true);
    try {
      await clientesAxios.delete(`/turnos/${idTurnoAEliminar}`);
      setTurnos(turnos.filter(t => t.id !== idTurnoAEliminar));
      toast.success('Turno eliminado correctamente.');
      setIdTurnoAEliminar(null); // Cierra el modal
    } catch (err) {
      console.error('Error al eliminar el turno:', err);
      toast.error('Hubo un error al intentar eliminar el registro.');
    } finally {
      setEliminando(false);
    }
  };

  // Función para marcar turno como atendido
  const handleMarcarAtendido = async (id: string) => {
    try {
      const response = await clientesAxios.patch(`/turnos/${id}/atendido`);
      
      setTurnos(prevTurnos => 
        prevTurnos.map(t => t.id === id ? { ...t, estado: response.data?.data?.estado || 'ATENDIDO' } : t)
      );

      toast.success(response.data?.message || '¡Turno marcado como atendido con éxito!');
    } catch (err: unknown) {
      console.error('Error al marcar como atendido:', err);
      const mensaje = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'No se pudo marcar el turno como atendido.'
        : 'No se pudo marcar el turno como atendido.';
      toast.error(mensaje);
    }
  };

 const turnosFiltrados = Array.isArray(turnos) 
    ? turnos
        .filter(t => {
          const nombrePaciente = `${t.paciente?.nombre || ''} ${t.paciente?.apellido || ''}`.toLowerCase();
          const nombreMedico = `${t.medico?.nombre || ''} ${t.medico?.apellido || ''}`.toLowerCase();
          const termino = busqueda.toLowerCase();

          return nombrePaciente.includes(termino) || nombreMedico.includes(termino);
        })
        .sort((a, b) => {
          const esHoyA = esFechaDeHoy(a.fecha);
          const esHoyB = esFechaDeHoy(b.fecha);

          // 1. Si el turno 'a' es de hoy y 'b' no, 'a' va primero (-1)
          if (esHoyA && !esHoyB) return -1;
          // 2. Si el turno 'b' es de hoy y 'a' no, 'b' va primero (1)
          if (!esHoyA && esHoyB) return 1;

          // 3. Si ambos son de hoy (o ninguno lo es), los ordenamos cronológicamente (de menor a mayor fecha/hora)
          const fechaA = new Date(a.fecha).getTime();
          const fechaB = new Date(b.fecha).getTime();

          if (fechaA !== fechaB) {
            return fechaA - fechaB;
          }

          // Opcional: Si tienen la misma fecha, los ordenamos por hora si la propiedad existe
          return (a.hora || '').localeCompare(b.hora || '');
        })
    : [];

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
    
      <PageHeader 
        titulo="Gestión de Turnos Médicos"
        subtitulo="Control y administración de turnos asignados en la salita."
        icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
        rightContent={
          <button 
            className="btn text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            style={{ backgroundColor: '#00ACB2', borderRadius: '10px', padding: '8px 16px' }}
            onClick={() => navigate('/turnos/asignar')} 
          >
            <BsPlusCircle size={18} />
            Asignar Nuevo Turno
          </button>
        }
      />

      {/* Buscador */}
      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted">
              <BsSearch size={18} />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 shadow-none ps-0" 
              placeholder="Buscar por paciente o médico..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Renderizado condicional */}
      {loading ? (
        <TurnosSkeleton />
      ) : error ? (
        <div className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center" style={{ borderRadius: '12px' }}>
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : turnosFiltrados.length > 0 ? (
        
        <div className="row g-3">
          {turnosFiltrados.map((turno) => (
            <TurnoCard
              key={turno.id}
              turno={turno}
              onView={() => handleView(turno.id)}
              onEdit={() => handleEdit(turno.id)}
              onDelete={() => handleOpenDeleteModal(turno.id)}
              onMarkAttended={() => handleMarcarAtendido(turno.id)}
            />
          ))}
          <ConfirmDeleteModal 
        isOpen={idTurnoAEliminar !== null}
        titulo="Confirmar Cancelación de Turno"
        mensaje="¿Estás seguro de que deseas cancelar y eliminar este turno? Esta acción no se puede deshacer."
        cargando={eliminando}
        onClose={() => setIdTurnoAEliminar(null)}
        onConfirm={handleConfirmDelete}
      />
        </div>

      ) : (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">No se encontraron turnos registrados en la base de datos.</p>
        </div>
      )}

    </div>
  );
};
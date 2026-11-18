import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCalendarDate, BsSearch } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { TurnosSkeleton } from './TurnosSkeleton';
import type { TurnoItem } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';
import { TurnoCard } from './TurnoCard';
import { toast } from 'sonner';

export const TurnosPorFecha = () => {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaSeleccionada) {
      toast.error('Por favor seleccione una fecha.');
      return;
    }

    setLoading(true);
    setBuscado(true);
    try {
      const response = await clientesAxios.get(`/turnos?fecha=${fechaSeleccionada}`);
      const dataApi = response.data;
      
      let lista: TurnoItem[] = [];
      if (Array.isArray(dataApi)) lista = dataApi;
      else if (Array.isArray(dataApi.turnos)) lista = dataApi.turnos;
      else if (Array.isArray(dataApi.data)) lista = dataApi.data;

      setTurnos(lista);
    } catch (err) {
      console.error('Error al buscar turnos por fecha:', err);
      toast.error('Error al consultar los turnos de la fecha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader 
        titulo="Consultar Turnos por Fecha"
        subtitulo="Seleccione un día para ver el detalle de turnos asignados."
        icon={<BsCalendarDate className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate('/turnos')}
      />

      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <form onSubmit={handleBuscar} className="row g-2 align-items-center">
            <div className="col-12 col-md-8">
              <input 
                type="date" 
                className="form-control shadow-none"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <button 
                type="submit" 
                className="btn text-white w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: '#00ACB2', borderRadius: '6px' }}
              >
                <BsSearch size={16} /> Buscar Turnos
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <TurnosSkeleton />
      ) : buscado ? (
        turnos.length > 0 ? (
          <div className="row g-3">
            {turnos.map((turno) => (
              <TurnoCard 
                key={turno.id}
                turno={turno}
                onView={() => navigate(`/turno-detalle/${turno.id}`)}
                onEdit={() => navigate(`/turnos/editar/${turno.id}`)}
                onCancel={() => {}}
                onDelete={() => {}}
                onMarkAttended={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
            <p className="text-muted mb-0">No se encontraron turnos para la fecha {fechaSeleccionada}.</p>
          </div>
        )
      ) : null}
    </div>
  );
};
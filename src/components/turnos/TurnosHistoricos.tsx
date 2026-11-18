import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsClockHistory } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { TurnosSkeleton } from './TurnosSkeleton';
import type { TurnoItem } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';
import { TurnoCard } from './TurnoCard';
import { toast } from 'sonner';

export const TurnosHistoricos = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricos = async () => {
      try {
        const response = await clientesAxios.get('/turnos/pendientes-historicos');
        const dataApi = response.data;
        
        let lista: TurnoItem[] = [];
        if (Array.isArray(dataApi)) lista = dataApi;
        else if (Array.isArray(dataApi.turnos)) lista = dataApi.turnos;
        else if (Array.isArray(dataApi.data)) lista = dataApi.data;

        setTurnos(lista);
      } catch (err) {
        console.error('Error al cargar turnos históricos:', err);
        toast.error('No se pudo cargar la auditoría de turnos.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricos();
  }, []);

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader 
        titulo="Turnos Pendientes Históricos"
        subtitulo="Auditoría de turnos pasados que no fueron marcados como atendidos o cancelados."
        icon={<BsClockHistory className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate('/turnos')}
      />

      {loading ? (
        <TurnosSkeleton />
      ) : turnos.length > 0 ? (
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
          <p className="text-muted mb-0">No hay turnos pendientes en el histórico.</p>
        </div>
      )}
    </div>
  );
};
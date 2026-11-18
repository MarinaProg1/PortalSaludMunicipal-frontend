import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCalendarDay } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { TurnosSkeleton } from './TurnosSkeleton';
import type { TurnoItem } from './turno.schema';
import { PageHeader } from '../../constants/PageHeader';
import { TurnoCard } from './TurnoCard';
import { toast } from 'sonner';

export const TurnosDelDia = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const obtenerHoyStr = () => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  };

  useEffect(() => {
    const fetchTurnosHoy = async () => {
      try {
        const hoy = obtenerHoyStr();
        // Usamos tu endpoint general enviando el parámetro fecha
        const response = await clientesAxios.get(`/turnos?fecha=${hoy}`);
        const dataApi = response.data;
        
        let lista: TurnoItem[] = [];
        if (Array.isArray(dataApi)) lista = dataApi;
        else if (Array.isArray(dataApi.turnos)) lista = dataApi.turnos;
        else if (Array.isArray(dataApi.data)) lista = dataApi.data;

        setTurnos(lista);
      } catch (err) {
        console.error('Error al cargar turnos del día:', err);
        toast.error('No se pudieron cargar los turnos de hoy.');
      } finally {
        setLoading(false);
      }
    };

    fetchTurnosHoy();
  }, []);

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader 
        titulo="Turnos del Día"
        subtitulo={`Programación para hoy (${new Date().toLocaleDateString()})`}
        icon={<BsCalendarDay className="me-2" style={{ color: '#00ACB2' }} />}
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
          <p className="text-muted mb-0">No hay turnos programados para el día de hoy.</p>
        </div>
      )}
    </div>
  );
};
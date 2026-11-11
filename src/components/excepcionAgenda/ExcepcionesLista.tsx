import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPlusCircle, BsSearch, BsCalendarX, BsCalendarEvent, BsClock, BsExclamationTriangle } from 'react-icons/bs';
import clientesAxios from '../../config/axios';
import { PageHeader } from '../../constants/PageHeader';
import { ConfirmDeleteModal } from '../../constants/ConfirmDeleteModal';
import { toast } from 'sonner';
import type { ExcepcionItem, MedicoPopulate } from './excepcion.schema';

export const ExcepcionesLista: React.FC = () => {
  const navigate = useNavigate();
  const [excepciones, setExcepciones] = useState<ExcepcionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Estados para el modal de desactivación
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [desactivando, setDesactivando] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchExcepciones = async () => {
      try {
        const response = await clientesAxios.get('/excepciones');
        if (isMounted) {
          const dataApi = response.data;
          let lista: ExcepcionItem[] = [];
          if (Array.isArray(dataApi)) {
            lista = dataApi;
          } else if (dataApi && typeof dataApi === 'object') {
            const record = dataApi as Record<string, unknown>;
            if (Array.isArray(record.data)) lista = record.data as ExcepcionItem[];
          }
          setExcepciones(lista);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar excepciones:', err);
        if (isMounted) setError('No se pudo conectar con el servidor para cargar las excepciones.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExcepciones();
    return () => { isMounted = false; };
  }, []);

  const handleConfirmDesactivar = async () => {
    if (!idAEliminar) return;

    setDesactivando(true);
    try {
      await clientesAxios.delete(`/excepciones/${idAEliminar}`);
      setExcepciones(prev => prev.filter(e => e.id !== idAEliminar));
      toast.success('Excepción desactivada correctamente. El médico recupera su horario habitual.');
      setIdAEliminar(null);
    } catch (err) {
      console.error('Error al desactivar excepción:', err);
      toast.error('Hubo un error al intentar desactivar el registro.');
    } finally {
      setDesactivando(false);
    }
  };

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    return fechaStr.split('T')[0].split('-').reverse().join('/');
  };

  const excepcionesFiltradas = excepciones.filter(e => {
    const medicoObj = typeof e.medico === 'object' && e.medico !== null ? (e.medico as MedicoPopulate) : null;
    const nombreMed = medicoObj ? `${medicoObj.nombre} ${medicoObj.apellido}`.toLowerCase() : '';
    const motivo = (e.motivo || '').toLowerCase();
    const tipo = (e.tipo || '').toLowerCase();
    const termino = busqueda.toLowerCase();

    return nombreMed.includes(termino) || motivo.includes(termino) || tipo.includes(termino);
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      
      <PageHeader 
        titulo="Excepciones y Licencias de Agenda"
        subtitulo="Administra los días no laborables, vacaciones o modificaciones de horarios médicos."
        icon={<BsCalendarX className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
        rightContent={
          <button 
            className="btn text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            style={{ backgroundColor: '#00ACB2', borderRadius: '10px', padding: '8px 16px' }}
            onClick={() => navigate('/excepciones/nuevo')} 
          >
            <BsPlusCircle size={18} />
            Registrar Excepción
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
              placeholder="Buscar por médico, motivo o tipo de excepción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Cargando excepciones...</p>
        </div>
      ) : error ? (
        <div className="card border-0 shadow-sm bg-danger-subtle text-danger p-4 text-center" style={{ borderRadius: '12px' }}>
          <p className="mb-0 fw-semibold">{error}</p>
        </div>
      ) : excepcionesFiltradas.length > 0 ? (
        <div className="row g-3">
          {excepcionesFiltradas.map((exc) => {
            const medicoObj = typeof exc.medico === 'object' && exc.medico !== null ? (exc.medico as MedicoPopulate) : null;
            const nombreMedico = medicoObj ? `Dr./Dra. ${medicoObj.nombre} ${medicoObj.apellido}` : 'Médico asignado';

            return (
              <div className="col-12 col-md-6" key={exc.id}>
                <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column justify-content-between" style={{ borderRadius: '12px' }}>
                  
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="text-muted small d-block">Profesional</span>
                        <h6 className="fw-bold text-dark mb-0 fs-5">{nombreMedico}</h6>
                      </div>
                      <span className="badge bg-warning-subtle text-warning text-dark px-2 py-1 text-uppercase">
                        {exc.tipo.replace('_', ' ')}
                      </span>
                    </div>

                    <hr className="my-2 border-secondary-subtle" />

                    <div className="small mb-3">
                      <div className="d-flex align-items-center gap-2 text-secondary mb-1">
                        <BsCalendarEvent size={14}  />
                        <span className="fw-semibold text-dark">Fecha: {formatearFecha(exc.fecha)}</span>
                      </div>

                      {exc.horaInicio && exc.horaFin && (
                        <div className="d-flex align-items-center gap-2 text-secondary mb-1">
                          <BsClock size={14}  />
                          <span className="fw-semibold text-dark">Horario modificado: {exc.horaInicio} - {exc.horaFin} hs</span>
                        </div>
                      )}

                      <div className="mt-2 text-muted bg-light p-2 rounded-2">
                        <span className="fw-semibold text-dark d-block">Motivo:</span>
                        {exc.motivo}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-end pt-2 border-top border-secondary-subtle">
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-3 py-1 fw-semibold"
                      style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                      onClick={() => setIdAEliminar(exc.id)}
                    >
                      <BsExclamationTriangle size={14} />
                      Desactivar / Eliminar
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">No se encontraron excepciones o licencias registradas.</p>
        </div>
      )}

      {/* Modal de confirmación para desactivar */}
      <ConfirmDeleteModal 
        isOpen={idAEliminar !== null}
        titulo="Desactivar Excepción de Agenda"
        mensaje="¿Estás seguro de que deseas desactivar esta excepción? El médico recuperará su horario habitual de atención."
        cargando={desactivando}
        onClose={() => setIdAEliminar(null)}
        onConfirm={handleConfirmDesactivar}
      />

    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPeople, BsPlusCircle, BsSearch } from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { ActionButtons } from '../../constants/ActionButtons';
import { MedicoSkeleton } from './MedicoSkeleton';
import { medicoService } from '../../services/medico.service';
import { getEspecialidadesNombres, getMedicoId, getTelefonoTexto, type MedicoItem } from './medico.schema';
import toast from 'react-hot-toast';

export const MedicoLista: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MedicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await medicoService.listar();
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (mounted) toast.error('No se pudieron cargar los médicos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtrados = items.filter((m) => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;

    const especialidades = getEspecialidadesNombres(m).join(' ').toLowerCase();
    const telefono = getTelefonoTexto(m).toLowerCase();

    return (
      `${m.nombre} ${m.apellido}`.toLowerCase().includes(termino) ||
      especialidades.includes(termino) ||
      (m.dni || '').includes(termino) ||
      (m.email || '').toLowerCase().includes(termino) ||
      String(m.numeroMatricula || '').includes(termino) ||
      telefono.includes(termino)
    );
  });

  const handleEliminar = async (id: string, nombre: string) => {
    if (!id) return;
    if (!window.confirm(`¿Desactivar al médico ${nombre}?`)) return;

    try {
      setEliminando(id);
      await medicoService.eliminar(id);
      setItems((prev) => prev.filter((m) => getMedicoId(m) !== id));
      toast.success('Médico desactivado');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo desactivar el médico');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Médicos"
        subtitulo="Profesionales registrados en el sistema."
        icon={<BsPeople className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
        rightContent={
          <button
            className="btn btn-sm text-white fw-semibold d-flex align-items-center gap-1"
            style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
            onClick={() => navigate('/medicos/nuevo')}
          >
            <BsPlusCircle /> Nuevo médico
          </button>
        }
      />

      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted">
              <BsSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none ps-0"
              placeholder="Buscar por nombre, especialidad, matrícula, DNI o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <MedicoSkeleton />
      ) : filtrados.length > 0 ? (
        <div className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase fs-7 text-secondary border-bottom">
                <tr>
                  <th className="py-3 px-4">Médico</th>
                  <th className="py-3">Especialidades</th>
                  <th className="py-3">Matrícula</th>
                  <th className="py-3">DNI</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Teléfono</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3 px-4 text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((m) => {
                  const id = getMedicoId(m) || `${m.dni}-${m.numeroMatricula}`;
                  const especialidades = getEspecialidadesNombres(m);
                  const telefono = getTelefonoTexto(m);

                  return (
                    <tr key={id} style={{ opacity: eliminando === id ? 0.5 : 1 }}>
                      <td className="px-4 fw-semibold text-dark">
                        {m.apellido}, {m.nombre}
                      </td>
                      <td className="text-muted">
                        {especialidades.length > 0 ? especialidades.join(', ') : '-'}
                      </td>
                      <td className="text-muted">{m.numeroMatricula ?? '-'}</td>
                      <td className="text-muted">{m.dni || '-'}</td>
                      <td className="text-muted">{m.email || '-'}</td>
                      <td className="text-muted">{telefono || '-'}</td>
                      <td>
                        <span
                          className={`badge px-2 py-1 ${
                            m.activo === false
                              ? 'bg-danger-subtle text-danger'
                              : 'bg-success-subtle text-success'
                          }`}
                        >
                          {m.activo === false ? 'INACTIVO' : 'ACTIVO'}
                        </span>
                      </td>
                      <td className="px-4">
                        <ActionButtons
                          onView={() => navigate(`/medicos/${id}`)}
                          onEdit={() => navigate(`/medicos/editar/${id}`)}
                          onDelete={() => handleEliminar(id, `${m.apellido}, ${m.nombre}`)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: '12px' }}>
          <p className="text-muted mb-0">No se encontraron médicos.</p>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsHeartPulse, BsPlusCircle, BsSearch } from 'react-icons/bs';
import { ActionButtons } from '../../constants/ActionButtons';
import { PageHeader } from '../../constants/PageHeader';
import { pacienteService } from '../../services/paciente.service';
import { obraSocialService } from '../../services/obraSocial.service';
import { getPacienteId, type PacienteItem } from './paciente.schema';
import type { ObraSocialItem } from '../obrasSociales/obraSocial.schema';
import toast from 'react-hot-toast';

export const PacienteLista: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PacienteItem[]>([]);
  const [obras, setObras] = useState<ObraSocialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      const [pacientes, obrasSociales] = await Promise.all([
        pacienteService.listar(),
        obraSocialService.listar(true).catch(() => []),
      ]);
      setItems(Array.isArray(pacientes) ? pacientes : []);
      setObras(Array.isArray(obrasSociales) ? obrasSociales : []);
    } catch (e) {
      console.error(e);
      toast.error('No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const obrasMap = useMemo(() => {
    const map: Record<string, string> = {};
    obras.forEach((o) => {
      const id = o.id || o._id;
      if (id) map[id] = o.nombre;
    });
    return map;
  }, [obras]);

  const obraSocialNombre = (p: PacienteItem) => {
    if (!p.obraSocial) return 'Sin obra social';
    if (typeof p.obraSocial === 'object') return p.obraSocial.nombre || 'Sin obra social';
    return obrasMap[p.obraSocial] || 'Obra social';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este paciente? Esta accion no se puede deshacer.')) return;
    try {
      await pacienteService.eliminar(id);
      toast.success('Paciente eliminado');
      cargar();
    } catch (e) {
      console.error(e);
      toast.error('Error al eliminar el paciente');
    }
  };

  const filtrados = items.filter((p) => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;
    return (
      (p.nombre || '').toLowerCase().includes(termino) ||
      (p.apellido || '').toLowerCase().includes(termino) ||
      (p.dni || '').includes(termino) ||
      (p.email || '').toLowerCase().includes(termino)
    );
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Pacientes"
        subtitulo="Administracion de pacientes del sistema."
        icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
        rightContent={
          <button
            className="btn text-white fw-semibold d-flex align-items-center gap-2 shadow-sm"
            style={{ backgroundColor: '#00ACB2', borderRadius: '10px' }}
            onClick={() => navigate('/pacientes/nuevo')}
          >
            <BsPlusCircle size={18} /> Nuevo Paciente
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
              placeholder="Buscar por nombre, apellido, DNI o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Cargando...</div>
      ) : filtrados.length > 0 ? (
        <div className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase fs-7 text-secondary border-bottom">
                <tr>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3">DNI</th>
                  <th className="py-3">Sexo</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Telefono</th>
                  <th className="py-3">Obra Social</th>
                  <th className="py-3 text-end px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const id = getPacienteId(p);
                  const telefono = p.telefono
                    ? `${p.telefono.codigoArea || ''} ${p.telefono.numero || ''}`.trim()
                    : '';
                  return (
                    <tr key={id}>
                      <td className="px-4 fw-semibold text-dark">
                        {p.apellido}, {p.nombre}
                      </td>
                      <td className="text-muted">{p.dni}</td>
                      <td className="text-muted text-capitalize">{(p.sexo || '').toLowerCase()}</td>
                      <td className="text-muted">{p.email || '-'}</td>
                      <td className="text-muted">{telefono || '-'}</td>
                      <td className="text-muted">{obraSocialNombre(p)}</td>
                      <td className="text-end px-4">
                        <ActionButtons
                          onView={() => navigate(`/pacientes/${id}`)}
                          onEdit={() => navigate(`/pacientes/editar/${id}`)}
                          onDelete={() => handleDelete(id)}
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
          <p className="text-muted mb-0">No se encontraron pacientes.</p>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPlusCircle, BsSearch, BsCapsule } from 'react-icons/bs';
import { ActionButtons } from '../../constants/ActionButtons';
import { PageHeader } from '../../constants/PageHeader';
import { obraSocialService } from '../../services/obraSocial.service';
import { getObraSocialId, type ObraSocialItem } from './obraSocial.schema';
import toast from 'react-hot-toast';

export const ObraSocialLista: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ObraSocialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await obraSocialService.listar(true);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error('No se pudieron cargar las obras sociales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Dar de baja esta obra social?')) return;
    try {
      await obraSocialService.eliminar(id);
      toast.success('Obra social dada de baja');
      cargar();
    } catch (e) {
      console.error(e);
      toast.error('Error al dar de baja');
    }
  };

  const filtrados = items.filter((o) =>
    (o.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Obras Sociales"
        subtitulo="Administracion de obras sociales del sistema."
        icon={<BsCapsule className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
        rightContent={
          <button
            className="btn text-white fw-semibold d-flex align-items-center gap-2 shadow-sm"
            style={{ backgroundColor: '#00ACB2', borderRadius: '10px' }}
            onClick={() => navigate('/obras-sociales/nuevo')}
          >
            <BsPlusCircle size={18} /> Nueva Obra Social
          </button>
        }
      />

      <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted"><BsSearch /></span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none ps-0"
              placeholder="Buscar por nombre..."
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
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Telefono</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3 text-end px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((os) => {
                  const id = getObraSocialId(os);
                  return (
                    <tr key={id}>
                      <td className="px-4 fw-semibold text-dark">{os.nombre}</td>
                      <td className="text-muted">{os.email || '-'}</td>
                      <td className="text-muted">{os.telefono || '-'}</td>
                      <td>
                        <span className={`badge px-2 py-1 ${os.activo === false ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                          {os.activo === false ? 'INACTIVA' : 'ACTIVA'}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <ActionButtons
                          onEdit={() => navigate(`/obras-sociales/editar/${id}`)}
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
          <p className="text-muted mb-0">No se encontraron obras sociales.</p>
        </div>
      )}
    </div>
  );
};

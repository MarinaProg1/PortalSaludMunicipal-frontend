import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPeople, BsSearch } from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { medicoService } from '../../services/medico.service';
import { getEspecialidadesNombres, type MedicoItem } from './medico.schema';
import toast from 'react-hot-toast';

export const MedicoLista: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MedicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

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
    const telefono = m.telefono
      ? `${m.telefono.codigoArea || ''} ${m.telefono.numero || ''}`.toLowerCase()
      : '';

    return (
      `${m.nombre} ${m.apellido}`.toLowerCase().includes(termino) ||
      especialidades.includes(termino) ||
      (m.dni || '').includes(termino) ||
      (m.email || '').toLowerCase().includes(termino) ||
      String(m.numeroMatricula || '').includes(termino) ||
      telefono.includes(termino)
    );
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Médicos"
        subtitulo="Profesionales registrados en el sistema."
        icon={<BsPeople className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate(-1)}
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
        <div className="text-center py-5 text-muted">Cargando...</div>
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
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((m) => {
                  const id = m.id || m._id || `${m.dni}-${m.numeroMatricula}`;
                  const especialidades = getEspecialidadesNombres(m);
                  const telefono = m.telefono
                    ? `${m.telefono.codigoArea || ''} ${m.telefono.numero || ''}`.trim()
                    : '';

                  return (
                    <tr key={id}>
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
                      <td className="px-4">
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

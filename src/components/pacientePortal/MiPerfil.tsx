import React, { useEffect, useState } from 'react';
import { BsEnvelope, BsGeoAlt, BsPersonCircle, BsShieldCheck, BsTelephone } from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { pacientePortalService } from '../../services/pacientePortal.service';
import { getObraSocialPerfilNombre, type MiPerfil as MiPerfilType } from './pacientePortal.schema';
import toast from 'react-hot-toast';

export const MiPerfil: React.FC = () => {
  const [perfil, setPerfil] = useState<MiPerfilType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await pacientePortalService.miPerfil();
        if (mounted) setPerfil(data);
      } catch (e) {
        console.error(e);
        if (mounted) toast.error('No se pudo cargar tu perfil');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="container-fluid px-2 px-md-4 py-4 text-muted">Cargando tu perfil...</div>;

  if (!perfil) {
    return (
      <div className="container-fluid px-2 px-md-4 py-4">
        <PageHeader
          titulo="Mi Perfil"
          subtitulo="No se encontró tu ficha de paciente."
          icon={<BsPersonCircle className="me-2" style={{ color: '#00ACB2' }} />}
        />
      </div>
    );
  }

  const telefono = perfil.telefono
    ? `${perfil.telefono.codigoArea || ''} ${perfil.telefono.numero || ''}`.trim()
    : '';

  const direccion = perfil.direccion
    ? [
        perfil.direccion.calle,
        perfil.direccion.numero,
        perfil.direccion.piso ? `Piso ${perfil.direccion.piso}` : '',
        perfil.direccion.departamento ? `Depto ${perfil.direccion.departamento}` : '',
        perfil.direccion.barrio,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  const iniciales = `${perfil.nombre?.[0] || ''}${perfil.apellido?.[0] || ''}`.toUpperCase();

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo="Mi Perfil"
        subtitulo="Tus datos personales y de contacto."
        icon={<BsPersonCircle className="me-2" style={{ color: '#00ACB2' }} />}
      />

      <div className="row g-3">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4 d-flex flex-column flex-md-row align-items-md-center gap-3">
              <div
                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '72px', height: '72px', backgroundColor: '#00ACB2', fontSize: '1.5rem' }}
              >
                {iniciales || 'P'}
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-1">
                  {perfil.apellido}, {perfil.nombre}
                </h5>
                <p className="text-muted mb-0 small">DNI {perfil.dni}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Datos personales</h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted">Nombre y apellido</dt>
                <dd className="col-7 text-dark">{perfil.apellido}, {perfil.nombre}</dd>

                <dt className="col-5 text-muted">DNI</dt>
                <dd className="col-7 text-dark">{perfil.dni}</dd>

                <dt className="col-5 text-muted">Sexo</dt>
                <dd className="col-7 text-dark text-capitalize">{(perfil.sexo || '-').toLowerCase()}</dd>

                <dt className="col-5 text-muted d-flex align-items-center gap-1">
                  <BsEnvelope /> Email
                </dt>
                <dd className="col-7 text-dark">{perfil.email || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Contacto y obra social</h6>
              <dl className="row mb-0 small">
                <dt className="col-5 text-muted d-flex align-items-center gap-1">
                  <BsTelephone /> Teléfono
                </dt>
                <dd className="col-7 text-dark">{telefono || '-'}</dd>

                <dt className="col-5 text-muted d-flex align-items-center gap-1">
                  <BsGeoAlt /> Dirección
                </dt>
                <dd className="col-7 text-dark">{direccion || '-'}</dd>

                <dt className="col-5 text-muted d-flex align-items-center gap-1">
                  <BsShieldCheck /> Obra social
                </dt>
                <dd className="col-7 text-dark">{getObraSocialPerfilNombre(perfil)}</dd>

                <dt className="col-5 text-muted">Nro. afiliado</dt>
                <dd className="col-7 text-dark">{perfil.numeroAfiliado || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

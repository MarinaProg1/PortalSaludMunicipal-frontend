
import React, { useState } from 'react';
import { PageHeader } from '../../constants/PageHeader';
import { BsGear, BsPerson, BsShieldLock} from 'react-icons/bs';
import { toast } from 'sonner';

export const ConfiguracionView: React.FC = () => {
  // Estado simulado para el perfil (puedes conectarlo con tu contexto de autenticación o backend)
  const [perfil, setPerfil] = useState({
    nombre: 'Marina Natalia',
    apellido: 'López',
    email: 'marina.lopez@salud.gob.ar',
    matricula: 'MP-4582',
    rol: 'ADMIN'
  });

  // Estados para el cambio de contraseña
  const [passwords, setPasswords] = useState({
    actual: '',
    nueva: '',
    confirmacion: ''
  });

  const [submittingPerfil, setSubmittingPerfil] = useState(false);
  const [submittingPass, setSubmittingPass] = useState(false);

  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPerfil(true);
    
    setTimeout(() => {
      setSubmittingPerfil(false);
      toast.success('¡Datos de perfil actualizados correctamente!');
    }, 1000);
  };

  const handleCambiarPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.nueva !== passwords.confirmacion) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (passwords.nueva.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmittingPass(true);

    setTimeout(() => {
      setSubmittingPass(false);
      toast.success('¡Contraseña modificada con éxito!');
      setPasswords({ actual: '', nueva: '', confirmacion: '' });
    }, 1000);
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '850px' }}>
      
      {/* Cabecera institucional reutilizada */}
      <PageHeader 
        titulo="Configuración de la Cuenta"
        subtitulo="Administra tu información personal y parámetros de seguridad del sistema."
        icon={<BsGear className="me-2" style={{ color: '#00ACB2' }} />}
      />

      <div className="d-flex flex-column gap-4">
        
        {/* TARJETA 1: DATOS PERSONALES */}
        <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary-subtle">
            <BsPerson size={20} style={{ color: '#00ACB2' }} />
            <h5 className="fw-bold text-dark mb-0">Información del Perfil</h5>
          </div>

          <form onSubmit={handleGuardarPerfil}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Nombre</label>
                <input 
                  type="text" 
                  className="form-control shadow-none" 
                  name="nombre"
                  value={perfil.nombre}
                  onChange={handlePerfilChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Apellido</label>
                <input 
                  type="text" 
                  className="form-control shadow-none" 
                  name="apellido"
                  value={perfil.apellido}
                  onChange={handlePerfilChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-control shadow-none" 
                  name="email"
                  value={perfil.email}
                  onChange={handlePerfilChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Rol en el Sistema</label>
                <input 
                  type="text" 
                  className="form-control shadow-none bg-light text-muted" 
                  value={perfil.rol}
                  disabled
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary-subtle">
              <button 
                type="submit" 
                className="btn text-white fw-semibold px-4 shadow-sm"
                style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                disabled={submittingPerfil}
              >
                {submittingPerfil ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* TARJETA 2: SEGURIDAD Y CONTRASEÑA */}
        <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary-subtle">
            <BsShieldLock size={20} style={{ color: '#00ACB2' }} />
            <h5 className="fw-bold text-dark mb-0">Seguridad y Contraseña</h5>
          </div>

          <form onSubmit={handleCambiarPassword}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold text-secondary small">Contraseña Actual</label>
                <input 
                  type="password" 
                  className="form-control shadow-none" 
                  name="actual"
                  placeholder="••••••••"
                  value={passwords.actual}
                  onChange={handlePassChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="form-control shadow-none" 
                  name="nueva"
                  placeholder="Mínimo 6 caracteres"
                  value={passwords.nueva}
                  onChange={handlePassChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="form-control shadow-none" 
                  name="confirmacion"
                  placeholder="Repita la contraseña"
                  value={passwords.confirmacion}
                  onChange={handlePassChange}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary-subtle">
              <button 
                type="submit" 
                className="btn text-white fw-semibold px-4 shadow-sm"
                style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
                disabled={submittingPass}
              >
                {submittingPass ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
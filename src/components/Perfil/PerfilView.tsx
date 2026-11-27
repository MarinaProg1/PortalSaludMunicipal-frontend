import { useState, useEffect } from 'react';
import { PageHeader } from '../../constants/PageHeader';
import { BsGear, BsPerson, BsShieldLock } from 'react-icons/bs';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import type { TokenPayload, PerfilState } from './Perfil.Schema';

function normalizarTelefono(value: unknown): NonNullable<PerfilState['telefono']> {
  const texto = (field: unknown): string =>
    typeof field === 'string' || typeof field === 'number' ? String(field) : '';

  if (typeof value === 'object' && value !== null) {
    const telefono = value as Record<string, unknown>;
    return {
      tipo: texto(telefono.tipo),
      codigoArea: texto(telefono.codigoArea),
      numero: texto(telefono.numero),
    };
  }

  if (typeof value === 'string') {
    const extraer = (campo: string): string =>
      value.match(new RegExp(`["']?${campo}["']?\\s*:\\s*["']?([^,'"}]+)["']?`, 'i'))?.[1].trim() ||
      '';
    const telefono = {
      tipo: extraer('tipo'),
      codigoArea: extraer('codigoArea'),
      numero: extraer('numero'),
    };

    return telefono.tipo || telefono.codigoArea || telefono.numero
      ? telefono
      : { numero: value.trim() };
  }

  return {};
}

function decodificarToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const jsonPayload = new TextDecoder().decode(bytes);

    return JSON.parse(jsonPayload) as TokenPayload;
  } catch {
    return null;
  }
}


function obtenerPerfilInicial(): PerfilState {
  const token = localStorage.getItem('token');
  const usuarioStorage = localStorage.getItem('usuario');

  const payload = token ? decodificarToken(token) : null;
  let userParsed: Record<string, unknown> | null = null;
  
  if (usuarioStorage) {
    try {
      userParsed = JSON.parse(usuarioStorage) as Record<string, unknown>;
    } catch {
      userParsed = null;
    }
  }

  return {
    nombre: (payload?.nombre || userParsed?.nombre || 'No especificado') as string,
    apellido: (payload?.apellido || userParsed?.apellido || 'No especificado') as string,
    email: (payload?.email || userParsed?.email || 'No especificado') as string,
    telefono: normalizarTelefono(payload?.telefono || userParsed?.telefono),
    matricula: (payload?.matricula || userParsed?.matricula || '') as string,
    rol: (payload?.rol || userParsed?.rol || 'USER') as string,
  };
}
export function PerfilView() {
  const [perfil, setPerfil] = useState<PerfilState>(obtenerPerfilInicial);

  const [passwords, setPasswords] = useState({
    actual: '',
    nueva: '',
    confirmacion: '',
  });

  const [submittingPass, setSubmittingPass] = useState(false);

  // Carga los datos reales completos desde el backend al montar la vista
  useEffect(() => {
    let activo = true;

    const cargarPerfilCompleto = async () => {
      try {
        const res = await clientesAxios.get('/usuarios/perfil');
        
        const data = (res.data?.data || res.data) as Record<string, unknown>;
        if (activo && data) {
          setPerfil({
            nombre: (data.nombre as string) || 'No especificado',
            apellido: (data.apellido as string) || 'No especificado',
            email: (data.email as string) || 'No especificado',
            telefono: normalizarTelefono(data.telefono),
            matricula: (data.matricula as string) || '',
            rol: (data.rol as string) || 'USER',
          });
        }
      } catch (err) {
        console.error('Error al cargar los datos del perfil:', err);
      }
    };

    cargarPerfilCompleto();

    return () => {
      activo = false;
    };
  }, []);

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleCambiarPassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

    try {
      await clientesAxios.put('/usuarios/cambiar-password', {
        passwordActual: passwords.actual,
        passwordNueva: passwords.nueva,
      });

      toast.success('¡Contraseña modificada con éxito!');
      setPasswords({ actual: '', nueva: '', confirmacion: '' });
    } catch (err: unknown) {
      console.error('Error al cambiar contraseña:', err);
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Error al cambiar la contraseña. Verifique su contraseña actual.');
    } finally {
      setSubmittingPass(false);
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '850px' }}>
      <PageHeader
        titulo="Configuración de la Cuenta"
        subtitulo="Visualiza tu información personal y administra los parámetros de seguridad."
        icon={<BsGear className="me-2" style={{ color: '#00ACB2' }} />}
      />

      <div className="d-flex flex-column gap-4">
        {/* TARJETA 1: VISTA DE INFORMACIÓN DEL PERFIL (SÓLO LECTURA) */}
        <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary-subtle">
            <BsPerson size={20} style={{ color: '#00ACB2' }} />
            <h5 className="fw-bold text-dark mb-0">Información del Perfil</h5>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <span className="d-block fw-semibold text-secondary small">Nombre</span>
              <p className="text-dark fs-6 mb-0 py-1 px-2 bg-light rounded border border-secondary-subtle">
                {perfil.nombre}
              </p>
            </div>

            <div className="col-md-6">
              <span className="d-block fw-semibold text-secondary small">Apellido</span>
              <p className="text-dark fs-6 mb-0 py-1 px-2 bg-light rounded border border-secondary-subtle">
                {perfil.apellido}
              </p>
            </div>

            <div className="col-md-6">
              <span className="d-block fw-semibold text-secondary small">Correo Electrónico</span>
              <p className="text-dark fs-6 mb-0 py-1 px-2 bg-light rounded border border-secondary-subtle">
                {perfil.email}
              </p>
            </div>

            <div className="col-md-6">
              <span className="d-block fw-semibold text-secondary small mb-1">Teléfono</span>
              <div className="row g-2">
                <div className="col-12 col-sm-4">
                  <span className="d-block text-muted small">Tipo</span>
                  <p className="text-dark fs-6 mb-0 py-1 px-2 bg-light rounded border border-secondary-subtle">
                    {perfil.telefono?.tipo || 'No especificado'}
                  </p>
                </div>
                <div className="col-6 col-sm-4">
                  <span className="d-block text-muted small">Código de área</span>
                  <p className="text-dark fs-6 mb-0 py-1 px-2 bg-light rounded border border-secondary-subtle">
                    {perfil.telefono?.codigoArea || 'No especificado'}
                  </p>
                </div>
                <div className="col-6 col-sm-4">
                  <span className="d-block text-muted small">Número</span>
                  <p className="text-dark fs-6 mb-0 py-1 px-2 bg-light rounded border border-secondary-subtle">
                    {perfil.telefono?.numero || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <span className="d-block fw-semibold text-secondary small">Rol en el Sistema</span>
              <p className="text-dark fs-6 mb-0 py-1 px-2 bg-light rounded border border-secondary-subtle text-uppercase">
                {perfil.rol}
              </p>
            </div>

            {perfil.matricula && (
              <div className="col-md-6">
                <span className="d-block fw-semibold text-secondary small">Matrícula Profesional</span>
                <p className="text-dark fs-6 mb-0 py-1 px-2 bg-light rounded border border-secondary-subtle">
                  {perfil.matricula}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* TARJETA 2: SEGURIDAD Y CONTRASEÑA (INTERACTIVA) */}
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
}
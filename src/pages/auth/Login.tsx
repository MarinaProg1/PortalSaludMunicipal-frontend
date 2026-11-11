import { useState } from "react";
import { BsArrowRight, BsCalendarCheck, BsEnvelope, BsEye, BsEyeSlash, BsHeartPulse, BsLock, BsShieldCheck } from "react-icons/bs";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Login.css";

/** Isotipo + nombre institucional. Vive acá porque solo se usa en el login. */
const LogoPortalSalud = () => (
  <div className="ps-logo">
    <svg
      width="56"
      height="56"
      viewBox="0 0 72 72"
      role="img"
      aria-label="Portal Salud"
      className="ps-logo-mark"
    >
      <defs>
        <linearGradient id="psLogoGrad" x1="10" y1="6" x2="64" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#57ECE0" />
          <stop offset="0.48" stopColor="#00C2C7" />
          <stop offset="1" stopColor="#0E7FAE" />
        </linearGradient>
        <linearGradient id="psLogoShine" x1="36" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.38" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="64" height="64" rx="20" fill="url(#psLogoGrad)" />
      <rect x="4" y="4" width="64" height="64" rx="20" fill="url(#psLogoShine)" />
      <rect
        x="4.75"
        y="4.75"
        width="62.5"
        height="62.5"
        rx="19.25"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      {/* Cruz médica */}
      <path d="M36 18v30M21 33h30" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" />

      {/* Línea de pulso */}
      <path
        d="M13 55h9.5l4.2-7.4 5.2 13.2 4.1-6.2H59"
        fill="none"
        stroke="#043C5C"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>

    <div className="ps-logo-text">
      <span className="ps-logo-name">
        Portal <strong>Salud</strong>
      </span>
      <span className="ps-logo-sub">Municipal</span>
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const mostrarError = (mensaje: string) => {
    toast.error(mensaje, {
      id: "login-error",
      duration: 4500,
      style: {
        background: "#2a1220",
        color: "#ffe8ec",
        border: "1px solid rgba(255, 138, 138, 0.5)",
        boxShadow: "0 18px 40px -16px rgba(0, 0, 0, 0.8)",
        fontWeight: 600,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const correo = email.trim();

    if (!correo || !password) {
      mostrarError("Ingresá tu correo y contraseña.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarError("Ingresá un correo electrónico válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email: correo, password });

      if (response.ok && response.token) {
        toast.success("Inicio de sesión correcto");
        login(response.token, response.debeCambiarPassword);
      } else {
        mostrarError(response.message || "Usuario o contraseña incorrectos.");
      }
    } catch (error: any) {
      const status = error.response?.status;
      const mensajeBackend = error.response?.data?.message;

      if (status === 401) {
        mostrarError("Usuario o contraseña incorrectos.");
      } else if (!error.response) {
        mostrarError("No se pudo conectar con el servidor. Intentá nuevamente.");
      } else {
        mostrarError(mensajeBackend || "Error al iniciar sesión. Intentá nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-backdrop" aria-hidden="true">
        <span className="login-orb login-orb--one" />
        <span className="login-orb login-orb--two" />
        <span className="login-orb login-orb--three" />
        <div className="login-grid" />
      </div>

      <main className="login-shell">
        <section className="login-brand">
          <LogoPortalSalud />

          <p className="login-eyebrow">Gestión sanitaria integral</p>

          <h1 className="login-title">
            Tu salud,
            <span> en un solo lugar.</span>
          </h1>

          <p className="login-lead">
            Turnos, pacientes, profesionales y obras sociales integrados en una
            plataforma simple, segura y pensada para cuidarte.
          </p>

          <ul className="login-features">
            <li>
              <span className="login-feature-icon"><BsShieldCheck /></span>
              <div>
                <strong>Acceso seguro</strong>
                <span>Permisos por rol para cada usuario</span>
              </div>
            </li>
            <li>
              <span className="login-feature-icon"><BsCalendarCheck /></span>
              <div>
                <strong>Turnos y agendas</strong>
                <span>Disponibilidad actualizada en tiempo real</span>
              </div>
            </li>
            <li>
              <span className="login-feature-icon"><BsHeartPulse /></span>
              <div>
                <strong>Historia clínica</strong>
                <span>Toda la información del paciente centralizada</span>
              </div>
            </li>
          </ul>

          <div className="login-pulse" aria-hidden="true">
            <svg viewBox="0 0 260 28" preserveAspectRatio="none">
              <path d="M0 14h52l7-10 8 20 7-14 5 4h181" />
            </svg>
          </div>
        </section>

        <section className="login-card" aria-labelledby="login-card-title">
          <div className="login-card__badge">
            <BsShieldCheck />
            Entorno seguro
          </div>

          <header className="login-card__header">
            <h2 id="login-card-title">Iniciar sesión</h2>
            <p>Ingresá con tu cuenta institucional o de paciente.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-control">
              <label htmlFor="login-email">Correo electrónico</label>
              <div className="login-field">
                <span className="login-field__icon"><BsEnvelope /></span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@saludmunicipal.gob.ar"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-control">
              <label htmlFor="login-password">Contraseña</label>
              <div className="login-field">
                <span className="login-field__icon"><BsLock /></span>
                <input
                  id="login-password"
                  type={verPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresá tu contraseña"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setVerPassword((valor) => !valor)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <BsArrowRight className="login-submit__arrow" />
                </>
              )}
            </button>
          </form>

          <footer className="login-card__footer">
            <span>¿No podés ingresar?</span>
            <span>Contactá al área de sistemas.</span>
          </footer>
        </section>
      </main>

      <footer className="login-page__footer">
        Portal Salud Municipal <span aria-hidden="true">·</span> Sistema de Gestión Sanitaria
      </footer>
    </div>
  );
};

export default Login;

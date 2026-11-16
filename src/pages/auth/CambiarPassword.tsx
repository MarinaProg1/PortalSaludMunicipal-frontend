import { useState } from "react";
import { BsShieldLock } from "react-icons/bs";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { LogoPortalSalud } from "../../components/brand/LogoPortalSalud";
import toast from "react-hot-toast";
import "./CambiarPassword.css";

const CambiarPassword = () => {
  const { login } = useAuth();
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevaPassword !== confirmarPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (nuevaPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.cambiarPassword({ passwordActual, nuevaPassword });
      if (response.ok || response.success) {
        const nuevoToken = (response.data as { token?: string } | undefined)?.token;
        toast.success(response.message || "Contraseña actualizada");
        if (nuevoToken) {
          login(nuevoToken, false);
        } else {
          window.location.href = "/login";
        }
      } else {
        toast.error(response.message || "No se pudo cambiar la contraseña");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al cambiar la contraseña";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-auth-page">
      <main className="ps-auth-card" aria-labelledby="cambiar-password-title">
        <div className="ps-auth-brand">
          <LogoPortalSalud />
        </div>

        <span className="ps-auth-badge">
          <BsShieldLock />
          Seguridad de la cuenta
        </span>

        <h1 className="ps-auth-title" id="cambiar-password-title">
          Cambiar contraseña
        </h1>
        <p className="ps-auth-lead">
          Por seguridad, actualizá tu contraseña antes de continuar.
        </p>

        <form onSubmit={handleSubmit} className="ps-auth-form" noValidate>
          <div className="ps-auth-control">
            <label htmlFor="password-actual">Contraseña actual</label>
            <input
              id="password-actual"
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="ps-auth-control">
            <label htmlFor="password-nueva">Nueva contraseña</label>
            <input
              id="password-nueva"
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <span className="ps-auth-hint">Mínimo 8 caracteres.</span>
          </div>

          <div className="ps-auth-control">
            <label htmlFor="password-confirmar">Confirmar nueva contraseña</label>
            <input
              id="password-confirmar"
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="ps-auth-submit" disabled={loading}>
            {loading ? "Guardando..." : "Actualizar contraseña"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CambiarPassword;

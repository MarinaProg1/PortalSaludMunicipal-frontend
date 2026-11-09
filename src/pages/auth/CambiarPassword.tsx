import { useState } from "react";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

const CambiarPassword = () => {
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevaPassword !== confirmarPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }

    if (nuevaPassword.length < 6) {
      toast.error("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.cambiarPassword({ passwordActual, nuevaPassword });
      if (response.ok || response.success) {
        toast.success(response.message || "Contrasena actualizada");
        window.location.href = "/";
      } else {
        toast.error(response.message || "No se pudo cambiar la contrasena");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al cambiar la contrasena";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f7f7f7" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2rem", borderRadius: "8px", width: "380px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Cambiar Contrasena</h2>
        <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#666", fontSize: "0.9rem" }}>
          Por seguridad, actualiza tu contrasena antes de continuar.
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <label>Contrasena actual</label>
          <input
            type="password"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            required
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Nueva contrasena</label>
          <input
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label>Confirmar nueva contrasena</label>
          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.7rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px" }}>
          {loading ? "Guardando..." : "Actualizar contrasena"}
        </button>
      </form>
    </div>
  );
};

export default CambiarPassword;

import { useState } from "react";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.ok && response.token) {
        toast.success("Inicio de sesi├│n correcto");
        login(response.token, response.debeCambiarPassword);
      } else {
        toast.error(response.message || "Credenciales inv├ílidas");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al iniciar sesi├│n";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f7f7f7" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2rem", borderRadius: "8px", width: "350px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Iniciar Sesi├│n</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label>Contrase├▒a</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.7rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px" }}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default Login;

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  allowed: string[];
  children: React.ReactNode;
}

export const RequireRole = ({ allowed, children }: Props) => {
  const { rol } = useAuth();
  const current = (rol || "").toUpperCase();
  const ok = allowed.map((r) => r.toUpperCase()).includes(current);

  if (!ok) {
    return <Navigate to="/turnos" replace />;
  }

  return <>{children}</>;
};

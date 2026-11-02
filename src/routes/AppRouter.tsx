import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import { useAuth } from "../context/AuthContext";
import LayoutPrincipal from "../components/layout/LayoutPrincipal";
import { TurnosLista } from "../components/turnos/TurnosLista";
import { TurnoForm } from "../components/turnos/TurnoForm";
import { DetalleTurno } from "../components/turnos/DetalleTurno";
import NotFound from "../components/utils/NotFound";
import { useParams, useNavigate } from "react-router-dom";

// Componente envoltorio para edición
const EdicionTurnoWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <TurnoForm
      turnoId={id}
      onSuccess={() => navigate("/turnos")}
      onCancel={() => navigate(-1)}
    />
  );
};

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/turnos" replace />} />

        {/* Rutas protegidas con layout */}
        <Route
          path="/"
          element={isAuthenticated ? <LayoutPrincipal /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/turnos" replace />} />
          <Route path="turnos" element={<TurnosLista />} />
          <Route path="turnos/nuevo" element={<TurnoForm />} />
          <Route path="turno-detalle/:id" element={<DetalleTurno />} />
          <Route path="turnos/editar/:id" element={<EdicionTurnoWrapper />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
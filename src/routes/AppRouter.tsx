import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import CambiarPassword from "../pages/auth/CambiarPassword";
import { useAuth } from "../context/AuthContext";
import LayoutPrincipal from "../components/layout/LayoutPrincipal";
import { TurnosLista } from "../components/turnos/TurnosLista";
import { TurnoForm } from "../components/turnos/TurnoForm";
import { DetalleTurno } from "../components/turnos/DetalleTurno";
import { HorarioAtencionLista } from "../components/horarios/HorarioAtencionLista";
import { HorarioAtencionForm } from "../components/horarios/HorarioAtencionForm";
import { ObraSocialLista } from "../components/obrasSociales/ObraSocialLista";
import { ObraSocialForm } from "../components/obrasSociales/ObraSocialForm";
import { RequireRole } from "./RequireRole";
import NotFound from "../components/utils/NotFound";

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

const EdicionObraSocialWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <ObraSocialForm
      obraSocialId={id}
      onSuccess={() => navigate("/obras-sociales")}
      onCancel={() => navigate(-1)}
    />
  );
};

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/turnos" replace />} />
        <Route path="/cambiar-password" element={isAuthenticated ? <CambiarPassword /> : <Navigate to="/login" replace />} />

        <Route
          path="/"
          element={isAuthenticated ? <LayoutPrincipal /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/turnos" replace />} />
          <Route path="turnos" element={<TurnosLista />} />
          <Route path="turnos/nuevo" element={<TurnoForm />} />
          <Route path="turno-detalle/:id" element={<DetalleTurno />} />
          <Route path="turnos/editar/:id" element={<EdicionTurnoWrapper />} />

          <Route path="horarioAtencion" element={<HorarioAtencionLista />} />
          <Route path="horarioAtencion/nuevo" element={<HorarioAtencionForm />} />

          <Route path="obras-sociales" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><ObraSocialLista /></RequireRole>} />
          <Route path="obras-sociales/nuevo" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><ObraSocialForm /></RequireRole>} />
          <Route path="obras-sociales/editar/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><EdicionObraSocialWrapper /></RequireRole>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

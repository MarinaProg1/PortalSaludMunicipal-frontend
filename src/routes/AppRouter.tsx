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
import { PacienteLista } from "../components/pacientes/PacienteLista";
import { PacienteForm } from "../components/pacientes/PacienteForm";
import { PacienteDetalle } from "../components/pacientes/PacienteDetalle";
import { MedicoLista } from "../components/medicos/MedicoLista";
import { MisTurnos } from "../components/pacientePortal/MisTurnos";
import { MiPerfil } from "../components/pacientePortal/MiPerfil";
import { TurnoPacienteForm } from "../components/pacientePortal/TurnoPacienteForm";
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

const EdicionPacienteWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <PacienteForm
      pacienteId={id}
      onSuccess={() => navigate("/pacientes")}
      onCancel={() => navigate(-1)}
    />
  );
};

const HomeRedirect = () => {
  const { rol } = useAuth();
  const destino = (rol || "").toUpperCase() === "PACIENTE" ? "/mis-turnos" : "/turnos";
  return <Navigate to={destino} replace />;
};

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <HomeRedirect />} />
        <Route path="/cambiar-password" element={isAuthenticated ? <CambiarPassword /> : <Navigate to="/login" replace />} />

        <Route
          path="/"
          element={isAuthenticated ? <LayoutPrincipal /> : <Navigate to="/login" replace />}
        >
          <Route index element={<HomeRedirect />} />
          <Route path="turnos" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA", "MEDICO"]}><TurnosLista /></RequireRole>} />
          <Route path="turnos/nuevo" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA", "MEDICO"]}><TurnoForm /></RequireRole>} />
          <Route path="turno-detalle/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA", "MEDICO"]}><DetalleTurno /></RequireRole>} />
          <Route path="turnos/editar/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA", "MEDICO"]}><EdicionTurnoWrapper /></RequireRole>} />

          <Route path="mis-turnos" element={<RequireRole allowed={["PACIENTE"]}><MisTurnos /></RequireRole>} />
          <Route path="mis-turnos/nuevo" element={<RequireRole allowed={["PACIENTE"]}><TurnoPacienteForm /></RequireRole>} />
          <Route path="mi-perfil" element={<RequireRole allowed={["PACIENTE"]}><MiPerfil /></RequireRole>} />

          <Route path="horarioAtencion" element={<HorarioAtencionLista />} />
          <Route path="horarioAtencion/nuevo" element={<HorarioAtencionForm />} />

          <Route path="obras-sociales" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><ObraSocialLista /></RequireRole>} />
          <Route path="obras-sociales/nuevo" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><ObraSocialForm /></RequireRole>} />
          <Route path="obras-sociales/editar/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><EdicionObraSocialWrapper /></RequireRole>} />

          <Route path="pacientes" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><PacienteLista /></RequireRole>} />
          <Route path="pacientes/nuevo" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><PacienteForm /></RequireRole>} />
          <Route path="pacientes/editar/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><EdicionPacienteWrapper /></RequireRole>} />
          <Route path="pacientes/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><PacienteDetalle /></RequireRole>} />

          <Route path="medicos" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><MedicoLista /></RequireRole>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

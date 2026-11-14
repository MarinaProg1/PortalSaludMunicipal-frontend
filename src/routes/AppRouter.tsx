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
import { MedicoForm } from "../components/medicos/MedicoForm";
import { DetalleMedico } from "../components/medicos/DetalleMedico";
import { MisTurnos } from "../components/pacientePortal/MisTurnos";
import { MiPerfil } from "../components/pacientePortal/MiPerfil";
import { TurnoPacienteForm } from "../components/pacientePortal/TurnoPacienteForm";
import { DetalleTurnoPaciente } from "../components/pacientePortal/DetalleTurnoPaciente";
import { RequireRole } from "./RequireRole";
import NotFound from "../components/utils/NotFound";
import { ConfiguracionView } from "../components/configuraciones/ConfiguracionView";
import { EspecialidadLista } from "../components/especialidades/EspecialidadLista";
import { EspecialidadForm } from "../components/especialidades/EspecialidadForm";
import { DetalleEspecialidad } from "../components/especialidades/DetalleEspecialidad";
import { HistorialMedicoLista } from "../components/historialMedico/HistorialMedicoLista";
import { HistorialMedicoForm } from "../components/historialMedico/HistorialMedicoForm";
import { DetalleHistorialMedico } from "../components/historialMedico/DetalleHistorialMedico";

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

const NuevoMedicoWrapper = () => {
  const navigate = useNavigate();

  return <MedicoForm onSuccess={() => navigate("/medicos")} onCancel={() => navigate(-1)} />;
};

const EdicionMedicoWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <MedicoForm
      medicoId={id}
      onSuccess={() => navigate("/medicos")}
      onCancel={() => navigate(-1)}
    />
  );
};

const HomeRedirect = () => {  const { rol } = useAuth();
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
          <Route path="mis-turnos/:id" element={<RequireRole allowed={["PACIENTE"]}><DetalleTurnoPaciente /></RequireRole>} />
          <Route path="mi-perfil" element={<RequireRole allowed={["PACIENTE"]}><MiPerfil /></RequireRole>} />

          <Route path="horarioAtencion" element={<HorarioAtencionLista />} />
          <Route path="horarioAtencion/nuevo" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><HorarioAtencionForm /></RequireRole>} />
          <Route path="configuracion" element={<ConfiguracionView />} />

          <Route path="obras-sociales" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><ObraSocialLista /></RequireRole>} />
          <Route path="obras-sociales/nuevo" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><ObraSocialForm /></RequireRole>} />
          <Route path="obras-sociales/editar/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><EdicionObraSocialWrapper /></RequireRole>} />

          <Route path="pacientes" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA", "MEDICO"]}><PacienteLista /></RequireRole>} />
          <Route path="pacientes/nuevo" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><PacienteForm /></RequireRole>} />
          <Route path="pacientes/editar/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><EdicionPacienteWrapper /></RequireRole>} />
          <Route path="pacientes/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA", "MEDICO"]}><PacienteDetalle /></RequireRole>} />

          <Route path="medicos" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><MedicoLista /></RequireRole>} />
          <Route path="medicos/nuevo" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><NuevoMedicoWrapper /></RequireRole>} />
          <Route path="medicos/editar/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><EdicionMedicoWrapper /></RequireRole>} />
          <Route path="medicos/:id" element={<RequireRole allowed={["ADMIN", "RECEPCIONISTA"]}><DetalleMedico /></RequireRole>} />

          <Route path="especialidades" element={<EspecialidadLista />} />
          <Route path="especialidades/nuevo" element={<EspecialidadForm />} />
          <Route path="especialidades/editar/:id" element={<EspecialidadForm />} />
          <Route path="especialidades/:id" element={<DetalleEspecialidad />} />

          <Route path="historial-medico" element={<HistorialMedicoLista />} />
          <Route path="historial-medico/nuevo/:turnoId" element={<HistorialMedicoForm />} />
          <Route path="historial-medico/editar/:id" element={<HistorialMedicoForm />} />
          <Route path="historial-medico/:id" element={<DetalleHistorialMedico />} />
        
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

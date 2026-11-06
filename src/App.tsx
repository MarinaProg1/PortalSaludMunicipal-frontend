import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import { TurnosLista } from './components/turnos/TurnosLista'; 
import NotFound from './components/utils/NotFound';
import { TurnoForm } from './components/turnos/TurnoForm';
import { DetalleTurno } from './components/turnos/DetalleTurno';
import { DetalleHistorialMedico } from './components/historialMedico/DetalleHistorialMedico';
import { HistorialMedicoForm } from './components/historialMedico/HistorialMedicoForm';
import { HistorialMedicoLista } from './components/historialMedico/HistorialMedicoLista';
import { HorarioAtencionForm } from './components/horarios/HorarioAtencionForm';
import { HorarioAtencionLista } from './components/horarios/HorarioAtencionLista';
import {EspecialidadesLista} from './components/especialidades/EspecialidadLista';
import { EspecialidadForm } from './components/especialidades/EspecialidadForm';
import { DetalleEspecialidad } from './components/especialidades/DetalleEspecialidad';

// Componente envoltorio para capturar el ID de la URL en modo Edición
const EdicionTurnoWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <TurnoForm 
      turnoId={id} 
      onSuccess={() => navigate('/turnos')} 
      onCancel={() => navigate(-1)} 
    />
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal con Layout */}
        <Route path="/" element={<LayoutPrincipal />}>
          
          <Route index element={<Navigate to="/turnos" replace />} />
          
          {/* Rutas hijas sin el '/' al inicio para que respeten el Layout */}
          <Route path="turnos" element={<TurnosLista />} />
          <Route path="turnos/nuevo" element={<TurnoForm />} />
          <Route path="turno-detalle/:id" element={<DetalleTurno />} />
          <Route path="turnos/editar/:id" element={<EdicionTurnoWrapper />} />
          <Route path="/historial-medico" element={<HistorialMedicoLista />} />
          <Route path="/historial-medico/nuevo" element={<HistorialMedicoForm />} />
          <Route path="/historial-medico/detalle/:id" element={<DetalleHistorialMedico />} />
          <Route path="/historial-medico/editar/:id" element={<HistorialMedicoForm />} />
          <Route path="/historial-medico/nuevo/:turnoId" element={<HistorialMedicoForm />} />
          <Route path="/especialidades" element={<EspecialidadesLista />} />
          <Route path="/especialidades/nuevo" element={<EspecialidadForm />} />
          <Route path="/especialidades/editar/:id" element={<EspecialidadForm />} />
          <Route path="/especialidades/detalle/:id" element={<DetalleEspecialidad />} />
          <Route path="/horarioAtencion" element={<HorarioAtencionLista />} />
          <Route path="/horarioAtencion/nuevo" element={<HorarioAtencionForm />} />
          
        </Route>

        {/* Ruta 404 fuera del layout principal */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import { TurnosLista } from './components/turnos/TurnosLista'; 
import NotFound from './components/utils/NotFound';
import { TurnoForm } from './components/turnos/TurnoForm';
import { DetalleTurno } from './components/turnos/DetalleTurno';
import { HorarioAtencionForm } from './components/horarios/HorarioAtencionForm';
import { HorarioAtencionLista } from './components/horarios/HorarioAtencionLista';
import { ConfiguracionView } from './components/configuraciones/ConfiguracionView';


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
    <>
    <Toaster position="top-right" richColors/>
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

          <Route path="/horarioAtencion" element={<HorarioAtencionLista />} />
          <Route path="/horarioAtencion/nuevo" element={<HorarioAtencionForm />} />
          <Route path="/configuracion" element={<ConfiguracionView />} />

    
        </Route>

        {/* Ruta 404 fuera del layout principal */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
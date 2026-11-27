import { useNavigate } from 'react-router-dom';
import { goBackSafe } from '../utils/navigation';
import {
  BsCalendarDay,
  BsCalendarCheck,
  BsClipboardPulse,
  BsJournalMedical,
  BsFilePlus,
  BsHeartPulse,
  BsClock,
} from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';

interface OpcionMedico {
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  ruta: string;
}

export const MedicoHome = () => {
  const navigate = useNavigate();

  const opcionesMedico: OpcionMedico[] = [
    {
      titulo: 'Turnos del Día',
      descripcion: 'Consultá la agenda de hoy y gestioná los pacientes por atender.',
      icono: <BsCalendarDay size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/turnos/del-dia',
    },
    {
      titulo: 'Todos los Turnos',
      descripcion: 'Revisá el listado general de turnos asignados.',
      icono: <BsCalendarCheck size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/turnos/lista',
    },
    {
      titulo: 'Mis Consultas',
      descripcion: 'Accedé al registro de consultas médicas realizadas.',
      icono: <BsClipboardPulse size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/consultas-medicas-dos',
    },
    {
      titulo: 'Historias Clínicas',
      descripcion: 'Consultá y actualizá el historial clínico de tus pacientes.',
      icono: <BsJournalMedical size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/historial-medico',
    },
    {
      titulo: 'Nueva Historia Clínica',
      descripcion: 'Registrá una nueva ficha clínica seleccionando al paciente.',
      icono: <BsFilePlus size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/historial-medico/nuevo',
    },
    {
      titulo: 'Pacientes',
      descripcion: 'Visualizá los datos básicos de los pacientes.',
      icono: <BsHeartPulse size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/pacientes',
    },
    {
      titulo: 'Ver mi horario',
      descripcion: 'Consultá tus días y franjas horarias de atención.',
      icono: <BsClock size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/horarioAtencion',
    },
  ];

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader
        titulo="Panel del Médico"
        subtitulo="Seleccioná una opción para gestionar tu agenda, consultas e historias clínicas."
        icon={<BsClipboardPulse className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => goBackSafe(navigate, '/')}
      />

      <div className="row g-3 mt-2">
        {opcionesMedico.map((opcion) => (
          <div className="col-12 col-md-6" key={opcion.ruta}>
            <div
              className="card border-0 shadow-sm h-100 bg-white p-3 text-start transition-card"
              style={{
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={() => navigate(opcion.ruta)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
              }}
            >
              <div className="card-body d-flex align-items-start gap-3 p-2">
                <div
                  className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#e6f7f8', minWidth: '60px', minHeight: '60px' }}
                >
                  {opcion.icono}
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-1">{opcion.titulo}</h5>
                  <p className="text-muted small mb-0">{opcion.descripcion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicoHome;
import { useNavigate } from 'react-router-dom';
import { 
  BsCalendarCheck, 
  BsCalendarDay, 
  BsCalendarMonth, 
  BsCalendarDate, 
  BsClockHistory, 
  BsPlusCircle, 
  BsArrowRepeat
} from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';

export const TurnosHome = () => {
  const navigate = useNavigate();

  const opcionesTurnos = [
    {
      titulo: 'Turnos del Día',
      descripcion: 'Visualiza rápidamente todos los turnos programados para el día de hoy.',
      icono: <BsCalendarDay size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/turnos/del-dia',
    },
    {
      titulo: 'Asignar Nuevo Turno',
      descripcion: 'Registra un nuevo turno en el sistema asociando paciente, médico y horario.',
      icono: <BsPlusCircle size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/turnos/asignar',
    },
    {
      titulo: 'Todos los Turnos',
      descripcion: 'Listado general de turnos activos desde la fecha actual en adelante.',
      icono: <BsCalendarCheck size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/turnos/lista',
    },
    {
      titulo: 'Turnos a Reprogramar',
      descripcion: 'Gestiona los pacientes afectados por bloqueos o modificaciones en la agenda médica.',
      icono: <BsArrowRepeat size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/reprogramar-turno',
    },
    {
      titulo: 'Buscar por Fecha Específica',
      descripcion: 'Consulta todos los turnos de un día particular ingresando una fecha.',
      icono: <BsCalendarDate size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/turnos/por-fecha',
    },
    {
      titulo: 'Disponibilidad por Médico / Mes',
      descripcion: 'Revisa el calendario mensual y los turnos disponibles por profesional.',
      icono: <BsCalendarMonth size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/horarioAtencion',
    },
    {
      titulo: 'Turnos Pendientes Históricos',
      descripcion: 'Auditoría de turnos acumulados que quedaron pendientes de atenciones anteriores.',
      icono: <BsClockHistory size={28} style={{ color: '#00ACB2' }} />,
      ruta: '/turnos/historicos',
    },
    
  ];

  return (
    <div className="container-fluid px-2 px-md-4 py-4" style={{ maxWidth: '1000px' }}>
      <PageHeader 
        titulo="Módulo de Turnos"
        subtitulo="Seleccione una opción para administrar la agenda médica de la salita."
        icon={<BsCalendarCheck className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={() => navigate('/')}
      />

      <div className="row g-3 mt-2">
        {opcionesTurnos.map((opcion, index) => (
          <div className="col-12 col-md-6" key={index}>
            <div 
              className="card border-0 shadow-sm h-100 bg-white p-3 text-start transition-card"
              style={{ 
                borderRadius: '12px', 
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
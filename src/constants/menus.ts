import type { IconType } from 'react-icons';
import { 
  BsCalendarCheck, 
  BsHeartPulse, 
  BsCapsule, 
  BsPeople, 
  BsShieldLock, 
  BsHospital,
  BsCheckCircle,
  BsPersonCircle,
  BsJournalMedical
} from 'react-icons/bs';

// Definimos los roles válidos en el sistema
export type UserRole = 'ADMIN' | 'RECEPCIONISTA' | 'PACIENTE' | 'MEDICO';

// Interfaz para los sub-elementos (hijos) del menú desplegable
export interface SubMenuItem {
  id: string;
  label: string;
  path: string;
}

// Interfaz para cada opción del menú principal
export interface MenuItem {
  path?: string;
  id: string;
  label: string;
  icon: IconType;
  badge?: string;
  children?: SubMenuItem[];
}

// Diccionario de menús tipado por rol
export const roleMenus: Record<UserRole, MenuItem[]> = {
  ADMIN: [
    { 
      id: 'turnos-grupo', 
      label: 'Turnos', 
      icon: BsCalendarCheck, 
      children: [
        { id: 'turnos', label: 'Turnos', path: '/turnos' },
        { id: 'turnos-lista', label: 'Lista de Turnos', path: '/turnos/lista' },
        { id: 'turnos-fecha', label: 'Turnos por fecha', path: '/turnos/por-fecha' },
        { id: 'turnos-nuevo', label: 'Nuevo turno', path: '/turnos/asignar' },
        { id: 'turnos-reprogrmar', label: 'Reprogramar turno', path: '/reprogramar-turno' },
      
      ]
    },
    { 
      id: 'horarios-grupo', 
      label: 'Horarios de Atención', 
      icon: BsCheckCircle, 
      children: [
        { id: 'horarios-lista', label: 'Ver Agendas', path: '/horarioAtencion' },
        { id: 'horarios-nuevo', label: 'Configurar Horarios', path: '/horarioAtencion/nuevo' },
      ]
    },
     { 
      id: 'excepcion-grupo', 
      label: 'Excepcion Horario', 
      icon: BsCheckCircle, 
      children: [
        { id: 'excepcion-lista', label: 'Ver Excepciones', path: '/excepcion-horario' },
        { id: 'excepcion-nuevo', label: 'Configurar Excepciones', path: '/excepcion-crear' },
        
      ]
    },
    { id: 'medicos', label: 'Médicos', icon: BsPeople, path: '/medicos' },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse, path: '/pacientes' },
    { id: 'usuarios', label: 'Usuarios del Sistema', icon: BsShieldLock, path: '#' },
    { id: 'especialidades', label: 'Especialidades', icon: BsHospital, path: '#' },
    { id: 'obra-social', label: 'Obras Sociales', icon: BsCapsule, path: '/obras-sociales' },
  ],
  
  RECEPCIONISTA: [
    { 
      id: 'turnos-grupo', 
      label: 'Turnos', 
      icon: BsCalendarCheck, 
     children: [
        { id: 'turnos', label: 'Turnos', path: '/turnos' },
        { id: 'turnos-lista', label: 'Lista de Turnos', path: '/turnos/lista' },
        { id: 'turnos-fecha', label: 'Turnos por fecha', path: '/turnos/por-fecha' },
        { id: 'turnos-nuevo', label: 'Nuevo turno', path: '/turnos/asignar' },
        { id: 'turnos-reprogrmar', label: 'Reprogramar turno', path: '/reprogramar-turno' },
      ]
    },
    { 
      id: 'horarios-grupo', 
      label: 'Horarios de Atención', 
      icon: BsCheckCircle, 
      children: [
        { id: 'horarios-lista', label: 'Ver Agendas', path: '/horarioAtencion' },
        { id: 'horarios-nuevo', label: 'Configurar Horario', path: '/horarioAtencion/nuevo' },
      ]
    },
    { id: 'medicos', label: 'Médicos', icon: BsPeople, path: '/medicos' },  
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse, path: '/pacientes' },
    { id: 'especialidades', label: 'Especialidades', icon: BsHospital, path: '#' },
    { id: 'obra-social', label: 'Obras Sociales', icon: BsCapsule, path: '/obras-sociales' },
  ],

  MEDICO: [
    {
      id: 'pacientes-grupo',
      label: 'Pacientes',
      icon: BsHeartPulse,
      children: [
        { id: 'pacientes-por-atender', label: 'Por atender', path: '/mis-pacientes/por-atender' },
        { id: 'pacientes-atendidos', label: 'Atendidos', path: '/mis-pacientes/atendidos' },
        { id: 'pacientes-listado', label: 'Todos mis pacientes', path: '/pacientes' },
      ]
    },
      { 
      id: 'turnos-grupo', 
      label: 'Consultas', 
      icon: BsCalendarCheck, 
      children: [
        { id: 'consultas-lista', label: 'Mis consultas', path: '/consultas-medicas' },
      ]
    },
     { 
     id: 'horarios-grupo', 
      label: 'Mi horario', 
      icon: BsCheckCircle, 
      children: [
        { id: 'horarios-lista', label: 'Ver mi horario', path: '/horarioAtencion' },
      ]
    },
    { 
      id: 'historial-medico', 
      label: 'Historial de pacientes', 
      icon: BsJournalMedical,
      path: '/historial-medico' 
    }
  ],

  PACIENTE: [
    { id: 'mis-turnos', label: 'Mis Turnos', icon: BsCalendarCheck, path: '/mis-turnos' },
    { id: 'mi-perfil', label: 'Mi Perfil', icon: BsPersonCircle, path: '/mi-perfil' },
  ]
};

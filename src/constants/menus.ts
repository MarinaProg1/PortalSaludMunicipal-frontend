import type { IconType } from 'react-icons';
import { 
  BsCalendarCheck, 
  BsFileEarmarkText, 
  BsHeartPulse, 
  BsCapsule, 
  BsPeople, 
  BsShieldLock, 
  BsHospital,
  BsJournalMedical,
  BsCheckCircle,
  BsPersonCircle
} from 'react-icons/bs';

// Definimos los roles válidos en el sistema
export type UserRole = 'ADMIN' | 'RECEPCIONISTA' | 'PACIENTE' | 'MEDICO';

// Interfaz para cada opción del menú
export interface MenuItem {
  path: string;
  id: string;
  label: string;
  icon: IconType;
  badge?: string;
}

// Diccionario de menús tipado por rol
export const roleMenus: Record<UserRole, MenuItem[]> = {
ADMIN: [
    { id: 'turnos', label: 'Turnos', icon: BsCalendarCheck,path: '/turnos' },
    { id: 'horarios-atencion', label: 'Horarios de Atención', icon: BsCheckCircle,path: '/horarioAtencion' },
    { id: 'medicos', label: 'Médicos', icon: BsPeople,path: '/medicos' },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse,path: '/pacientes' },
    { id: 'usuarios', label: 'Usuarios del Sistema', icon: BsShieldLock,path: '#' },
    { id: 'especialidades', label: 'Especialidades', icon: BsHospital,path: '#' },
    { id: 'obra-social', label: 'Obras Sociales', icon: BsCapsule, path: '/obras-sociales' },
  ],
  
RECEPCIONISTA: [
    { id: 'turnos', label: 'Turnos', icon: BsCalendarCheck,path: '/turnos' },
    { id: 'horarios-atencion', label: 'Horarios de Atención', icon: BsCheckCircle,path: '/horarioAtencion' },
    { id: 'medicos', label: 'Médicos', icon: BsPeople,path: '/medicos' },  
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse,path: '/pacientes' },
    { id: 'especialidades', label: 'Especialidades', icon: BsHospital,path: '#' },
    { id: 'obra-social', label: 'Obras Sociales', icon: BsCapsule, path: '/obras-sociales' },
  ],

  MEDICO: [
    { id: 'turnos', label: 'Mis Turnos', icon: BsCalendarCheck,path: '#' },
    { id: 'horarios-atencion', label: 'Horarios de Atención', icon: BsCheckCircle,path: '/horarioAtencion' },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse,path: '#' },
    { id: 'consultas', label: 'Consultas Médicas', icon: BsJournalMedical,path: '#' },
    { id: 'historias-clinicas', label: 'Historia Clínica', icon: BsFileEarmarkText,path: '#' },
  ],

  PACIENTE: [
    { id: 'mis-turnos', label: 'Mis Turnos', icon: BsCalendarCheck, path: '/mis-turnos' },
    { id: 'mi-perfil', label: 'Mi Perfil', icon: BsPersonCircle, path: '/mi-perfil' },
  ]
};

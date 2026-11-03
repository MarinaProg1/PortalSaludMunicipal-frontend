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
  BsCheckCircle
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
    { id: 'medicos', label: 'Médicos', icon: BsPeople,path: '#' },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse,path: '#' },
    { id: 'usuarios', label: 'Usuarios del Sistema', icon: BsShieldLock,path: '#' },
    { id: 'especialidades', label: 'Especialidades', icon: BsHospital,path: '#' },
    { id: 'obra-social', label: 'Obras Sociales', icon: BsCapsule,path: '#' },
  ],
  
RECEPCIONISTA: [
    { id: 'turnos', label: 'Turnos', icon: BsCalendarCheck,path: '#' },
    { id: 'horarios-atencion', label: 'Horarios de Atención', icon: BsCheckCircle,path: '/horarioAtencion' },
    { id: 'medicos', label: 'Médicos', icon: BsPeople,path: '#' },  
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse,path: '#' },
    { id: 'especialidades', label: 'Especialidades', icon: BsHospital,path: '#' },
    { id: 'obra-social', label: 'Obras Sociales', icon: BsCapsule,path: '#' },
  ],

  MEDICO: [
    { id: 'turnos', label: 'Mis Turnos', icon: BsCalendarCheck,path: '#' },
    { id: 'horarios-atencion', label: 'Horarios de Atención', icon: BsCheckCircle,path: '/horarioAtencion' },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse,path: '#' },
    { id: 'consultas', label: 'Consultas Médicas', icon: BsJournalMedical,path: '#' },
    { id: 'historias-clinicas', label: 'Historia Clínica', icon: BsFileEarmarkText,path: '#' },
  ],

  PACIENTE: [
     { id: 'turnos', label: 'Mis Turnos', icon: BsCalendarCheck,path: '#' },
     { id: 'horarios-atencion', label: 'Horarios de Atención', icon: BsCheckCircle,path: '/horarioAtencion' },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse,path: '#' },

  ]
};
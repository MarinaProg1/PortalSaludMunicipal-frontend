import type { IconType } from 'react-icons';
import {
  BsCalendarCheck,
  BsCalendarX,
  BsHeartPulse,
  BsCapsule,
  BsPeople,
  BsHospital,
  BsCheckCircle,
  BsPersonCircle,
  BsJournalMedical,
  BsHouseDoor,
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
      id: 'home',
      label: 'Home',
      icon: BsHouseDoor,
      path: '/turnos',
    },
    {
      id: 'turnos-grupo',
      label: 'Turnos',
      icon: BsCalendarCheck,
      children: [
        { id: 'turnos-lista', label: 'Lista de Turnos', path: '/turnos/lista' },
        { id: 'turnos-fecha', label: 'Turnos por fecha', path: '/turnos/por-fecha' },
        { id: 'turnos-nuevo', label: 'Nuevo turno', path: '/turnos/asignar' },
        { id: 'turnos-reprogrmar', label: 'Reprogramar turno', path: '/reprogramar-turno' },
      ],
    },
    {
      id: 'horarios-grupo',
      label: 'Horarios de Atención',
      icon: BsCheckCircle,
      children: [
        { id: 'horarios-lista', label: 'Ver Agendas', path: '/horarioAtencion' },
        { id: 'horarios-nuevo', label: 'Configurar Horarios', path: '/horarioAtencion/nuevo' },
      ],
    },
    {
      id: 'excepcion-grupo',
      label: 'Excepcion Horario',
      icon: BsCalendarX,
      children: [
        { id: 'excepcion-lista', label: 'Ver Excepciones', path: '/excepcion-horario' },
        { id: 'excepcion-nuevo', label: 'Configurar Excepciones', path: '/excepcion-crear' },
      ],
    },
    { id: 'medicos', label: 'Médicos', icon: BsPeople, path: '/medicos' },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse, path: '/pacientes' },
    {
      id: 'especialidades',
      label: 'Especialidades',
      icon: BsHospital,
      path: '/especialidades',
    },
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
      ],
    },
    {
      id: 'horarios-grupo',
      label: 'Horarios de Atención',
      icon: BsCheckCircle,
      children: [
        { id: 'horarios-lista', label: 'Ver Agendas', path: '/horarioAtencion' },
        { id: 'horarios-nuevo', label: 'Configurar Horario', path: '/horarioAtencion/nuevo' },
      ],
    },
    { id: 'medicos', label: 'Médicos', icon: BsPeople, path: '/medicos' },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse, path: '/pacientes' },
    { id: 'especialidades', label: 'Especialidades', icon: BsCalendarX, path: '#' },
    { id: 'obra-social', label: 'Obras Sociales', icon: BsCapsule, path: '/obras-sociales' },
  ],

  MEDICO: [
    {
      id: 'home',
      label: 'Home',
      icon: BsHouseDoor,
      path: '/medicos/home',
    },
    {
      id: 'turnos-grupo',
      label: 'Turnos',
      icon: BsCalendarCheck,
      children: [
        { id: 'pacientes-por-atender', label: 'Turnos del día', path: '/turnos/del-dia' },
        { id: 'pacientes-atendidos', label: 'Todos los turnos', path: '/turnos/lista' },
      ],
    },
    { id: 'pacientes', label: 'Pacientes', icon: BsHeartPulse, path: '/pacientes' },
    {
      id: 'consultas-grupo',
      label: 'Consultas',
      icon: BsCalendarCheck,
      children: [
        { id: 'consultas-lista', label: 'Mis consultas', path: '/consultas-medicas-dos' },
      ],
    },
    
    {
      id: 'historial-medico',
      label: 'Historias Clínicas',
      icon: BsJournalMedical,
      path: '/historial-medico',
      children: [
        { id: 'historial-lista', label: 'Historia Clínica', path: '/historial-medico' },
        { id: 'historial-crear', label: 'Nueva Historia Clínica', path: '/historial-medico/nuevo' },
      ],
    },
    {
      id: 'horarios-grupo',
      label: 'Mi horario',
      icon: BsCheckCircle,
      children: [
        { id: 'horarios-lista', label: 'Ver mi horario', path: '/horarioAtencion' },
      ],
    },
  ],

  PACIENTE: [
    { id: 'mis-turnos', label: 'Mis Turnos', icon: BsCalendarCheck, path: '/mis-turnos' },
    { id: 'mi-perfil', label: 'Mi Perfil', icon: BsPersonCircle, path: '/mi-perfil' },
    { id: 'medicos', label: 'Médicos disponibles', icon: BsPeople, path: '/medicos' },
    {
      id: 'especialidades',
      label: 'Especialidades disponibles',
      icon: BsHospital,
      path: '/especialidades',
    },
  ],
};
import React from 'react';
import { roleMenus } from '../../constants/menus'; 
import type { UserRole, MenuItem } from '../../constants/menus'; 
import { Link, useLocation } from 'react-router-dom';
import { BsList } from 'react-icons/bs';
import logoGoya from '../../assets/logo1.png';
interface SidebarProps {
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  return (
    <>
      {/* 1. Botón hamburguesa fijo superior para celulares (Modo Claro) */}
      <nav className="navbar bg-light text-dark d-lg-none fixed-top px-3 shadow-sm border-bottom">
        <button 
          className="navbar-toggler border-0 text-dark" 
          type="button" 
          data-bs-toggle="offcanvas" 
          data-bs-target="#sidebarOffcanvas" 
          aria-controls="sidebarOffcanvas"
        >
          <BsList size={24} />
        </button>
        <span className="navbar-brand mb-0 h6 text-light fw-bold">SALITA MUNICIPAL</span>
      </nav>

      {/* 2. Sidebar fijo para Escritorio */}
      <div 
        className="d-none d-lg-flex flex-column flex-shrink-0 p-3 bg-salud-claro text-darck vh-100 border-end shadow-sm" 
        style={{ width: '280px' }}
      >
        <SidebarContent userRole={userRole} />
      </div>

      {/* 3. Sidebar Offcanvas para Celulares */}
      <div 
        className="offcanvas offcanvas-start bg-light text-dark d-lg-none" 
        tabIndex={-1} 
        id="sidebarOffcanvas" 
        aria-labelledby="sidebarOffcanvasLabel"
      >
        <div className="offcanvas-header border-bottom border-secondary-subtle">
          <h5 className="offcanvas-title fw-bold text-dark" id="sidebarOffcanvasLabel">Portal de Salud</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body p-0">
          <SidebarContent userRole={userRole} isMobile={true} />
        </div>
      </div>
    </>
  );
};

interface SidebarContentProps {
  userRole: UserRole;
  isMobile?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ userRole, isMobile = false }) => {
  const location = useLocation();
  const normalizedRole = userRole.toLowerCase() as UserRole;
  const menuItems: MenuItem[] = roleMenus[normalizedRole] || roleMenus['ADMIN'] || [];

  return (
    <div className="d-flex flex-column h-100 p-1 ">
      {/* Título de la marca (solo en escritorio) */}
      {!isMobile && (
    <div className="pb-3 mb-3 border-bottom border-dark border-opacity-25 text-center ">
      <a className="navbar-brand d-flex align-items-center justify-content-center m-0" href="#">
        <img 
          src={logoGoya} 
          alt="Logo Portal Salud Goya"
          className="img-fluid"
          style={{ width: '100px', height: 'auto' }}
        />
      </a>
      <span className="fw-bold text-dark">Tu sistema de salud</span>
    </div>
  )}

      {/* Lista de Navegación Dinámica con React Router Link */}
      <ul className="nav nav-pills flex-column mb-auto gap-3">
        {menuItems.map((item: MenuItem) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <li key={item.id} className="nav-item">
              <Link
                to={item.path || '#'}
                className={`nav-link d-flex align-items-center justify-content-between text-start w-100 ${
                  isActive ? 'active bg-gradient-salud text-white shadow-sm' : 'text-dark hover-bg-light'
                }`}
                {...(isMobile ? { 'data-bs-dismiss': 'offcanvas' } : {})}
              >
                <span className="d-flex align-items-center gap-2">
                  {Icon && <Icon size={24} />}
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`badge ${isActive ? 'bg-light text-success' : 'bg-light text-dark border'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <hr className="border-dark" />

      {/* Sección inferior de usuario (Perfil / Cerrar Sesión) */}
      <div className="dropdown">
        <a href="#" className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
          <div className="rounded-circle bg-gradient-salud text-white fw-bold d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
            {userRole.substring(0, 2).toUpperCase()}
          </div>
          <strong className="text-capitalize">{userRole}</strong>
        </a>
        <ul className="dropdown-menu shadow" aria-labelledby="dropdownUser1">
          <li><Link className="dropdown-item" to="/configuracion">Configuración</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <li><button className="dropdown-item text-danger bg-transparent border-0 w-100 text-start" onClick={() => { /* Lógica de logout futura */ }}>Cerrar sesión</button></li>
        </ul>
      </div>
    </div>
  );
};
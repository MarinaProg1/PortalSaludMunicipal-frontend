import React, { useState } from 'react';
import { roleMenus } from '../../constants/menus';
import type { UserRole, MenuItem } from '../../constants/menus';
import { Link, useLocation } from 'react-router-dom';
import { BsList, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { LogoPortalSalud } from '../brand/LogoPortalSalud';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  return (
    <>
      {/* 1. Botón hamburguesa fijo superior para celulares */}
      <nav className="navbar app-topbar text-white d-lg-none fixed-top px-3 shadow-sm">
        <button
          className="navbar-toggler border-0 text-white"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
          aria-controls="sidebarOffcanvas"
        >
          <BsList size={24} />
        </button>
        <span className="navbar-brand mb-0 h6 text-white fw-bold">PORTAL SALUD</span>
      </nav>

      {/* 2. Sidebar fijo para Escritorio */}
      <div
        className="d-none d-lg-flex flex-column flex-shrink-0 p-3 app-sidebar vh-100"
        style={{ width: '280px' }}
      >
        <SidebarContent userRole={userRole} />
      </div>

      {/* 3. Sidebar Offcanvas para Celulares */}
      <div
        className="offcanvas offcanvas-start app-sidebar app-sidebar--mobile d-lg-none"
        tabIndex={-1}
        id="sidebarOffcanvas"
        aria-labelledby="sidebarOffcanvasLabel"
      >
        <div className="offcanvas-header app-sidebar__header border-bottom">
          <h5 className="offcanvas-title fw-bold" id="sidebarOffcanvasLabel">Portal de Salud</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body p-0 d-flex flex-column">
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
  const { logout } = useAuth();
  const normalizedRole = (userRole || 'ADMIN').toUpperCase() as UserRole;
  const menuItems: MenuItem[] = roleMenus[normalizedRole] || roleMenus['ADMIN'] || [];

  // Estado para controlar qué grupo desplegable está abierto
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);

  const toggleSubmenu = (id: string) => {
    setMenuAbierto(prev => (prev === id ? null : id));
  };

  return (
    <div className="d-flex flex-column h-100 p-1">
      {/* Título de la marca (solo en escritorio) */}
      {!isMobile && (
        <div className="app-sidebar__brand-wrap pb-3 mb-3 border-bottom text-center">
          <div className="app-sidebar__brand">
            <LogoPortalSalud />
          </div>
        </div>
      )}

      {/* Lista de Navegación Dinámica */}
      <ul
        className="nav nav-pills flex-column mb-auto gap-2"
        style={{ minHeight: 0, overflowY: 'auto' }}
      >
        {menuItems.map((item: MenuItem) => {
          const Icon = item.icon;
          const tieneHijos = item.children && item.children.length > 0;
          const estaAbierto = menuAbierto === item.id;

          // Si NO tiene sub-ítems, se renderiza como un enlace normal
          if (!tieneHijos) {
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
                    {Icon && <Icon size={20} />}
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
          }

          // Si TIENE sub-ítems, se renderiza como un menú desplegable (acordeón)
          const grupoActivo = Boolean(
            item.children?.some(
              (sub) =>
                sub.path &&
                sub.path !== '#' &&
                (location.pathname === sub.path || location.pathname.startsWith(`${sub.path}/`)),
            ),
          );

          return (
            <li key={item.id} className="nav-item">
              <button
                type="button"
                className={`nav-link d-flex align-items-center justify-content-between w-100 border-0 py-2 ${
                  grupoActivo ? 'nav-parent-active' : 'text-dark'
                }`}
                onClick={() => toggleSubmenu(item.id)}
              >
                <span className="d-flex align-items-center gap-2">
                  {Icon && <Icon size={20} />}
                  <span className="fw-semibold">{item.label}</span>
                </span>
                {estaAbierto ? <BsChevronUp size={14} /> : <BsChevronDown size={14} />}
              </button>

              {/* Sub-lista desplegable */}
              {estaAbierto && (
                <ul className="nav flex-column ms-3 ps-2 border-start border-secondary-subtle mt-1 gap-1">
                  {item.children?.map((subItem) => {
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <li key={subItem.id} className="nav-item">
                        <Link
                          to={subItem.path}
                          className={`nav-link py-1 px-2 small ${
                            isSubActive ? 'text-info fw-bold' : 'text-secondary'
                          }`}
                          {...(isMobile ? { 'data-bs-dismiss': 'offcanvas' } : {})}
                        >
                          • {subItem.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <hr className="app-sidebar__divider" />

      {/* Sección inferior de usuario (Perfil / Cerrar Sesión) */}
      <div className="dropdown">
        <button
          className="btn d-flex align-items-center text-dark text-decoration-none dropdown-toggle w-100 border-0 bg-transparent shadow-none"
          type="button"
          id="dropdownUser1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <div className="rounded-circle bg-gradient-salud text-white fw-bold d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
            {userRole.substring(0, 2).toUpperCase()}
          </div>
          <strong className="text-capitalize">{userRole}</strong>
        </button>

        <ul className="dropdown-menu shadow w-100" aria-labelledby="dropdownUser1">
          <li>
            <Link className="dropdown-item" to="/configuracion" {...(isMobile ? { 'data-bs-dismiss': 'offcanvas' } : {})}>
              Configuración
            </Link>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button
              className="dropdown-item text-danger bg-transparent border-0 w-100 text-start"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

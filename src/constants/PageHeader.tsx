import React from 'react';
import { BsArrowLeft } from 'react-icons/bs';

interface PageHeaderProps {
  titulo: string;
  subtitulo: string;
  icon: React.ReactNode;
  onBack?: () => void;
  rightContent?: React.ReactNode; 
}

export const PageHeader: React.FC<PageHeaderProps> = ({ titulo, subtitulo, icon, onBack, rightContent }) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center  gap-3 mb-4 p-3 border-bottom border-secondary-subtle w-100">
      <div>
        <h3 className="fw-bold text-dark mb-1">
          {icon}
          {titulo}
        </h3>
        <p className="text-muted mb-0 small">{subtitulo}</p>
      </div>

      {/* Contenedor derecho: Muestra el botón de volver, el contenido derecho, o ambos */}
      <div className="d-flex align-items-center gap-2">
        {onBack && (
          <button 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-none" 
            onClick={onBack}
          >
            <BsArrowLeft /> Volver
          </button>
        )}
        {rightContent}
      </div>
    </div>
  );
};
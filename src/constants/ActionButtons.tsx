import React from 'react';
import { BsEye, BsPencilSquare, BsTrash } from 'react-icons/bs';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onView, onEdit, onDelete }) => {
  return (
    <div className="d-flex align-items-center gap-2">
      {onView && (
        <button 
          onClick={onView} 
          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-2 shadow-sm"
          title="Ver detalle"
          style={{ borderRadius: '8px' }}
        >
          <BsEye size={16} />
        </button>
      )}
      
      {onEdit && (
        <button 
          onClick={onEdit} 
          className="btn btn-sm btn-action-edit d-flex align-items-center justify-content-center p-2 shadow-sm"
          title="Modificar"
          style={{ borderRadius: '8px' }}
        >
          <BsPencilSquare size={16} />
        </button>
      )}

      {onDelete && (
        <button 
          onClick={onDelete} 
          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center p-2 shadow-sm"
          title="Eliminar"
          style={{ borderRadius: '8px' }}
        >
          <BsTrash size={16} />
        </button>
      )}
    </div>
  );
};
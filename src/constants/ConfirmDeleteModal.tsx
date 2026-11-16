import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  titulo?: string;
  mensaje?: string;
  cargando: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  titulo = 'Confirmar Eliminación',
  mensaje = '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.',
  cargando,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
          
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold text-dark">{titulo}</h5>
            <button 
              type="button" 
              className="btn-close shadow-none" 
              onClick={onClose}
              disabled={cargando}
            ></button>
          </div>

          <div className="modal-body py-3">
            <p className="text-muted mb-0">{mensaje}</p>
          </div>

          <div className="modal-footer border-top-0 pt-0">
            <button 
              type="button" 
              className="btn btn-light px-4" 
              onClick={onClose}
              disabled={cargando}
              style={{ borderRadius: '8px' }}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-danger px-4 text-white fw-semibold shadow-sm" 
              onClick={onConfirm}
              disabled={cargando}
              style={{ borderRadius: '8px' }}
            >
              {cargando ? 'Eliminando...' : 'Confirmar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { BsEye, BsPencil, BsTrash } from 'react-icons/bs';

interface Props {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActionButtons: React.FC<Props> = ({ onView, onEdit, onDelete }) => {
  return (
    <div className="d-flex gap-1 justify-content-end">
      <button className="btn btn-sm btn-light border" onClick={onView}><BsEye /></button>
      <button className="btn btn-sm btn-light border" onClick={onEdit}><BsPencil /></button>
      <button className="btn btn-sm btn-light border text-danger" onClick={onDelete}><BsTrash /></button>
    </div>
  );
};
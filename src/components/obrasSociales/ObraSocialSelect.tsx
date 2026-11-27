import React, { useEffect, useState } from 'react';
import { obraSocialService } from '../../services/obraSocial.service';
import { getObraSocialId, type ObraSocialItem } from './obraSocial.schema';

interface Props {
  value?: string | null;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
  includeInactive?: boolean;
  /** Cambiar este valor fuerza a recargar el listado (ej: tras crear una obra social). */
  refreshKey?: number;
}

export const ObraSocialSelect: React.FC<Props> = ({
  value,
  onChange,
  name = 'obraSocial',
  id = 'obraSocial',
  disabled,
  required,
  className = 'form-select',
  placeholder = 'Seleccionar obra social...',
  includeInactive = false,
  refreshKey = 0,
}) => {
  const [items, setItems] = useState<ObraSocialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const data = await obraSocialService.listar(includeInactive);
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [includeInactive, refreshKey]);

  return (
    <select
      id={id}
      name={name}
      className={className}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
      required={required}
    >
      <option value="">{loading ? 'Cargando...' : placeholder}</option>
      {items.map((os) => (
        <option key={getObraSocialId(os)} value={getObraSocialId(os)}>
          {os.nombre}{os.activo === false ? ' (Inactiva)' : ''}
        </option>
      ))}
    </select>
  );
};

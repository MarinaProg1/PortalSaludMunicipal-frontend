import React, { useEffect, useState } from 'react';
import { pacienteService } from '../../services/paciente.service';
import { getPacienteId, type PacienteItem } from './paciente.schema';

interface Props {
  value?: string;
  onChange: (value: string) => void;
  onSelect?: (paciente: PacienteItem | undefined) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const PacienteSelect: React.FC<Props> = ({
  value,
  onChange,
  onSelect,
  name = 'paciente',
  id = 'paciente',
  disabled,
  required,
  className = 'form-select',
  placeholder = 'Seleccionar paciente...',
}) => {
  const [items, setItems] = useState<PacienteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await pacienteService.listar();
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (selectedId: string) => {
    onChange(selectedId);
    if (onSelect) {
      const found = items.find((p) => getPacienteId(p) === selectedId);
      onSelect(found);
    }
  };

  return (
    <select
      id={id}
      name={name}
      className={className}
      value={value || ''}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled || loading}
      required={required}
    >
      <option value="">{loading ? 'Cargando...' : placeholder}</option>
      {items.map((p) => {
        const pacienteId = getPacienteId(p);
        return (
          <option key={pacienteId} value={pacienteId}>
            {p.apellido}, {p.nombre} - DNI {p.dni}
          </option>
        );
      })}
    </select>
  );
};

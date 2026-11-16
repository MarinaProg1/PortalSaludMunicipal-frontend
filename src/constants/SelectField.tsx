import {type FC,useState, useRef, useEffect, useMemo, type ReactNode } from 'react';

interface TurnoSelectOption {
  value: string;
  label: string;
}

interface TurnoSelectFieldProps {
  label: string;
  value: string;
  options: TurnoSelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  selectClassName?: string;
  labelIcon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  helpText?: ReactNode;
}

export const SelectField: FC<TurnoSelectFieldProps> = ({
  label,
  value,
  options,
  placeholder,
  onChange,
  className = 'mb-3',
  labelIcon,
  required = false,
  disabled = false,
  helpText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Obtenemos el objeto seleccionado completo
  const selectedOption = options.find((opt) => opt.value === value);

  // Filtramos las opciones según lo que escribe el usuario
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Manejar el click fuera del componente para cerrar la lista
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Limpiamos la búsqueda al hacer click afuera
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={className} ref={wrapperRef} style={{ position: 'relative' }}>
      <label className="form-label fw-semibold text-secondary small">
        {labelIcon}
        {label}
      </label>

      {/* Input visual para buscar */}
      <input
        type="text"
        className="form-control" // Cambiamos form-select por form-control
        placeholder={selectedOption ? selectedOption.label : placeholder}
        value={isOpen ? searchTerm : (selectedOption ? selectedOption.label : '')}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        autoComplete="off"
      />

      {/* Select oculto para mantener la validación de formulario nativa (required) */}
      <select 
        value={value} 
        onChange={() => {}} 
        required={required} 
        style={{ display: 'none' }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Menú desplegable con las opciones filtradas */}
      {isOpen && !disabled && (
        <ul
          className="list-group position-absolute w-100 shadow mt-1"
          style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                className={`list-group-item list-group-item-action ${option.value === value ? 'active bg-primary text-white' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onChange(option.value); // Guardamos el ID en el estado padre
                  setSearchTerm('');      // Reseteamos el buscador
                  setIsOpen(false);       // Cerramos la lista
                }}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="list-group-item text-muted">No se encontraron resultados</li>
          )}
        </ul>
      )}
      
      {helpText && <div className="form-text">{helpText}</div>}
    </div>
  );
};
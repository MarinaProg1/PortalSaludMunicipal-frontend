import type { FC, ReactNode } from 'react';

export interface TurnoSelectOption {
  value: string;
  label: string;
}

interface TurnoSelectFieldProps {
  label: string;
  value: string;
  options: TurnoSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
  selectClassName?: string;
  labelIcon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  helpText?: ReactNode;
}

export const TurnoSelectField: FC<TurnoSelectFieldProps> = ({
  label,
  value,
  options,
  placeholder,
  onChange,
  className = 'mb-3',
  selectClassName = 'form-select',
  labelIcon,
  required = false,
  disabled = false,
  helpText,
}) => (
  <div className={className}>
    <label className="form-label fw-semibold text-secondary small">
      {labelIcon}
      {label}
    </label>
    <select
      className={selectClassName}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {helpText}
  </div>
);

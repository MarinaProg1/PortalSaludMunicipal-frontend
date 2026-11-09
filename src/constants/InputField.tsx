import type { FC, ReactNode, InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelIcon?: ReactNode;
  helpText?: ReactNode;
  containerClassName?: string;
}

export const InputField: FC<InputFieldProps> = ({
  label,
  labelIcon,
  helpText,
  containerClassName = 'mb-3',
  className = 'form-control shadow-none',
  ...props
}) => (
  <div className={containerClassName}>
    <label className="form-label fw-semibold text-secondary small d-flex align-items-center">
      {labelIcon}
      {label}
    </label>
    <input className={className} {...props} />
    {helpText && <div className="form-text">{helpText}</div>}
  </div>
);
import type { InputHTMLAttributes } from 'react';
import { inputClass, labelClass } from './styles';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

// Pasangan label + input standar untuk field teks (nama, email, dst).
export default function FormField({ id, label, className, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} className={`${inputClass} ${className ?? ''}`.trim()} {...inputProps} />
    </div>
  );
}

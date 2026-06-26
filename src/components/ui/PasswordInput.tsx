'use client';

import { useState, type ReactNode } from 'react';
import { inputClass, labelClass } from './styles';
import { EyeIcon, EyeOffIcon } from './icons';

type PasswordInputProps = {
  id: string;
  name: string;
  label: string;
  /** Controlled value — kosongkan untuk dipakai uncontrolled (mis. di form login). */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  /** Elemen tambahan di kanan label, mis. link "Lupa password?". */
  labelAction?: ReactNode;
};

// Input password dengan tombol show/hide. Mengelola state visibilitas sendiri.
export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  required = true,
  labelAction,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          className={`${inputClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink"
        >
          {show ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

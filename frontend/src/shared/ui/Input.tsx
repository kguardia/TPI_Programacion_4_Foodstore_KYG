import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const claseControl =
  "w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

interface CampoProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function Campo({ label, error, children }: CampoProps) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm text-slate-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <Campo label={label} error={error}>
      <input className={claseControl} {...props} />
    </Campo>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function Select({ label, error, children, ...props }: SelectProps) {
  return (
    <Campo label={label} error={error}>
      <select className={claseControl} {...props}>
        {children}
      </select>
    </Campo>
  );
}

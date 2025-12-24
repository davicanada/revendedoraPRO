import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon: Icon,
  className = '',
  ...props
}) => (
  <div className="mb-4">
    {label && <label className="block text-sm text-brand-muted mb-1.5 ml-1">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">
          <Icon size={20} />
        </div>
      )}
      <input
        className={`w-full bg-brand-surface border border-transparent focus:border-brand-primary/50 text-white rounded-xl py-3.5 ${
          Icon ? 'pl-11' : 'pl-4'
        } pr-4 outline-none transition-all placeholder-gray-500 ${className}`}
        {...props}
      />
    </div>
  </div>
);

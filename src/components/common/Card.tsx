import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-brand-surface rounded-2xl p-4 shadow-sm border border-white/5 ${className}`}>
    {children}
  </div>
);

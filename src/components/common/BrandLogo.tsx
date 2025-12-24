import React from 'react';
import { Leaf } from 'lucide-react';

interface BrandLogoProps {
  brand: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brand }) => {
  if (brand === 'Natura') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C11 2 10 3 10 5C10 7 12 9 12 9C12 9 14 7 14 5C14 3 13 2 12 2Z" fill="#FF8C42" />
        <path d="M12 9C10 11 8 13 8 16C8 19 10 22 12 22C14 22 16 19 16 16C16 13 14 11 12 9Z" fill="#FF8C42" opacity="0.6" />
      </svg>
    );
  }

  if (brand === 'Avon') {
    return (
      <div className="text-pink-400 font-bold text-xs tracking-tight">AVON</div>
    );
  }

  if (brand === 'O Boticário') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
        <path d="M12 2C10 2 8 4 8 7C8 10 10 12 10 12L10 20C10 21 11 22 12 22C13 22 14 21 14 20L14 12C14 12 16 10 16 7C16 4 14 2 12 2Z" />
      </svg>
    );
  }

  if (brand === 'Eudora') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 4L16 12L12 20L8 12L12 4Z" fill="#FFD700" />
      </svg>
    );
  }

  // Default: initials
  const initials = brand.substring(0, 2).toUpperCase();
  return (
    <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
      <span className="text-brand-primary text-[8px] font-bold">{initials}</span>
    </div>
  );
};

import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
      checked ? 'bg-brand-primary' : 'bg-gray-600'
    }`}
  >
    <div
      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

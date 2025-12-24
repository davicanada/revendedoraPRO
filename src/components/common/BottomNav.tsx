import React from 'react';
import { Home, Package, ShoppingBag, Users } from 'lucide-react';
import { View } from '../../types';

interface BottomNavProps {
  currentView: View;
  setView: (v: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Início' },
    { id: 'stock', icon: Package, label: 'Estoque' },
    { id: 'sales', icon: ShoppingBag, label: 'Vendas' },
    { id: 'customers', icon: Users, label: 'Clientes' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-surface border-t border-brand-secondary/30 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${
                isActive ? 'text-brand-primary' : 'text-gray-500'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

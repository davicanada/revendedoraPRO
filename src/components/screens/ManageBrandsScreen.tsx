import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Toggle, Button } from '../common';
import { generateId } from '../../utils/calculations';

interface BrandItem {
  id: string;
  name: string;
  count: string;
  active: boolean;
}

// BrandLogo Component
const BrandLogo: React.FC<{ brand: string }> = ({ brand }) => {
  if (!brand) return null;

  switch (brand) {
    case 'Natura':
      return (
        <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center overflow-hidden shadow-lg border border-white/10 relative">
           <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path
               d="M50 85C50 85 30 75 25 60C20 45 30 35 35 35C25 35 15 25 25 15C35 5 50 15 50 20C50 15 65 5 75 15C85 25 75 35 65 35C70 35 80 45 75 60C70 75 50 85 50 85Z"
               stroke="white"
               strokeWidth="6"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
             <path
               d="M50 85C50 85 30 75 25 60C20 45 30 35 35 35C25 35 15 25 25 15C35 5 50 15 50 20C50 15 65 5 75 15C85 25 75 35 65 35C70 35 80 45 75 60C70 75 50 85 50 85Z"
               fill="white"
               fillOpacity="0.1"
             />
           </svg>
        </div>
      );
    case 'Avon':
      return (
        <div className="w-12 h-12 rounded-full bg-[#E5004B] flex items-center justify-center overflow-hidden shadow-lg border border-white/10">
           <span className="text-white font-bold tracking-widest text-[11px] font-sans">AVON</span>
        </div>
      );
    case 'O Boticário':
      return (
        <div className="w-12 h-12 rounded-full bg-[#006A4E] flex items-center justify-center overflow-hidden shadow-lg border border-white/10">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="6" y="9" width="12" height="12" rx="4" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              <path d="M9 9h6" />
           </svg>
        </div>
      );
    case 'Eudora':
       return (
        <div className="w-12 h-12 rounded-full bg-[#391345] flex items-center justify-center overflow-hidden shadow-lg border border-white/10">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
             <path d="M6 9l6-6 6 6-6 6-6-6z" fill="#D4AF37" fillOpacity="0.2"/>
             <path d="M12 15v6" />
             <path d="M12 3v6" />
             <path d="M3 12h18" strokeOpacity="0.5"/>
           </svg>
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center overflow-hidden shadow-lg border border-white/10">
           <span className="text-brand-muted text-xs font-bold">
             {brand.length >= 2 ? brand.substring(0,2).toUpperCase() : brand.toUpperCase()}
           </span>
        </div>
      );
  }
};

export const ManageBrandsScreen: React.FC = () => {
  const { setView } = useApp();
  const [brandsList, setBrandsList] = useState<BrandItem[]>([
     { id: '1', name: 'Natura', count: '24 produtos cadastrados', active: true },
     { id: '2', name: 'Avon', count: '18 produtos cadastrados', active: true },
     { id: '3', name: 'O Boticário', count: '8 produtos cadastrados', active: true },
     { id: '4', name: 'Eudora', count: '12 produtos cadastrados', active: true }
  ]);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [tempName, setTempName] = useState('');

  const toggleBrand = (id: string) => {
    setBrandsList(brandsList.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const handleEditClick = (brand: BrandItem) => {
    setEditingBrand(brand);
    setTempName(brand.name);
  };

  const handleAddClick = () => {
     setIsAddingBrand(true);
     setTempName('');
  };

  const saveBrandName = () => {
    if (editingBrand && tempName.trim()) {
      setBrandsList(brandsList.map(b => b.id === editingBrand.id ? { ...b, name: tempName } : b));
      setEditingBrand(null);
    }
  };

  const saveNewBrand = () => {
    if (tempName.trim()) {
       const newBrand: BrandItem = {
          id: generateId(),
          name: tempName,
          count: '0 produtos cadastrados',
          active: true
       };
       setBrandsList([...brandsList, newBrand]);
       setIsAddingBrand(false);
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col bg-brand-dark relative">
       <div className="flex items-center gap-4 mb-6">
         <button onClick={() => setView('settings')} className="text-white"><ArrowLeft size={24} /></button>
         <h2 className="text-2xl font-bold text-white">Gerenciar Marcas</h2>
       </div>
       <p className="text-sm text-brand-muted mb-6 leading-relaxed">Gerencie as marcas de cosméticos que você revende. Ative ou desative marcas para controlar quais aparecem no cadastro de produtos.</p>
       <div className="flex-1 overflow-y-auto space-y-3">
          {brandsList.map(brand => (
             <div key={brand.id} className={`bg-brand-surface rounded-2xl p-4 flex items-center justify-between border border-white/5 transition-opacity ${!brand.active ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                   <BrandLogo brand={brand.name} />
                   <div>
                      <h4 className="text-white font-medium text-sm">{brand.name}</h4>
                      <p className="text-xs text-brand-muted">{brand.count}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                    <Toggle checked={brand.active} onChange={() => toggleBrand(brand.id)} />
                    <button onClick={() => handleEditClick(brand)} className="w-8 h-8 rounded-full bg-[#1a121d] flex items-center justify-center text-brand-muted hover:text-white transition-colors">
                       <Edit2 size={14} />
                    </button>
                </div>
             </div>
          ))}
       </div>
       <Button className="mt-4" onClick={handleAddClick}><Plus size={20} /> Adicionar Nova Marca</Button>
       {editingBrand && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-brand-surface w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl relative">
              <button onClick={() => setEditingBrand(null)} className="absolute right-4 top-4 text-brand-muted hover:text-white"><X size={20} /></button>
              <h3 className="text-xl font-bold text-white mb-6">Editar Marca</h3>
              <div className="mb-6">
                <label className="text-xs text-brand-muted mb-2 block font-medium uppercase tracking-wider">Nome da Marca</label>
                <div className="relative">
                   <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-[#1a121d] border border-transparent focus:border-brand-primary/50 rounded-xl p-4 text-white outline-none" autoFocus />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 scale-75"><BrandLogo brand={tempName} /></div>
                </div>
              </div>
              <div className="flex gap-3"><Button variant="secondary" onClick={() => setEditingBrand(null)}>Cancelar</Button><Button onClick={saveBrandName}>Salvar</Button></div>
           </div>
         </div>
       )}
       {isAddingBrand && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-brand-surface w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl relative">
              <button onClick={() => setIsAddingBrand(false)} className="absolute right-4 top-4 text-brand-muted hover:text-white"><X size={20} /></button>
              <h3 className="text-xl font-bold text-white mb-6">Nova Marca</h3>
              <div className="mb-6">
                <label className="text-xs text-brand-muted mb-2 block font-medium uppercase tracking-wider">Nome da Marca</label>
                <div className="relative">
                   <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-[#1a121d] border border-transparent focus:border-brand-primary/50 rounded-xl p-4 text-white outline-none" placeholder="Ex: Jequiti" autoFocus />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 scale-75"><BrandLogo brand={tempName} /></div>
                </div>
              </div>
              <div className="flex gap-3"><Button variant="secondary" onClick={() => setIsAddingBrand(false)}>Cancelar</Button><Button onClick={saveNewBrand}>Adicionar</Button></div>
           </div>
         </div>
       )}
    </div>
  );
};

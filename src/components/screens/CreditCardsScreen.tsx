import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, Calendar, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Toggle, Button } from '../common';
import { generateId } from '../../utils/calculations';

const BANKS_PRESETS = [
  { name: 'Nubank', color: 'bg-purple-600', icon: 'NB' },
  { name: 'Itaú', color: 'bg-orange-600', icon: 'IT' },
  { name: 'Bradesco', color: 'bg-red-600', icon: 'BR' },
  { name: 'Santander', color: 'bg-red-700', icon: 'SA' },
  { name: 'Banco Inter', color: 'bg-orange-500', icon: 'IN' },
  { name: 'C6 Bank', color: 'bg-gray-800', icon: 'C6' },
  { name: 'Caixa', color: 'bg-blue-600', icon: 'CX' },
  { name: 'Banco do Brasil', color: 'bg-yellow-500', icon: 'BB' },
  { name: 'Outro', color: 'bg-gray-600', icon: 'OT' },
];

interface CreditCardItem {
  id: string;
  name: string;
  due: string;
  active: boolean;
  color: string;
  icon: string;
}

export const CreditCardsScreen: React.FC = () => {
  const { setView, creditCards, setCreditCards } = useApp();
  const [cards, setCards] = useState<CreditCardItem[]>([
    { id: '1', name: 'Nubank', due: '05', active: true, color: 'bg-purple-600', icon: 'NB' },
    { id: '2', name: 'Bradesco', due: '10', active: true, color: 'bg-red-600', icon: 'BR' },
    { id: '3', name: 'C6 Bank', due: '01', active: true, color: 'bg-gray-800', icon: 'C6' },
    { id: '4', name: 'Caixa Econômica', due: '', active: false, color: 'bg-blue-600', icon: 'CX' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardItem | null>(null);
  const [formData, setFormData] = useState({ name: '', due: '', bankIndex: 0 });

  const handleToggle = (id: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cartão? Esta ação não poderá ser desfeita.')) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setEditingCard(null);
    setFormData({ name: '', due: '', bankIndex: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (card: CreditCardItem) => {
    setEditingCard(card);
    const bankIndex = BANKS_PRESETS.findIndex(b => card.name.includes(b.name));
    setFormData({
       name: card.name,
       due: card.due,
       bankIndex: bankIndex !== -1 ? bankIndex : 8
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const selectedBank = BANKS_PRESETS[formData.bankIndex];
    const finalName = formData.name.trim() || selectedBank.name;
    if (editingCard) {
      setCards(cards.map(c => c.id === editingCard.id ? {
        ...c,
        name: finalName,
        due: formData.due,
        color: selectedBank.color,
        icon: selectedBank.icon
      } : c));
    } else {
      const newCard: CreditCardItem = {
        id: generateId(),
        name: finalName,
        due: formData.due,
        active: true,
        color: selectedBank.color,
        icon: selectedBank.icon
      };
      setCards([...cards, newCard]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 h-screen flex flex-col bg-brand-dark relative">
      <div className="flex items-center gap-4 mb-6">
         <button onClick={() => setView('settings')} className="text-white">
           <ArrowLeft size={24} />
         </button>
         <h2 className="text-xl font-bold text-white">Cartões de Crédito</h2>
       </div>
       <button
          onClick={handleOpenAdd}
          className="w-full border border-dashed border-brand-muted/30 text-white py-4 rounded-xl mb-6 flex items-center justify-center gap-2 hover:bg-brand-surface transition-colors"
       >
          <Plus size={18} /> Adicionar Novo Cartão
       </button>
       <h3 className="text-brand-muted text-[10px] font-bold uppercase tracking-wider mb-3">Meus Cartões</h3>
       <div className="flex-1 overflow-y-auto space-y-3 pb-6">
          {cards.length === 0 && (
             <div className="text-center py-10 text-brand-muted text-sm">Nenhum cartão cadastrado.</div>
          )}
          {cards.map(card => (
             <div key={card.id} className={`bg-brand-surface rounded-xl p-4 border border-white/5 ${!card.active && 'opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-8 rounded-md ${card.color} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                         {card.icon}
                      </div>
                      <div>
                         <h4 className="text-white font-medium text-sm">{card.name}</h4>
                         <p className="text-xs text-brand-muted">{card.due ? `Vence dia ${card.due}` : 'Sem data de vencimento'}</p>
                      </div>
                   </div>
                   <Toggle checked={card.active} onChange={() => handleToggle(card.id)} />
                </div>
                <div className="flex gap-4 pt-3 border-t border-white/5">
                   <button onClick={() => handleOpenEdit(card)} className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-white transition-colors">
                      <Edit2 size={12} /> Editar
                   </button>
                   <button onClick={() => handleDelete(card.id)} className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-red-400 transition-colors ml-auto">
                      <Trash2 size={12} /> Remover
                   </button>
                </div>
             </div>
          ))}
       </div>
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
             <div className="bg-brand-surface w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-brand-muted hover:text-white"><X size={20} /></button>
                <h3 className="text-xl font-bold text-white mb-6">{editingCard ? 'Editar Cartão' : 'Novo Cartão'}</h3>
                <div className="space-y-4 mb-6">
                   <div>
                      <label className="text-xs text-brand-muted mb-2 block font-medium uppercase tracking-wider">Banco / Emissor</label>
                      <div className="relative">
                         <select
                            value={formData.bankIndex}
                            onChange={(e) => {
                               const idx = Number(e.target.value);
                               const presetName = BANKS_PRESETS[idx].name;
                               setFormData({ ...formData, bankIndex: idx, name: presetName === 'Outro' ? '' : presetName });
                            }}
                            className="w-full bg-[#1a121d] text-white rounded-xl py-3 px-4 outline-none appearance-none border border-transparent focus:border-brand-primary/50"
                         >
                            {BANKS_PRESETS.map((b, idx) => (<option key={b.name} value={idx}>{b.name}</option>))}
                         </select>
                         <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                      </div>
                   </div>
                   <div className="bg-[#1a121d] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className={`w-10 h-8 rounded-md ${BANKS_PRESETS[formData.bankIndex].color} flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0`}>
                         {BANKS_PRESETS[formData.bankIndex].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                         <label className="text-[10px] text-brand-muted block mb-0.5">Nome do Cartão (Apelido)</label>
                         <input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder={BANKS_PRESETS[formData.bankIndex].name}
                            className="w-full bg-transparent text-white text-sm font-medium outline-none placeholder-gray-600"
                         />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs text-brand-muted mb-2 block font-medium uppercase tracking-wider">Dia do Vencimento</label>
                      <div className="relative">
                         <input
                            type="number" min="1" max="31" value={formData.due}
                            onChange={(e) => setFormData({...formData, due: e.target.value})}
                            placeholder="Ex: 10"
                            className="w-full bg-[#1a121d] text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-brand-primary/50"
                         />
                         <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                      </div>
                   </div>
                </div>
                <div className="flex gap-3">
                   <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                   <Button onClick={handleSave}>Salvar</Button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

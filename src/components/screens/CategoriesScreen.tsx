import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  SprayCan
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common';
import { generateId } from '../../utils/calculations';

const CATEGORY_COLORS = [
  { name: 'Roxo', text: 'text-purple-400', bg: 'bg-purple-400/10' },
  { name: 'Rosa', text: 'text-pink-400', bg: 'bg-pink-400/10' },
  { name: 'Azul', text: 'text-blue-400', bg: 'bg-blue-400/10' },
  { name: 'Laranja', text: 'text-orange-400', bg: 'bg-orange-400/10' },
  { name: 'Verde', text: 'text-green-400', bg: 'bg-green-400/10' },
  { name: 'Vermelho', text: 'text-red-400', bg: 'bg-red-400/10' },
];

type ModalMode = 'create_category' | 'edit_category' | 'create_sub' | 'edit_sub' | null;

interface EditingCategory {
  id: string;
  name: string;
  color: string;
}

interface EditingSub {
  parentId: string;
  index: number;
  name: string;
}

export const CategoriesScreen: React.FC = () => {
  const { categories, setView, setCategories } = useApp();
  const [search, setSearch] = useState('');

  // Modal State
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [editingSub, setEditingSub] = useState<EditingSub | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);

  const toggleExpand = (id: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c));
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  // -- CRUD Operations --

  // Category
  const openCreateCategory = () => {
    setModalMode('create_category');
    setInputValue('');
    setSelectedColor(0);
  };

  const openEditCategory = (category: EditingCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(category);
    setInputValue(category.name);
    const colorIndex = CATEGORY_COLORS.findIndex(c => c.text === category.color);
    setSelectedColor(colorIndex >= 0 ? colorIndex : 0);
    setModalMode('edit_category');
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Todas as subcategorias associadas também serão removidas permanentemente.')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const saveCategory = () => {
    if (!inputValue.trim()) return;
    const colorObj = CATEGORY_COLORS[selectedColor];

    if (modalMode === 'create_category') {
      const newCat = {
        id: generateId(),
        name: inputValue,
        color: colorObj.text,
        subcategories: []
      };
      setCategories([...categories, newCat]);
    } else if (modalMode === 'edit_category' && editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? {
        ...c,
        name: inputValue,
        color: colorObj.text
      } : c));
    }
    setModalMode(null);
  };

  // Subcategory
  const openCreateSub = (parentId: string) => {
    setEditingSub({ parentId, index: -1, name: '' });
    setInputValue('');
    setModalMode('create_sub');
  };

  const openEditSub = (parentId: string, index: number, name: string) => {
    setEditingSub({ parentId, index, name });
    setInputValue(name);
    setModalMode('edit_sub');
  };

  const handleDeleteSub = (parentId: string, index: number, subName: string) => {
    if (window.confirm(`Tem certeza que deseja remover "${subName}"? Esta ação não pode ser desfeita.`)) {
      setCategories(prev => prev.map(c => {
        if (c.id === parentId) {
          const newSubs = [...c.subcategories];
          newSubs.splice(index, 1);
          return { ...c, subcategories: newSubs };
        }
        return c;
      }));
    }
  };

  const saveSub = () => {
    if (!inputValue.trim() || !editingSub) return;

    setCategories(categories.map(c => {
      if (c.id === editingSub.parentId) {
        const newSubs = [...c.subcategories];
        if (modalMode === 'create_sub') {
           newSubs.push(inputValue);
        } else {
           newSubs[editingSub.index] = inputValue;
        }
        return { ...c, subcategories: newSubs };
      }
      return c;
    }));
    setModalMode(null);
  };

  return (
    <div className="p-6 h-screen flex flex-col bg-brand-dark">
       <div className="flex justify-between items-center mb-6">
         <button onClick={() => setView('stock')} className="text-white hover:text-brand-primary"><ArrowLeft size={24} /></button>
         <h2 className="text-xl font-bold text-white">Categorias</h2>
         <div className="w-6"></div>
       </div>
       <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar categoria..."
              className="w-full bg-brand-surface text-white pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-white/5 focus:border-brand-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
       </div>
       <div className="flex-1 overflow-y-auto space-y-3 pb-20">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="bg-brand-surface rounded-2xl overflow-hidden border border-white/5">
              <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleExpand(cat.id)}>
                 <div className={`w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary`}><SprayCan size={24} /></div>
                 <div className="flex-1"><h4 className="text-white font-semibold text-sm">{cat.name}</h4><p className="text-xs text-brand-muted">{cat.subcategories.length} subcategorias</p></div>

                 <div className="flex items-center gap-2">
                   <button onClick={(e) => openEditCategory({ id: cat.id, name: cat.name, color: cat.color || 'text-purple-400' }, e)} className="p-2 hover:bg-white/10 rounded-full text-brand-muted hover:text-white"><Edit2 size={16} /></button>
                   <button onClick={(e) => handleDeleteCategory(cat.id, e)} className="p-2 hover:bg-white/10 rounded-full text-brand-muted hover:text-red-400"><Trash2 size={16} /></button>
                   <div className="text-brand-muted ml-1">{cat.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                 </div>
              </div>
              {cat.expanded && (
                 <div className="bg-[#1a121d] px-4 pb-4 pt-1 space-y-1 border-t border-white/5">
                    {cat.subcategories.length === 0 && <p className="text-xs text-brand-muted py-2 pl-14 italic">Nenhuma subcategoria.</p>}
                    {cat.subcategories.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 pl-12 pr-2 rounded-lg hover:bg-white/5 transition-colors group">
                         <span className="text-sm text-gray-300">{sub}</span>
                         <div className="flex gap-2">
                            <button onClick={() => openEditSub(cat.id, idx, sub)} className="p-2 text-brand-muted hover:text-white"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteSub(cat.id, idx, sub)} className="p-2 text-brand-muted hover:text-red-400"><Trash2 size={14} /></button>
                         </div>
                      </div>
                    ))}
                    <button
                      onClick={() => openCreateSub(cat.id)}
                      className="flex items-center gap-2 pl-12 py-3 text-brand-primary text-xs font-medium hover:text-white transition-colors w-full"
                    >
                      <Plus size={14} /> Adicionar Subcategoria
                    </button>
                 </div>
              )}
            </div>
          ))}
       </div>
       <button onClick={openCreateCategory} className="absolute bottom-6 right-6 w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30 text-brand-dark hover:scale-105 transition-transform"><Plus size={28} /></button>

       {/* Modal for Categories and Subcategories */}
       {modalMode && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-brand-surface w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl relative">
              <button onClick={() => setModalMode(null)} className="absolute right-4 top-4 text-brand-muted hover:text-white"><X size={20} /></button>
              <h3 className="text-xl font-bold text-white mb-6">
                {modalMode === 'create_category' && 'Nova Categoria'}
                {modalMode === 'edit_category' && 'Editar Categoria'}
                {modalMode === 'create_sub' && 'Nova Subcategoria'}
                {modalMode === 'edit_sub' && 'Editar Subcategoria'}
              </h3>

              <div className="mb-6">
                <label className="text-xs text-brand-muted mb-2 block font-medium uppercase tracking-wider">Nome</label>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-[#1a121d] border border-transparent focus:border-brand-primary/50 rounded-xl p-4 text-white outline-none"
                  placeholder="Digite o nome..."
                  autoFocus
                />
              </div>

              {(modalMode === 'create_category' || modalMode === 'edit_category') && (
                <div className="mb-8">
                   <label className="text-xs text-brand-muted mb-3 block font-medium uppercase tracking-wider">Cor do Ícone</label>
                   <div className="flex justify-between gap-2">
                      {CATEGORY_COLORS.map((color, idx) => (
                         <button
                          key={color.name}
                          onClick={() => setSelectedColor(idx)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${color.bg} ${selectedColor === idx ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                         >
                           <div className={`w-4 h-4 rounded-full ${color.text.replace('text-', 'bg-')}`}></div>
                         </button>
                      ))}
                   </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setModalMode(null)}>Cancelar</Button>
                <Button onClick={modalMode.includes('sub') ? saveSub : saveCategory}>Salvar</Button>
              </div>
           </div>
         </div>
       )}
    </div>
  );
};

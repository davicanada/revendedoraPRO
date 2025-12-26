import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Camera, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Brand } from '../../types';
import { Input, Button } from '../common';

export const AddProductScreen: React.FC = () => {
  const { categories, setView, addProduct } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const selectedCategoryData = categories.find(c => c.name === selectedCategory);
  const subcategories = selectedCategoryData?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const brand = formData.get('brand') as Brand;
    const category = formData.get('category') as string;
    const subcategory = formData.get('subcategory') as string;
    const quantity = Number(formData.get('quantity'));
    const costPrice = Number(formData.get('costPrice'));
    const salePrice = Number(formData.get('salePrice'));

    if (!name || !brand || !category) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const fullCategory = subcategory ? `${category} - ${subcategory}` : category;

    const newProduct = {
      name,
      brand,
      category: fullCategory,
      stockQuantity: quantity,
      costPrice,
      salePrice,
      image: 'https://picsum.photos/100/100?random=' + Math.random()
    };

    try {
      await addProduct(newProduct);
      setView('stock');
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-brand-dark relative">
      <div className="flex items-center justify-between p-6">
        <button onClick={() => setView('stock')} className="text-brand-muted text-sm font-medium hover:text-white">Cancelar</button>
        <h2 className="text-lg font-bold text-white">Novo Produto</h2>
        <div className="w-16"></div>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-24">
         <div className="w-full h-40 bg-brand-surface/30 border-2 border-dashed border-brand-primary/20 rounded-2xl flex flex-col items-center justify-center mb-6">
            <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center text-brand-muted mb-2"><ImageIcon size={24} /></div>
            <span className="text-xs text-brand-muted">Nenhuma imagem</span>
         </div>
         <div className="grid grid-cols-3 gap-3 mb-8">
            <button type="button" className="flex flex-col items-center justify-center gap-2 bg-brand-surface p-4 rounded-xl border border-white/5 hover:bg-brand-surface/80">
               <div className="w-8 h-8 rounded-full bg-[#f9a8d4]/10 flex items-center justify-center text-brand-primary"><Camera size={18} /></div>
               <span className="text-[10px] text-brand-muted font-medium">Câmera</span>
            </button>
            <button type="button" className="flex flex-col items-center justify-center gap-2 bg-brand-surface p-4 rounded-xl border border-white/5 hover:bg-brand-surface/80">
               <div className="w-8 h-8 rounded-full bg-[#f9a8d4]/10 flex items-center justify-center text-brand-primary"><LinkIcon size={18} /></div>
               <span className="text-[10px] text-brand-muted font-medium">Link URL</span>
            </button>
            <button type="button" className="flex flex-col items-center justify-center gap-2 bg-brand-surface p-4 rounded-xl border border-white/5 hover:bg-brand-surface/80">
               <div className="w-8 h-8 rounded-full bg-[#f9a8d4]/10 flex items-center justify-center text-brand-primary"><ImageIcon size={18} /></div>
               <span className="text-[10px] text-brand-muted font-medium">Galeria</span>
            </button>
         </div>
         <div className="space-y-5">
           <div className="bg-[#2a1b2e]/50 p-1 rounded-xl">
             <Input label="Nome do Produto" name="name" required placeholder="Ex: Kaiak Aero" className="!bg-brand-surface !border-none" />
           </div>
           <div className="mb-4">
              <label className="block text-sm text-brand-muted mb-1.5 ml-1">Marca</label>
              <div className="relative">
                <select name="brand" className="w-full bg-brand-surface text-white rounded-xl py-3.5 px-4 outline-none appearance-none border border-transparent focus:border-brand-primary/50">
                  <option value="">Selecione...</option>
                  <option value={Brand.NATURA}>Natura</option>
                  <option value={Brand.AVON}>Avon</option>
                  <option value={Brand.OTHER}>Outra</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
              </div>
           </div>
           <div className="mb-4">
              <label className="block text-sm text-brand-muted mb-1.5 ml-1">Categoria</label>
              <div className="relative">
                <select name="category" className="w-full bg-brand-surface text-white rounded-xl py-3.5 px-4 outline-none appearance-none border border-transparent focus:border-brand-primary/50">
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
              </div>
           </div>
           <div className="mb-4">
             <div className="flex justify-between items-center mb-1.5 ml-1">
               <label className="block text-sm text-brand-muted">Descrição</label>
               <span className="text-[10px] bg-brand-surface px-2 py-0.5 rounded text-brand-muted">Opcional</span>
             </div>
             <textarea rows={4} className="w-full bg-brand-surface border border-transparent focus:border-brand-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all placeholder-gray-500 resize-none text-sm" placeholder="Adicione detalhes sobre a fragrância, modo de uso ou observações..."></textarea>
           </div>
         </div>
      </form>
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-dark to-transparent">
        <Button type="submit" onClick={handleSubmit} className="!rounded-full"><div className="w-5 h-5 rounded-full bg-brand-dark text-brand-primary flex items-center justify-center"><ChevronRight size={14} strokeWidth={4} /></div> Salvar Produto</Button>
      </div>
    </div>
  );
};

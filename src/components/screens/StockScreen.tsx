import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, MoreHorizontal, Plus, Trash2, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Brand } from '../../types';

export const StockScreen: React.FC = () => {
  const { products, setView, setProducts } = useApp();
  const [filter, setFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState<'Todas' | Brand | 'Baixo Estoque'>('Todas');

  const totalInvested = products.reduce((acc, p) => acc + (p.costPrice * p.stockQuantity), 0);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase());
    if (brandFilter === 'Todas') return matchesSearch;
    if (brandFilter === 'Baixo Estoque') return matchesSearch && p.stockQuantity < 3;
    return matchesSearch && p.brand === brandFilter;
  });

  const handleDeleteProduct = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir "${name}"? Esta ação não poderá ser desfeita.`)) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const getStatusBadge = (stock: number): JSX.Element | null => {
    if (stock === 0) return <span className="bg-red-500/10 text-red-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-red-500/20">Esgotado</span>;
    if (stock < 3) return <span className="bg-yellow-500/10 text-yellow-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-yellow-500/20">Baixo</span>;
    return null;
  };

  return (
    <div className="p-6 pb-24 h-screen flex flex-col bg-brand-dark">
      <div className="flex justify-between items-start mb-6">
         <div className="flex items-center gap-3">
           <button onClick={() => setView('dashboard')} className="text-white hover:text-brand-primary"><ArrowLeft size={24} /></button>
           <div><h2 className="text-2xl font-bold text-white leading-none">Estoque</h2><p className="text-brand-muted text-xs mt-1">Gerencie seus produtos</p></div>
         </div>
         <div className="text-right">
            <span className="text-[10px] text-brand-muted font-bold tracking-wider uppercase">TOTAL INVESTIDO</span>
            <p className="text-brand-primary font-bold text-lg">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
         </div>
      </div>
      <div className="mb-4">
         <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input type="text" placeholder="Buscar por nome, marca..." className="w-full bg-brand-surface text-white pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-1 ring-brand-primary border border-white/5" value={filter} onChange={e => setFilter(e.target.value)} />
          </div>
          <div className="flex gap-1">
            <button className="bg-brand-surface p-3 rounded-xl text-brand-muted border border-white/5 hover:text-white"><Filter size={20} /></button>
            <button className="bg-brand-surface p-3 rounded-xl text-brand-muted border border-white/5 hover:text-white" onClick={() => setView('categories')}><MoreHorizontal size={20} /></button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[{ id: 'Todas', label: 'Todos' }, { id: 'Baixo Estoque', label: 'Baixo Estoque' }, { id: Brand.NATURA, label: 'Natura' }, { id: Brand.AVON, label: 'Avon' }].map(b => (
            <button key={b.id} onClick={() => setBrandFilter(b.id as 'Todas' | Brand | 'Baixo Estoque')} className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${brandFilter === b.id ? 'bg-white text-brand-dark' : 'bg-brand-surface text-brand-muted border border-white/5'}`}>{b.label}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-brand-surface p-3 rounded-2xl flex gap-3 items-center border border-white/5 relative overflow-hidden group">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${product.brand === Brand.NATURA ? 'bg-orange-500' : 'bg-pink-500'}`}></div>
            <div className="w-16 h-16 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden ml-2"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div>
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-bold uppercase ${product.brand === Brand.NATURA ? 'text-orange-400' : 'text-pink-400'}`}>{product.brand}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="text-[10px] text-brand-muted">{product.category}</span>
                {getStatusBadge(product.stockQuantity)}
              </div>
              <h4 className="text-white font-semibold text-sm truncate mb-1 leading-tight">{product.name}</h4>
              <p className="text-brand-muted font-medium text-xs">R$ {product.salePrice.toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-end pr-1 gap-2">
               <div className="text-right">
                  <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${product.stockQuantity < 3 ? 'text-yellow-500' : 'text-brand-muted'}`}>{product.stockQuantity < 3 ? 'Restam' : 'Estoque'}</span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className={`text-xl font-bold leading-none ${product.stockQuantity === 0 ? 'text-red-500' : 'text-white'}`}>{product.stockQuantity}</span>
                    <span className="text-[9px] text-brand-muted">unid.</span>
                  </div>
               </div>
               <button onClick={(e) => handleDeleteProduct(e, product.id, product.name)} className="p-1.5 bg-white/5 rounded-full text-brand-muted hover:text-red-400 hover:bg-white/10 transition-colors">
                  <Trash2 size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setView('add-product')} className="absolute bottom-20 right-6 w-14 h-14 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/30 text-brand-dark hover:scale-110 transition-transform"><Plus size={28} /></button>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
   X,
   HelpCircle,
   Users,
   ChevronDown,
   UserPlus,
   Search,
   ScanBarcode,
   Plus,
   Minus,
   Tag,
   Info,
   CheckCircle2,
   SprayCan,
   Brush,
   Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Sale, SaleType } from '../../types';
import { generateId, formatCurrency } from '../../utils/calculations';

interface CartItem {
   product: Product;
   quantity: number;
   unitPrice: number;
}

export const NewSaleScreen: React.FC = () => {
   const { products, customers, sales, setView, setSales, setProducts, setCustomers, settings } = useApp();

   // Cart now stores unitPrice to allow user override
   const [cart, setCart] = useState<CartItem[]>([]);
   const [saleType, setSaleType] = useState<SaleType>(SaleType.PHYSICAL);
   const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [discount, setDiscount] = useState('');
   const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');

   const filteredProducts = useMemo(() => {
      return products.filter(p => {
         const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase());
         const matchBrand = !selectedBrand || p.brand === selectedBrand;
         const matchCategory = !selectedCategory || p.category === selectedCategory;
         return matchSearch && matchBrand && matchCategory;
      });
   }, [products, searchTerm, selectedBrand, selectedCategory]);

   const brands = useMemo(() => {
      const uniqueBrands = Array.from(new Set(products.map(p => p.brand)));
      return uniqueBrands.sort();
   }, [products]);

   const availableCategories = useMemo(() => {
      const uniqueCats = Array.from(new Set(products.map(p => p.category)));
      return uniqueCats.sort();
   }, [products]);

   const addToCart = (product: Product) => {
      const existingItem = cart.find(item => item.product.id === product.id);

      if (saleType === SaleType.PHYSICAL && product.stockQuantity === 0) {
         alert("Produto esgotado no estoque físico.");
         return;
      }

      // Default Price Logic: Cost + defaultCommission for Physical, Catalog Price for Online
      const defaultPrice = saleType === SaleType.PHYSICAL
         ? product.costPrice * (1 + settings.defaultCommission)
         : product.salePrice;

      if (existingItem) {
         if (saleType === SaleType.PHYSICAL && existingItem.quantity >= product.stockQuantity) {
            alert("Limite de estoque atingido para este item.");
            return;
         }
         setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
         setCart([...cart, { product, quantity: 1, unitPrice: defaultPrice }]);
      }
   };

   const decreaseFromCart = (productId: string) => {
      const existingItem = cart.find(item => item.product.id === productId);
      if (existingItem) {
         if (existingItem.quantity > 1) {
            setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
         } else {
            setCart(cart.filter(item => item.product.id !== productId));
         }
      }
   };

   const updateCartItemPrice = (productId: string, newPrice: string) => {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price < 0) return;
      setCart(cart.map(item =>
         item.product.id === productId ? { ...item, unitPrice: price } : item
      ));
   };

   const getQuantityInCart = (productId: string) => {
      return cart.find(item => item.product.id === productId)?.quantity || 0;
   };

   // Calculations
   const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
   const totalCost = saleType === SaleType.PHYSICAL
      ? cart.reduce((acc, item) => acc + (item.product.costPrice * item.quantity), 0)
      : 0;

   const discountValue = useMemo(() => {
      if (!discount) return 0;
      const val = parseFloat(discount);
      if (isNaN(val)) return 0;
      return discountType === 'percent' ? subtotal * (val / 100) : val;
   }, [discount, discountType, subtotal]);

   const totalSale = Math.max(0, subtotal - discountValue);

   // Profit Logic: (Revenue - Cost) - Discount
   // For Online: Revenue * 0.15 (commission) - Discount (assuming discount eats commission)
   // For Physical: (Revenue - Cost) - Discount
   const totalProfit = useMemo(() => {
      if (saleType === SaleType.ONLINE) {
         const commission = subtotal * settings.defaultCommission;
         return commission - discountValue;
      } else {
         return (subtotal - totalCost) - discountValue;
      }
   }, [subtotal, totalCost, discountValue, saleType, settings.defaultCommission]);

   const handleFinalizeSale = () => {
      if (!selectedCustomerId) {
         alert("Por favor, selecione um cliente.");
         return;
      }
      if (cart.length === 0) {
         alert("O carrinho está vazio.");
         return;
      }

      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

      const newSale: Sale = {
         id: generateId(),
         customerId: selectedCustomerId,
         customerName: selectedCustomer ? selectedCustomer.name : 'Cliente Desconhecido',
         date: new Date().toISOString(),
         type: saleType,
         totalAmount: totalSale,
         profit: totalProfit,
         items: cart.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice
         }))
      };

      setSales([newSale, ...sales]);

      if (saleType === SaleType.PHYSICAL) {
         const updatedProducts = products.map(p => {
            const cartItem = cart.find(c => c.product.id === p.id);
            if (cartItem) {
               return { ...p, stockQuantity: Math.max(0, p.stockQuantity - cartItem.quantity) };
            }
            return p;
         });
         setProducts(updatedProducts);
      }

      const updatedCustomers = customers.map(c => {
         if (c.id === selectedCustomerId) {
            return {
               ...c,
               totalSpent: c.totalSpent + totalSale,
               lastPurchaseDate: new Date().toISOString()
            };
         }
         return c;
      });
      setCustomers(updatedCustomers);

      setView('sales');
   };

   return (
      <div className="flex flex-col h-screen bg-brand-dark">
         {/* Header */}
         <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-brand-dark/90 backdrop-blur-md border-b border-white/5">
            <button onClick={() => setView('dashboard')} className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
               <X className="text-white" size={24} />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight flex-1 text-center">Nova Venda</h1>
            <button className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
               <HelpCircle className="text-brand-primary" size={24} />
            </button>
         </header>

         <main className="flex-1 flex flex-col px-4 pt-2 pb-24 gap-6 overflow-y-auto">
            {/* Sale Type Toggle */}
            <div className="w-full">
               <div className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2A4535]/30 p-1 border border-white/5">
                  <button
                     onClick={() => setSaleType(SaleType.PHYSICAL)}
                     className={`h-full grow flex items-center justify-center rounded-lg transition-all duration-200 text-sm font-semibold ${saleType === SaleType.PHYSICAL ? 'bg-[#2A4535] text-white shadow-sm' : 'text-brand-muted hover:bg-white/5'}`}
                  >
                     Estoque Físico
                  </button>
                  <button
                     onClick={() => setSaleType(SaleType.ONLINE)}
                     className={`h-full grow flex items-center justify-center rounded-lg transition-all duration-200 text-sm font-semibold ${saleType === SaleType.ONLINE ? 'bg-purple-600 text-white shadow-sm' : 'text-brand-muted hover:bg-white/5'}`}
                  >
                     Venda Online
                  </button>
               </div>
               <p className="mt-2 text-xs text-center text-brand-muted">
                  {saleType === SaleType.PHYSICAL ? `Preço sugerido: Custo Médio + ${(settings.defaultCommission * 100).toFixed(0)}%` : `Comissão fixa de ${(settings.defaultCommission * 100).toFixed(0)}% sobre a venda`}
               </p>
            </div>

            {/* Customer Select */}
            <div className="flex flex-col gap-2">
               <label className="text-sm font-semibold text-gray-300 ml-1">Cliente</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                     <Users size={20} />
                  </div>
                  <select
                     value={selectedCustomerId}
                     onChange={(e) => setSelectedCustomerId(e.target.value)}
                     className="w-full appearance-none rounded-xl bg-brand-surface py-4 pl-10 pr-10 text-base shadow-sm border border-white/10 focus:border-brand-primary text-white transition-all outline-none"
                  >
                     <option value="" disabled>Selecionar cliente...</option>
                     {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-brand-muted">
                     <ChevronDown size={20} />
                  </div>
               </div>
               <button onClick={() => setView('add-customer')} className="flex items-center gap-1 ml-1 text-xs text-brand-primary font-medium hover:text-white transition-colors self-start">
                  <UserPlus size={14} /> Novo Cliente Rápido
               </button>
            </div>

            {/* Product Search & Filter */}
            <div className="flex flex-col gap-2">
               <label className="text-sm font-semibold text-gray-300 ml-1">Produto</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                     <Search size={20} />
                  </div>
                  <input
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full rounded-xl bg-brand-surface py-4 pl-10 pr-12 text-base shadow-sm border border-white/10 focus:border-brand-primary text-white placeholder-gray-500 outline-none transition-all"
                     placeholder="Buscar produto por nome..."
                     type="text"
                  />
                  <button className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-muted hover:text-brand-primary transition-colors">
                     <ScanBarcode size={20} />
                  </button>
               </div>
               {/* Brand Chips */}
               <div className="flex gap-2 mt-1 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                     onClick={() => setSelectedBrand(null)}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm ${!selectedBrand ? 'bg-brand-primary text-brand-dark border-brand-primary' : 'bg-brand-surface border-white/10 text-white hover:border-brand-primary/50'}`}
                  >
                     <span className="text-xs font-medium whitespace-nowrap">Todas Marcas</span>
                  </button>
                  {brands.map(brand => (
                     <button
                        key={brand}
                        onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm ${selectedBrand === brand ? 'bg-brand-primary text-brand-dark border-brand-primary' : 'bg-brand-surface border-white/10 text-white hover:border-brand-primary/50'}`}
                     >
                        <div className={`w-2 h-2 rounded-full ${brand === 'Natura' ? 'bg-orange-500' : brand === 'Avon' ? 'bg-red-600' : 'bg-purple-500'}`}></div>
                        <span className="text-xs font-medium whitespace-nowrap">{brand}</span>
                     </button>
                  ))}
               </div>

               {/* Category Chips */}
               <div className="flex gap-2 mt-1 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                     onClick={() => setSelectedCategory(null)}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm ${!selectedCategory ? 'bg-brand-primary text-brand-dark border-brand-primary' : 'bg-brand-surface border-white/10 text-white hover:border-brand-primary/50'}`}
                  >
                     <span className="text-xs font-medium whitespace-nowrap">Todas Categorias</span>
                  </button>
                  {availableCategories.map(cat => (
                     <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm ${selectedCategory === cat ? 'bg-brand-primary text-brand-dark border-brand-primary' : 'bg-brand-surface border-white/10 text-white hover:border-brand-primary/50'}`}
                     >
                        <span className="text-xs font-medium whitespace-nowrap">{cat}</span>
                     </button>
                  ))}
               </div>
            </div>

            {/* Product List / Cart */}
            <div className="flex flex-col gap-3 mt-1">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider">{cart.length > 0 ? 'Itens no Carrinho' : 'Sugestões Recentes'}</h3>
               </div>

               {/* Logic: If searching OR filtering OR cart has items, show results/cart. Else show recent suggestions */}
               {((searchTerm || selectedBrand || selectedCategory || cart.length > 0) ?
                  (filteredProducts.length > 0 ? filteredProducts : []) :
                  products.slice(0, 5)).map((product, idx) => {
                     const qty = getQuantityInCart(product.id);
                     const cartItem = cart.find(c => c.product.id === product.id);
                     const isOutOfStock = saleType === SaleType.PHYSICAL && product.stockQuantity === 0;

                     return (
                        <div key={product.id} className={`flex flex-col rounded-xl bg-brand-surface p-3 shadow-sm border border-white/5 hover:border-brand-primary/30 transition-all text-left group ${isOutOfStock ? 'opacity-50' : ''}`}>
                           <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary overflow-hidden">
                                 {/* Icon based on category approximation */}
                                 {product.category.includes('Perfumaria') ? <SprayCan size={20} /> :
                                    product.category.includes('Maquiagem') ? <Brush size={20} /> : <Package size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="truncate text-sm font-medium text-white group-hover:text-brand-primary transition-colors">{product.name}</p>
                                 <div className="flex flex-col">
                                    <p className="truncate text-xs text-brand-muted">{product.brand}</p>
                                    {saleType === SaleType.PHYSICAL && (
                                       <span className="text-[10px] text-brand-muted flex items-center gap-1">
                                          Custo Médio: {formatCurrency(product.costPrice)}
                                       </span>
                                    )}
                                 </div>
                              </div>

                              {/* Qty Control */}
                              {qty > 0 ? (
                                 <div className="flex items-center bg-[#1a121d] rounded-lg">
                                    <button onClick={() => decreaseFromCart(product.id)} className="p-2 text-brand-muted hover:text-white"><Minus size={16} /></button>
                                    <span className="text-sm font-bold text-white w-4 text-center">{qty}</span>
                                    <button onClick={() => addToCart(product)} className="p-2 text-brand-primary hover:text-white"><Plus size={16} /></button>
                                 </div>
                              ) : (
                                 <button onClick={() => addToCart(product)} disabled={isOutOfStock} className="flex items-center gap-1 text-brand-muted group-hover:text-brand-primary p-2">
                                    <Plus size={24} />
                                 </button>
                              )}
                           </div>

                           {/* Price Input (Only show if in cart) */}
                           {qty > 0 && cartItem && (
                              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between animate-fade-in">
                                 <span className="text-xs text-brand-muted">Preço Unitário</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs text-brand-muted">R$</span>
                                    <input
                                       type="number"
                                       value={cartItem.unitPrice.toFixed(2)}
                                       onChange={(e) => updateCartItemPrice(product.id, e.target.value)}
                                       className="w-20 bg-[#1a121d] text-white text-right text-sm font-medium rounded p-1 border border-white/10 focus:border-brand-primary outline-none"
                                    />
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })}
               {((searchTerm || selectedBrand || selectedCategory) && filteredProducts.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-brand-surface/50 rounded-2xl border border-dashed border-white/10">
                     <Package className="text-brand-muted mb-3 opacity-20" size={48} />
                     <p className="text-white font-medium">Nenhum produto encontrado</p>
                     <p className="text-brand-muted text-sm mt-1">Tente ajustar seus filtros ou busca</p>
                     <button
                        onClick={() => { setSearchTerm(''); setSelectedBrand(null); setSelectedCategory(null); }}
                        className="mt-4 text-brand-primary text-sm font-semibold hover:underline"
                     >
                        Limpar todos os filtros
                     </button>
                  </div>
               )}
            </div>

            {/* Discount Section */}
            {cart.length > 0 && (
               <div className="flex flex-col gap-2 animate-fade-in">
                  <label className="text-sm font-semibold text-gray-300 ml-1 flex justify-between items-center">
                     Cupom de Desconto
                     <span className="text-xs font-normal text-brand-muted">Opcional</span>
                  </label>
                  <div className="flex gap-2">
                     <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                           <Tag size={18} />
                        </div>
                        <input
                           value={discount}
                           onChange={(e) => setDiscount(e.target.value)}
                           className="w-full rounded-xl bg-brand-surface py-3 pl-10 pr-3 text-sm shadow-sm border border-white/10 focus:border-brand-primary text-white outline-none"
                           placeholder="Código ou Valor"
                           type="number"
                        />
                     </div>
                     <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                        className="w-24 rounded-xl bg-brand-surface py-3 pl-3 pr-8 text-sm font-medium shadow-sm border border-white/10 focus:border-brand-primary text-white outline-none"
                     >
                        <option value="percent">%</option>
                        <option value="fixed">R$</option>
                     </select>
                  </div>
               </div>
            )}

            {/* Financial Summary Card */}
            {cart.length > 0 && (
               <div className="mt-2 rounded-2xl bg-gradient-to-br from-brand-surface to-[#15201b] p-5 shadow-lg border border-white/5 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-brand-muted">Subtotal</span>
                     <span className="text-sm font-medium text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-brand-muted flex items-center gap-1">
                        Desconto
                        <Info size={14} />
                     </span>
                     <span className="text-sm font-medium text-red-400">- {formatCurrency(discountValue)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-sm font-medium text-brand-muted">Lucro Estimado</span>
                     <span className={`text-sm font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                        {totalProfit >= 0 ? '+' : ''} {formatCurrency(totalProfit)}
                     </span>
                  </div>
                  <div className="h-px w-full bg-white/10 mb-4"></div>
                  <div className="flex items-center justify-between">
                     <span className="text-lg font-bold text-white">Total a Receber</span>
                     <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold tracking-tight text-white">{formatCurrency(totalSale)}</span>
                        <span className="text-[10px] text-brand-muted font-medium uppercase tracking-wide">Com Preço Editável</span>
                     </div>
                  </div>
               </div>
            )}
         </main>

         {/* Fixed Bottom Button */}
         <div className="fixed bottom-0 left-0 right-0 z-30 bg-brand-dark p-4 border-t border-white/5 max-w-md mx-auto">
            <button
               onClick={handleFinalizeSale}
               className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-4 px-6 text-base font-bold text-brand-dark shadow-[0_0_20px_rgba(249,168,212,0.3)] hover:brightness-105 active:scale-[0.98] transition-all"
            >
               <CheckCircle2 className="fill-current" />
               Confirmar Venda
            </button>
         </div>
      </div>
   );
};

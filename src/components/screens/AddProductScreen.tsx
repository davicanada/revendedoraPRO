import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Camera, Link as LinkIcon, Image as ImageIcon, Search, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Brand, Product } from '../../types';
import { Input, Button } from '../common';

export const AddProductScreen: React.FC = () => {
  const { categories, products, setView, addProduct, updateProduct, settings } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExistingProduct, setSelectedExistingProduct] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Buscar produtos existentes
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, products]);

  const selectedCategoryData = categories.find(c => c.name === selectedCategory);
  const subcategories = selectedCategoryData?.subcategories || [];

  const handleSelectExistingProduct = (product: Product) => {
    setSelectedExistingProduct(product);
    setSearchTerm(product.name);
    setSelectedCategory(product.category.split(' - ')[0] || product.category);
  };

  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Selecionar da galeria
  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas imagens');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('A imagem deve ter no máximo 5MB');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setImageUrl(base64);
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
        alert('Erro ao processar imagem');
      }
    }
  };

  // Abrir câmera
  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  // Capturar foto da câmera
  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setImageUrl(photoData);
        handleCloseCamera();
      }
    }
  };

  // Fechar câmera
  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Cleanup ao desmontar
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

    if (!name || !brand || !category || quantity <= 0 || costPrice <= 0) {
      alert('Preencha todos os campos obrigatórios corretamente');
      return;
    }

    const fullCategory = subcategory ? `${category} - ${subcategory}` : category;

    try {
      if (selectedExistingProduct) {
        // Produto já existe: adicionar quantidade e recalcular custo médio
        const newQuantity = selectedExistingProduct.stockQuantity + quantity;
        const totalOldCost = selectedExistingProduct.costPrice * selectedExistingProduct.stockQuantity;
        const totalNewCost = costPrice * quantity;
        const averageCost = (totalOldCost + totalNewCost) / newQuantity;

        await updateProduct(selectedExistingProduct.id, {
          stockQuantity: newQuantity,
          costPrice: averageCost
        });
        alert(`Estoque atualizado! Nova quantidade: ${newQuantity}. Custo médio: R$ ${averageCost.toFixed(2)}`);
      } else {
        // Produto novo: criar
        const newProduct = {
          name,
          brand,
          category: fullCategory,
          stockQuantity: quantity,
          costPrice,
          salePrice: costPrice * (1 + settings.physicalProfitMargin), // Preço sugerido baseado na margem configurada
          image: imageUrl || 'https://via.placeholder.com/100/2A4535/f9a8d4?text=' + name.charAt(0).toUpperCase()
        };
        await addProduct(newProduct);
      }
      setView('stock');
    } catch (err) {
      console.error('Erro ao processar produto:', err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-brand-dark relative">
      <div className="flex items-center justify-between p-6">
        <button onClick={() => setView('stock')} className="text-brand-muted text-sm font-medium hover:text-white">Cancelar</button>
        <h2 className="text-lg font-bold text-white">Entrada de Estoque</h2>
        <div className="w-16"></div>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-24">
         {/* Busca de Produtos Existentes */}
         <div className="mb-6">
           <label className="block text-sm text-brand-muted mb-2 ml-1">Buscar Produto Existente</label>
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
             <input
               type="text"
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 if (selectedExistingProduct) setSelectedExistingProduct(null);
               }}
               placeholder="Digite o nome do produto..."
               className="w-full bg-brand-surface text-white rounded-xl py-3.5 pl-11 pr-4 outline-none border border-transparent focus:border-brand-primary/50"
             />
           </div>

           {/* Lista de produtos encontrados */}
           {filteredProducts.length > 0 && !selectedExistingProduct && (
             <div className="mt-2 bg-brand-surface rounded-xl border border-white/5 overflow-hidden">
               {filteredProducts.map((product) => (
                 <button
                   key={product.id}
                   type="button"
                   onClick={() => handleSelectExistingProduct(product)}
                   className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-b-0"
                 >
                   <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                     <Package size={20} className="text-brand-primary" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-white text-sm font-medium truncate">{product.name}</p>
                     <p className="text-brand-muted text-xs">{product.brand} • Estoque: {product.stockQuantity}</p>
                   </div>
                   <ChevronRight size={16} className="text-brand-muted" />
                 </button>
               ))}
             </div>
           )}

           {selectedExistingProduct && (
             <div className="mt-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
               <p className="text-green-400 text-xs font-medium mb-1">✓ Produto encontrado</p>
               <p className="text-white text-sm">{selectedExistingProduct.name}</p>
               <p className="text-brand-muted text-xs">Estoque atual: {selectedExistingProduct.stockQuantity} • Custo médio: R$ {selectedExistingProduct.costPrice.toFixed(2)}</p>
             </div>
           )}
         </div>

         <div className="h-px bg-white/10 mb-6"></div>

         {/* Imagem do Produto */}
         {!selectedExistingProduct && (
           <div className="mb-6">
             <div className="w-full h-40 bg-brand-surface/30 border-2 border-dashed border-brand-primary/20 rounded-2xl flex flex-col items-center justify-center mb-3 overflow-hidden">
               {imageUrl ? (
                 <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <>
                   <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center text-brand-muted mb-2">
                     <ImageIcon size={24} />
                   </div>
                   <span className="text-xs text-brand-muted">Adicione uma imagem do produto</span>
                 </>
               )}
             </div>

             <div className="grid grid-cols-3 gap-3">
               <button
                 type="button"
                 onClick={handleOpenCamera}
                 className="flex flex-col items-center justify-center gap-2 bg-brand-surface p-4 rounded-xl border border-white/5 hover:bg-brand-surface/80 transition-colors"
               >
                 <div className="w-8 h-8 rounded-full bg-[#f9a8d4]/10 flex items-center justify-center text-brand-primary">
                   <Camera size={18} />
                 </div>
                 <span className="text-[10px] text-brand-muted font-medium">Câmera</span>
               </button>
               <label className="flex flex-col items-center justify-center gap-2 bg-brand-surface p-4 rounded-xl border border-white/5 hover:bg-brand-surface/80 transition-colors cursor-pointer">
                 <input
                   type="file"
                   accept="image/*"
                   onChange={handleGallerySelect}
                   className="hidden"
                 />
                 <div className="w-8 h-8 rounded-full bg-[#f9a8d4]/10 flex items-center justify-center text-brand-primary">
                   <ImageIcon size={18} />
                 </div>
                 <span className="text-[10px] text-brand-muted font-medium">Galeria</span>
               </label>
               <button
                 type="button"
                 onClick={() => {
                   const url = prompt('Cole a URL da imagem:');
                   if (url) setImageUrl(url);
                 }}
                 className="flex flex-col items-center justify-center gap-2 bg-brand-surface p-4 rounded-xl border border-white/5 hover:bg-brand-surface/80 transition-colors"
               >
                 <div className="w-8 h-8 rounded-full bg-[#f9a8d4]/10 flex items-center justify-center text-brand-primary">
                   <LinkIcon size={18} />
                 </div>
                 <span className="text-[10px] text-brand-muted font-medium">URL</span>
               </button>
             </div>
           </div>
         )}

         {/* Modal da Câmera */}
         {showCamera && (
           <div className="fixed inset-0 bg-black z-50 flex flex-col">
             <div className="flex items-center justify-between p-4 bg-brand-dark/90 backdrop-blur-sm">
               <button
                 onClick={handleCloseCamera}
                 className="text-white text-sm font-medium hover:text-brand-primary"
               >
                 Cancelar
               </button>
               <h3 className="text-white font-bold">Tirar Foto</h3>
               <div className="w-16"></div>
             </div>

             <div className="flex-1 relative bg-black">
               <video
                 ref={videoRef}
                 autoPlay
                 playsInline
                 className="w-full h-full object-cover"
               />
             </div>

             <div className="p-6 bg-brand-dark/90 backdrop-blur-sm">
               <button
                 onClick={handleCapturePhoto}
                 className="w-full bg-brand-primary text-brand-dark font-bold py-4 rounded-full hover:brightness-105 transition-all flex items-center justify-center gap-2"
               >
                 <Camera size={20} />
                 Capturar Foto
               </button>
             </div>
           </div>
         )}

         <div className="space-y-5">
           <div className="bg-[#2a1b2e]/50 p-1 rounded-xl">
             <Input
               label="Nome do Produto"
               name="name"
               required
               placeholder="Ex: Kaiak Aero"
               value={selectedExistingProduct?.name || searchTerm}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
               className="!bg-brand-surface !border-none"
               disabled={!!selectedExistingProduct}
             />
           </div>
           <div className="mb-4">
              <label className="block text-sm text-brand-muted mb-1.5 ml-1">Marca*</label>
              <div className="relative">
                <select
                  name="brand"
                  required
                  defaultValue={selectedExistingProduct?.brand || ''}
                  disabled={!!selectedExistingProduct}
                  className="w-full bg-brand-surface text-white rounded-xl py-3.5 px-4 outline-none appearance-none border border-transparent focus:border-brand-primary/50 disabled:opacity-60"
                >
                  <option value="">Selecione...</option>
                  <option value={Brand.NATURA}>Natura</option>
                  <option value={Brand.AVON}>Avon</option>
                  <option value={Brand.OTHER}>Outra</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
              </div>
           </div>
           <div className="mb-4">
              <label className="block text-sm text-brand-muted mb-1.5 ml-1">Categoria*</label>
              <div className="relative">
                <select
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                  required
                  className="w-full bg-brand-surface text-white rounded-xl py-3.5 px-4 outline-none appearance-none border border-transparent focus:border-brand-primary/50"
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
              </div>
           </div>

           {subcategories.length > 0 && (
             <div className="mb-4">
                <label className="block text-sm text-brand-muted mb-1.5 ml-1">Subcategoria</label>
                <div className="relative">
                  <select
                    name="subcategory"
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full bg-brand-surface text-white rounded-xl py-3.5 px-4 outline-none appearance-none border border-transparent focus:border-brand-primary/50"
                  >
                    <option value="">Nenhuma</option>
                    {subcategories.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                </div>
             </div>
           )}

           <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-sm text-brand-muted mb-1.5 ml-1">Preço de Custo*</label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">R$</span>
                 <input
                   type="number"
                   name="costPrice"
                   step="0.01"
                   min="0.01"
                   required
                   placeholder="0,00"
                   className="w-full bg-brand-surface text-white rounded-xl py-3.5 pl-10 pr-4 outline-none border border-transparent focus:border-brand-primary/50"
                 />
               </div>
               <p className="text-[10px] text-brand-muted mt-1 ml-1">Quanto você pagou por unidade</p>
             </div>
             <div>
               <label className="block text-sm text-brand-muted mb-1.5 ml-1">Quantidade a Adicionar*</label>
               <input
                 type="number"
                 name="quantity"
                 min="1"
                 defaultValue="1"
                 required
                 placeholder="0"
                 className="w-full bg-brand-surface text-white rounded-xl py-3.5 px-4 outline-none border border-transparent focus:border-brand-primary/50"
               />
               <p className="text-[10px] text-brand-muted mt-1 ml-1">Unidades para entrada no estoque</p>
             </div>
           </div>

           <div className="mb-24">
             <div className="flex justify-between items-center mb-1.5 ml-1">
               <label className="block text-sm text-brand-muted">Descrição</label>
               <span className="text-[10px] bg-brand-surface px-2 py-0.5 rounded text-brand-muted">Opcional</span>
             </div>
             <textarea rows={4} className="w-full bg-brand-surface border border-transparent focus:border-brand-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all placeholder-gray-500 resize-none text-sm" placeholder="Adicione detalhes sobre a fragrância, modo de uso ou observações..."></textarea>
           </div>

           <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-dark to-transparent">
             <Button type="submit" className="!rounded-full">
               <div className="w-5 h-5 rounded-full bg-brand-dark text-brand-primary flex items-center justify-center">
                 <ChevronRight size={14} strokeWidth={4} />
               </div>
               {selectedExistingProduct ? 'Adicionar ao Estoque' : 'Cadastrar Produto'}
             </Button>
           </div>
         </div>
      </form>
    </div>
  );
};

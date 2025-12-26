import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Camera, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Brand, Product } from '../../types';
import { Input, Button } from '../common';

interface EditProductScreenProps {
  product: Product;
  onClose?: () => void;
}

export const EditProductScreen: React.FC<EditProductScreenProps> = ({ product, onClose }) => {
  const { categories, updateProduct, deleteProduct } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(product.category.split(' - ')[0] || product.category);
  const [selectedSubcategory, setSelectedSubcategory] = useState(product.category.split(' - ')[1] || '');
  const [imageUrl, setImageUrl] = useState(product.image || '');
  const [showImageInput, setShowImageInput] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const selectedCategoryData = categories.find(c => c.name === selectedCategory);
  const subcategories = selectedCategoryData?.subcategories || [];

  const handleImageChange = () => {
    if (tempImageUrl.trim()) {
      setImageUrl(tempImageUrl);
      setShowImageInput(false);
      setTempImageUrl('');
    }
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

      // Aguardar o vídeo estar pronto
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
    const salePrice = Number(formData.get('salePrice'));

    if (!name || !brand || !category) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const fullCategory = subcategory ? `${category} - ${subcategory}` : category;

    const updates = {
      name,
      brand,
      category: fullCategory,
      stockQuantity: quantity,
      costPrice,
      salePrice,
      image: imageUrl
    };

    try {
      await updateProduct(product.id, updates);
      if (onClose) onClose();
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir "${product.name}"? Esta ação não poderá ser desfeita.`)) {
      try {
        await deleteProduct(product.id);
        if (onClose) onClose();
      } catch (err) {
        console.error('Erro ao deletar produto:', err);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-brand-dark relative">
      <div className="flex items-center justify-between p-6">
        <button onClick={onClose} className="text-brand-muted text-sm font-medium hover:text-white">Cancelar</button>
        <h2 className="text-lg font-bold text-white">Editar Produto</h2>
        <button onClick={handleDelete} className="text-red-400 text-sm font-medium hover:text-red-300">Excluir</button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-24">
         {/* Imagem do Produto */}
         <div className="mb-6">
           <div className="w-full h-40 bg-brand-surface/30 border-2 border-dashed border-brand-primary/20 rounded-2xl flex flex-col items-center justify-center mb-3 overflow-hidden">
             {imageUrl ? (
               <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
             ) : (
               <>
                 <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center text-brand-muted mb-2">
                   <ImageIcon size={24} />
                 </div>
                 <span className="text-xs text-brand-muted">Nenhuma imagem</span>
               </>
             )}
           </div>

           {showImageInput ? (
             <div className="space-y-2">
               <div className="flex gap-2">
                 <input
                   type="text"
                   value={tempImageUrl}
                   onChange={(e) => setTempImageUrl(e.target.value)}
                   placeholder="Cole a URL da imagem..."
                   className="flex-1 bg-brand-surface text-white rounded-xl py-2.5 px-4 text-sm outline-none border border-transparent focus:border-brand-primary/50"
                 />
                 <button
                   type="button"
                   onClick={handleImageChange}
                   className="px-4 py-2.5 bg-brand-primary text-brand-dark rounded-xl text-sm font-semibold hover:brightness-105"
                 >
                   Aplicar
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     setShowImageInput(false);
                     setTempImageUrl('');
                   }}
                   className="px-3 py-2.5 bg-brand-surface text-brand-muted rounded-xl hover:text-white"
                 >
                   <X size={18} />
                 </button>
               </div>
             </div>
           ) : (
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
                 onClick={() => setShowImageInput(true)}
                 className="flex flex-col items-center justify-center gap-2 bg-brand-surface p-4 rounded-xl border border-white/5 hover:bg-brand-surface/80 transition-colors"
               >
                 <div className="w-8 h-8 rounded-full bg-[#f9a8d4]/10 flex items-center justify-center text-brand-primary">
                   <LinkIcon size={18} />
                 </div>
                 <span className="text-[10px] text-brand-muted font-medium">URL</span>
               </button>
             </div>
           )}
         </div>

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


         <div className="h-px bg-white/10 mb-6"></div>

         <div className="space-y-5">
           <div className="bg-[#2a1b2e]/50 p-1 rounded-xl">
             <Input
               label="Nome do Produto"
               name="name"
               required
               placeholder="Ex: Kaiak Aero"
               defaultValue={product.name}
               className="!bg-brand-surface !border-none"
             />
           </div>

           <div className="mb-4">
              <label className="block text-sm text-brand-muted mb-1.5 ml-1">Marca*</label>
              <div className="relative">
                <select
                  name="brand"
                  required
                  defaultValue={product.brand}
                  className="w-full bg-brand-surface text-white rounded-xl py-3.5 px-4 outline-none appearance-none border border-transparent focus:border-brand-primary/50"
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
                   defaultValue={product.costPrice}
                   placeholder="0,00"
                   className="w-full bg-brand-surface text-white rounded-xl py-3.5 pl-10 pr-4 outline-none border border-transparent focus:border-brand-primary/50"
                 />
               </div>
               <p className="text-[10px] text-brand-muted mt-1 ml-1">Custo médio do produto</p>
             </div>
             <div>
               <label className="block text-sm text-brand-muted mb-1.5 ml-1">Preço de Venda*</label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">R$</span>
                 <input
                   type="number"
                   name="salePrice"
                   step="0.01"
                   min="0.01"
                   required
                   defaultValue={product.salePrice}
                   placeholder="0,00"
                   className="w-full bg-brand-surface text-white rounded-xl py-3.5 pl-10 pr-4 outline-none border border-transparent focus:border-brand-primary/50"
                 />
               </div>
               <p className="text-[10px] text-brand-muted mt-1 ml-1">Preço sugerido para venda</p>
             </div>
           </div>

           <div className="mb-24">
             <label className="block text-sm text-brand-muted mb-1.5 ml-1">Quantidade em Estoque*</label>
             <input
               type="number"
               name="quantity"
               min="0"
               defaultValue={product.stockQuantity}
               required
               placeholder="0"
               className="w-full bg-brand-surface text-white rounded-xl py-3.5 px-4 outline-none border border-transparent focus:border-brand-primary/50"
             />
             <p className="text-[10px] text-brand-muted mt-1 ml-1">Quantidade atual em estoque</p>
           </div>

           <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-dark to-transparent">
             <Button type="submit" className="!rounded-full">
               <div className="w-5 h-5 rounded-full bg-brand-dark text-brand-primary flex items-center justify-center">
                 <ChevronRight size={14} strokeWidth={4} />
               </div>
               Salvar Alterações
             </Button>
           </div>
         </div>
      </form>
    </div>
  );
};

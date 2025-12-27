import React, { useRef, useState } from 'react';
import {
   ArrowLeft,
   Settings,
   CreditCard,
   ChevronRight,
   Package,
   ChevronDown,
   CheckCircle2,
   MoreHorizontal,
   Bell,
   LogOut,
   Camera,
   User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Toggle } from '../common';

export const SettingsScreen: React.FC = () => {
   const { setView, logout, user, updateUserProfile, settings, updateSettings } = useApp();
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [uploading, setUploading] = useState(false);
   const [onlineCommission, setOnlineCommission] = useState((settings.defaultCommission * 100).toString());
   const [physicalMargin, setPhysicalMargin] = useState((settings.physicalProfitMargin * 100).toString());

   // Sincronizar com mudanças de settings
   React.useEffect(() => {
      setOnlineCommission((settings.defaultCommission * 100).toString());
      setPhysicalMargin((settings.physicalProfitMargin * 100).toString());
   }, [settings.defaultCommission, settings.physicalProfitMargin]);

   const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
   const userAvatar = user?.user_metadata?.avatar_url || 'https://via.placeholder.com/100/2A4535/f9a8d4?text=' + userName.charAt(0).toUpperCase();
   const userEmail = user?.email || '';

   const handleAvatarClick = () => {
      fileInputRef.current?.click();
   };

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Convert to base64 data URL for local storage
      setUploading(true);
      try {
         const reader = new FileReader();
         reader.onloadend = async () => {
            const base64 = reader.result as string;
            await updateUserProfile({ avatar_url: base64 });
            setUploading(false);
            alert('Foto de perfil atualizada!');
            window.location.reload(); // Refresh to show new avatar
         };
         reader.readAsDataURL(file);
      } catch (err) {
         setUploading(false);
         console.error('Error uploading avatar:', err);
      }
   };

   const handleSaveCommission = async () => {
      const value = parseFloat(onlineCommission);
      console.log('Salvando comissão:', value);
      if (isNaN(value) || value < 0 || value > 100) {
         alert('Por favor, insira um valor entre 0 e 100');
         setOnlineCommission((settings.defaultCommission * 100).toString());
         return;
      }
      try {
         const newValue = value / 100;
         console.log('Valor convertido:', newValue);
         await updateSettings({ defaultCommission: newValue });
         console.log('Comissão salva com sucesso!');
         // Pequeno feedback visual
         const event = new CustomEvent('settings-saved');
         window.dispatchEvent(event);
      } catch (err) {
         console.error('Erro ao salvar comissão:', err);
         alert('Erro ao salvar comissão: ' + (err as Error).message);
         setOnlineCommission((settings.defaultCommission * 100).toString());
      }
   };

   const handleSaveMargin = async () => {
      const value = parseFloat(physicalMargin);
      console.log('Salvando margem:', value);
      if (isNaN(value) || value < 0 || value > 100) {
         alert('Por favor, insira um valor entre 0 e 100');
         setPhysicalMargin((settings.physicalProfitMargin * 100).toString());
         return;
      }
      try {
         const newValue = value / 100;
         console.log('Valor convertido:', newValue);
         await updateSettings({ physicalProfitMargin: newValue });
         console.log('Margem salva com sucesso!');
         // Pequeno feedback visual
         const event = new CustomEvent('settings-saved');
         window.dispatchEvent(event);
      } catch (err) {
         console.error('Erro ao salvar margem:', err);
         alert('Erro ao salvar margem: ' + (err as Error).message);
         setPhysicalMargin((settings.physicalProfitMargin * 100).toString());
      }
   };

   return (
      <div className="p-6 pb-24 h-screen flex flex-col bg-brand-dark">
         <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setView('dashboard')} className="text-white">
               <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white">Configurações</h2>
         </div>

         <div className="flex-1 overflow-y-auto space-y-8">
            {/* User Profile Section */}
            <section>
               <h3 className="text-brand-muted text-[10px] font-bold uppercase tracking-wider mb-3">Perfil</h3>
               <div className="bg-brand-surface rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="relative">
                        <img
                           src={userAvatar}
                           alt={userName}
                           className="w-16 h-16 rounded-full border-2 border-brand-primary/30 object-cover"
                           onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100/2A4535/f9a8d4?text=' + userName.charAt(0).toUpperCase(); }}
                        />
                        <button
                           onClick={handleAvatarClick}
                           disabled={uploading}
                           className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-primary rounded-full flex items-center justify-center text-brand-dark shadow-lg hover:bg-brand-primaryHover transition-colors"
                        >
                           {uploading ? (
                              <span className="w-3 h-3 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></span>
                           ) : (
                              <Camera size={14} strokeWidth={2.5} />
                           )}
                        </button>
                        <input
                           ref={fileInputRef}
                           type="file"
                           accept="image/*"
                           onChange={handleFileChange}
                           className="hidden"
                        />
                     </div>
                     <div className="flex-1">
                        <p className="text-white font-bold text-lg">{userName}</p>
                        <p className="text-brand-muted text-sm">{userEmail}</p>
                     </div>
                     <button className="text-brand-muted hover:text-white">
                        <ChevronRight size={20} />
                     </button>
                  </div>
               </div>
            </section>

            <section>
               <h3 className="text-brand-muted text-[10px] font-bold uppercase tracking-wider mb-3">Financeiro</h3>
               <div className="bg-brand-surface rounded-2xl p-4 border border-white/5 space-y-4">
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-white font-medium">Comissão Online</label>
                        <span className="text-[10px] bg-[#332636] text-brand-muted px-2 py-0.5 rounded">% por venda</span>
                     </div>
                     <div className="relative">
                        <input
                           type="number"
                           step="0.1"
                           min="0"
                           max="100"
                           value={onlineCommission}
                           onChange={(e) => setOnlineCommission(e.target.value)}
                           onBlur={handleSaveCommission}
                           className="w-full bg-[#1a121d] text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-brand-primary/50"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted font-bold">%</span>
                     </div>
                     <p className="text-xs text-brand-muted mt-1">Seu lucro sobre vendas por link/catálogo</p>
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-white font-medium">Margem de Lucro Física</label>
                        <span className="text-[10px] bg-[#332636] text-brand-muted px-2 py-0.5 rounded">% sobre custo</span>
                     </div>
                     <div className="relative">
                        <input
                           type="number"
                           step="0.1"
                           min="0"
                           max="100"
                           value={physicalMargin}
                           onChange={(e) => setPhysicalMargin(e.target.value)}
                           onBlur={handleSaveMargin}
                           className="w-full bg-[#1a121d] text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-brand-primary/50"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted font-bold">%</span>
                     </div>
                     <p className="text-xs text-brand-muted mt-1">Lucro sugerido sobre custo de produtos físicos</p>
                  </div>
                  <button
                     onClick={() => setView('credit-cards')}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1a121d] transition-colors group"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#332636] flex items-center justify-center text-brand-primary">
                           <CreditCard size={20} />
                        </div>
                        <div className="text-left">
                           <p className="text-white font-medium text-sm">Cartões de Crédito</p>
                           <p className="text-brand-muted text-xs">Visa •••• 4242</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-brand-muted group-hover:text-white" />
                  </button>
               </div>
            </section>
            <section>
               <h3 className="text-brand-muted text-[10px] font-bold uppercase tracking-wider mb-3">Estoque & Operacional</h3>
               <div className="bg-brand-surface rounded-2xl p-4 border border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs text-white font-medium mb-1.5 block">Alerta de Estoque Mínimo</label>
                        <div className="relative">
                           <input
                              type="number"
                              defaultValue={5}
                              className="w-full bg-[#1a121d] text-white rounded-xl py-3 px-3 text-sm outline-none border border-transparent"
                           />
                           <Package size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                        </div>
                     </div>
                     <div>
                        <label className="text-xs text-white font-medium mb-1.5 block">Produto Parado (Dias)</label>
                        <div className="relative">
                           <select className="w-full bg-[#1a121d] text-white rounded-xl py-3 px-3 text-sm outline-none border border-transparent appearance-none">
                              <option>30 dias</option>
                              <option>60 dias</option>
                              <option>90 dias</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                        </div>
                     </div>
                  </div>
                  <button
                     onClick={() => setView('manage-brands')}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1a121d] transition-colors group"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#332636] flex items-center justify-center text-brand-primary">
                           <CheckCircle2 size={20} />
                        </div>
                        <div className="text-left">
                           <p className="text-white font-medium text-sm">Gerenciar Marcas</p>
                           <div className="flex gap-1 mt-0.5">
                              <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 rounded">NATURA</span>
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 rounded">AVON</span>
                              <span className="text-[9px] bg-gray-700 text-gray-300 px-1.5 rounded">+1</span>
                           </div>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-brand-muted group-hover:text-white" />
                  </button>
                  <button
                     onClick={() => setView('categories')}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1a121d] transition-colors group"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#332636] flex items-center justify-center text-brand-primary">
                           <MoreHorizontal size={20} />
                        </div>
                        <div className="text-left">
                           <p className="text-white font-medium text-sm">Gerenciar Categorias</p>
                           <p className="text-brand-muted text-xs">Perfumaria, Maquiagem...</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-brand-muted group-hover:text-white" />
                  </button>
               </div>
            </section>
            <section>
               <h3 className="text-brand-muted text-[10px] font-bold uppercase tracking-wider mb-3">Aplicativo</h3>
               <div className="bg-brand-surface rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between py-2">
                     <div className="flex items-center gap-3">
                        <Bell size={20} className="text-brand-muted" />
                        <span className="text-white font-medium text-sm">Notificações Push</span>
                     </div>
                     <Toggle checked={true} onChange={() => { }} />
                  </div>
               </div>
            </section>
            <button
               onClick={() => logout()}
               className="w-full border border-brand-primary/30 text-brand-primary font-medium py-3.5 rounded-xl hover:bg-brand-primary/5 transition-colors flex items-center justify-center gap-2"
            >
               <LogOut size={18} /> SAIR
            </button>
            <p className="text-center text-xs text-brand-muted pb-4">Versão 2.4.0</p>
         </div>
      </div>
   );
};

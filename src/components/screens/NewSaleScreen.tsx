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
   Package,
   Calendar,
   Camera,
   Link as LinkIcon,
   Image as ImageIcon,
   ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, SaleType, Brand } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface CartItem {
   product: Product;
   quantity: number;
   unitPrice: number;
   customProfit?: number; // Para vendas online: lucro líquido informado pelo usuário
}

export const NewSaleScreen: React.FC = () => {
   const { products, customers, setView, addSale, updateProduct, updateCustomer, settings, addProduct, categories } = useApp();

   // Cart now stores unitPrice to allow user override
   const [cart, setCart] = useState<CartItem[]>([]);
   const [saleType, setSaleType] = useState<SaleType>(SaleType.PHYSICAL);
   const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [discount, setDiscount] = useState('');
   const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');

   // Quick Add Product Modal States
   const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
   const [quickSearchTerm, setQuickSearchTerm] = useState('');
   const [selectedExistingProduct, setSelectedExistingProduct] = useState<Product | null>(null);
   const [quickProductName, setQuickProductName] = useState('');
   const [quickProductBrand, setQuickProductBrand] = useState('');
   const [quickProductCategory, setQuickProductCategory] = useState('');
   const [quickProductSubcategory, setQuickProductSubcategory] = useState('');
   const [quickProductCostPrice, setQuickProductCostPrice] = useState('');
   const [quickImageUrl, setQuickImageUrl] = useState('');
   const [showQuickCamera, setShowQuickCamera] = useState(false);
   const [showQuickUrlInput, setShowQuickUrlInput] = useState(false);
   const quickVideoRef = React.useRef<HTMLVideoElement>(null);
   const quickStreamRef = React.useRef<MediaStream | null>(null);

   // Formatar data atual como dd/mm/yyyy
   const formatDateToInput = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
   };

   const [saleDate, setSaleDate] = useState(formatDateToInput(new Date()));

   // Converter dd/mm/yyyy para Date (ao meio-dia para evitar problemas de timezone)
   const parseDateFromInput = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
   };

   // Validar e formatar data ao digitar
   const handleDateChange = (value: string) => {
      // Remove tudo exceto números
      const numbers = value.replace(/\D/g, '');

      if (numbers.length <= 2) {
         setSaleDate(numbers);
      } else if (numbers.length <= 4) {
         setSaleDate(`${numbers.slice(0, 2)}/${numbers.slice(2)}`);
      } else {
         setSaleDate(`${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`);
      }
   };

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

      // Default Price Logic: Cost + physicalProfitMargin for Physical, Catalog Price (costPrice) for Online
      const defaultPrice = saleType === SaleType.PHYSICAL
         ? product.costPrice * (1 + settings.physicalProfitMargin)
         : product.costPrice;

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
         item.product.id === productId ? { ...item, unitPrice: price, customProfit: undefined } : item
      ));
   };

   // Atualizar lucro customizado para vendas online
   const updateCustomProfit = (productId: string, profitValue: string) => {
      const profit = parseFloat(profitValue);
      if (isNaN(profit) || profit < 0) return;

      setCart(cart => cart.map(item => {
         if (item.product.id !== productId) return item;

         // Calcular preço unitário baseado no lucro informado
         // Se lucro = R$ 100 e comissão = 15%, então totalVenda = 100 / 0.15 = 666.67
         // Preço unitário = 666.67 / quantidade
         const totalSaleValue = profit / settings.defaultCommission;
         const newUnitPrice = totalSaleValue / item.quantity;

         return { ...item, customProfit: profit, unitPrice: newUnitPrice };
      }));
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
   // For Online: Se customProfit definido, usar ele. Senão, Revenue * commission - Discount
   // For Physical: (Revenue - Cost) - Discount
   const totalProfit = useMemo(() => {
      if (saleType === SaleType.ONLINE) {
         // Se todos os itens têm customProfit, somar eles
         const hasAllCustomProfits = cart.length > 0 && cart.every(item => item.customProfit !== undefined);
         if (hasAllCustomProfits) {
            const totalCustomProfit = cart.reduce((acc, item) => acc + (item.customProfit || 0), 0);
            return totalCustomProfit - discountValue;
         }
         // Senão, calcular baseado na comissão
         const commission = subtotal * settings.defaultCommission;
         return commission - discountValue;
      } else {
         return (subtotal - totalCost) - discountValue;
      }
   }, [cart, subtotal, totalCost, discountValue, saleType, settings.defaultCommission]);

   // Quick Add Product Functions
   const quickFilteredProducts = useMemo(() => {
      if (!quickSearchTerm.trim()) return [];
      return products.filter(p =>
         p.name.toLowerCase().includes(quickSearchTerm.toLowerCase()) ||
         p.brand.toLowerCase().includes(quickSearchTerm.toLowerCase())
      ).slice(0, 5);
   }, [quickSearchTerm, products]);

   const selectedCategoryData = categories.find(c => c.name === quickProductCategory);
   const quickSubcategories = selectedCategoryData?.subcategories || [];

   const handleQuickSelectExistingProduct = (product: Product) => {
      setSelectedExistingProduct(product);
      setQuickSearchTerm(product.name);
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
   const handleQuickGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas imagens');
            return;
         }
         if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB');
            return;
         }
         try {
            const base64 = await fileToBase64(file);
            setQuickImageUrl(base64);
            setShowQuickUrlInput(false);
         } catch (err) {
            console.error('Erro ao processar imagem:', err);
            alert('Erro ao processar imagem');
         }
      }
   };

   // Abrir câmera
   const handleQuickOpenCamera = async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
         });
         quickStreamRef.current = stream;
         setShowQuickCamera(true);

         setTimeout(() => {
            if (quickVideoRef.current) {
               quickVideoRef.current.srcObject = stream;
            }
         }, 100);
      } catch (err) {
         console.error('Erro ao acessar câmera:', err);
         alert('Não foi possível acessar a câmera. Verifique as permissões.');
      }
   };

   // Capturar foto
   const handleQuickCapturePhoto = () => {
      if (quickVideoRef.current) {
         const canvas = document.createElement('canvas');
         canvas.width = quickVideoRef.current.videoWidth;
         canvas.height = quickVideoRef.current.videoHeight;
         const ctx = canvas.getContext('2d');
         if (ctx) {
            ctx.drawImage(quickVideoRef.current, 0, 0);
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            setQuickImageUrl(photoData);
            setShowQuickUrlInput(false);
            handleQuickCloseCamera();
         }
      }
   };

   // Fechar câmera
   const handleQuickCloseCamera = () => {
      if (quickStreamRef.current) {
         quickStreamRef.current.getTracks().forEach(track => track.stop());
         quickStreamRef.current = null;
      }
      setShowQuickCamera(false);
   };

   // Cleanup câmera
   React.useEffect(() => {
      return () => {
         if (quickStreamRef.current) {
            quickStreamRef.current.getTracks().forEach(track => track.stop());
         }
      };
   }, []);

   const handleQuickAddProduct = async () => {
      // Verificar se produto já existe
      if (selectedExistingProduct) {
         alert(`Este produto já existe no sistema!\nEstoque atual: ${selectedExistingProduct.stockQuantity} unidades\n\nSelecione o produto na lista de vendas para adicioná-lo ao carrinho.`);
         return;
      }

      if (!quickProductName.trim()) {
         alert('Por favor, insira o nome do produto.');
         return;
      }

      if (!quickProductBrand) {
         alert('Por favor, selecione uma marca.');
         return;
      }

      if (!quickProductCategory) {
         alert('Por favor, selecione uma categoria.');
         return;
      }

      if (!quickProductCostPrice) {
         alert('Por favor, insira o preço de catálogo.');
         return;
      }

      const costPrice = parseFloat(quickProductCostPrice);
      if (isNaN(costPrice) || costPrice <= 0) {
         alert('Preço de catálogo inválido.');
         return;
      }

      const fullCategory = quickProductSubcategory
         ? `${quickProductCategory} - ${quickProductSubcategory}`
         : quickProductCategory;

      const newProduct = {
         name: quickProductName,
         brand: quickProductBrand as Brand, // Cast para tipo Brand
         category: fullCategory,
         costPrice: costPrice,
         salePrice: costPrice * (1 + settings.physicalProfitMargin),
         stockQuantity: 0,
         image: quickImageUrl || 'https://via.placeholder.com/150/2A4535/f9a8d4?text=' + quickProductName.charAt(0).toUpperCase()
      };

      try {
         await addProduct(newProduct);
         alert('Produto cadastrado com sucesso!\n\nVocê já pode selecioná-lo para adicionar à venda.');

         // Limpar e fechar
         setShowQuickAddProduct(false);
         setQuickSearchTerm('');
         setSelectedExistingProduct(null);
         setQuickProductName('');
         setQuickProductBrand('');
         setQuickProductCategory('');
         setQuickProductSubcategory('');
         setQuickProductCostPrice('');
         setQuickImageUrl('');
         setShowQuickUrlInput(false);
      } catch (err) {
         console.error('Erro ao cadastrar produto:', err);
         alert('Erro ao cadastrar produto.');
      }
   };

   const handleFinalizeSale = async () => {
      if (!selectedCustomerId) {
         alert("Por favor, selecione um cliente.");
         return;
      }
      if (cart.length === 0) {
         alert("O carrinho está vazio.");
         return;
      }

      // Validar formato da data
      if (saleDate.length !== 10 || !saleDate.includes('/')) {
         alert("Por favor, insira uma data válida no formato dd/mm/yyyy.");
         return;
      }

      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

      // Converter a data para ISO
      const saleDateISO = parseDateFromInput(saleDate).toISOString();

      const newSale = {
         customerId: selectedCustomerId,
         customerName: selectedCustomer ? selectedCustomer.name : 'Cliente Desconhecido',
         date: saleDateISO,
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

      try {
         // Add sale to database
         await addSale(newSale);

         // Update product stock if physical sale
         if (saleType === SaleType.PHYSICAL) {
            for (const cartItem of cart) {
               const product = products.find(p => p.id === cartItem.product.id);
               if (product) {
                  await updateProduct(cartItem.product.id, {
                     stockQuantity: Math.max(0, product.stockQuantity - cartItem.quantity)
                  });
               }
            }
         }

         // Update customer
         if (selectedCustomer) {
            await updateCustomer(selectedCustomerId, {
               totalSpent: selectedCustomer.totalSpent + totalSale,
               lastPurchaseDate: saleDateISO
            });
         }

         setView('sales');
      } catch (err) {
         console.error('Erro ao finalizar venda:', err);
      }
   };

   return (
      <div className="flex flex-col h-screen bg-brand-dark">
         {/* Quick Add Product Modal */}
         {showQuickAddProduct && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-brand-dark rounded-2xl max-w-lg w-full border border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/5">
                     <div>
                        <h2 className="text-xl font-bold text-white">Cadastro Rápido</h2>
                        <p className="text-brand-muted text-xs mt-1">Produto sem estoque físico</p>
                     </div>
                     <button
                        onClick={() => {
                           setShowQuickAddProduct(false);
                           setQuickSearchTerm('');
                           setSelectedExistingProduct(null);
                           setQuickProductName('');
                           setQuickProductBrand('');
                           setQuickProductCategory('');
                           setQuickProductSubcategory('');
                           setQuickProductCostPrice('');
                           setQuickImageUrl('');
                           setShowQuickUrlInput(false);
                        }}
                        className="text-brand-muted hover:text-white"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                     {/* Busca de Produtos Existentes */}
                     <div>
                        <label className="block text-sm text-brand-muted mb-2">Buscar Produto Existente</label>
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                           <input
                              type="text"
                              value={quickSearchTerm}
                              onChange={(e) => {
                                 setQuickSearchTerm(e.target.value);
                                 if (selectedExistingProduct) setSelectedExistingProduct(null);
                                 setQuickProductName(e.target.value);
                              }}
                              placeholder="Digite o nome do produto..."
                              className="w-full bg-brand-surface text-white rounded-xl py-3 pl-11 pr-4 outline-none border border-transparent focus:border-brand-primary/50 text-sm"
                           />
                        </div>

                        {/* Lista de produtos encontrados */}
                        {quickFilteredProducts.length > 0 && !selectedExistingProduct && (
                           <div className="mt-2 bg-brand-surface rounded-xl border border-white/5 overflow-hidden">
                              {quickFilteredProducts.map((product) => (
                                 <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => handleQuickSelectExistingProduct(product)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-b-0"
                                 >
                                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                       <Package size={16} className="text-brand-primary" />
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
                           <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                              <p className="text-red-400 text-xs font-medium mb-1">⚠ Produto já cadastrado!</p>
                              <p className="text-white text-sm">{selectedExistingProduct.name}</p>
                              <p className="text-brand-muted text-xs">
                                 Estoque: {selectedExistingProduct.stockQuantity} unidades •
                                 Preço: R$ {selectedExistingProduct.costPrice.toFixed(2)}
                              </p>
                           </div>
                        )}
                     </div>

                     {!selectedExistingProduct && (
                        <>
                           <div className="h-px bg-white/10"></div>

                           {/* Imagem */}
                           <div>
                              <div className="w-full h-32 bg-brand-surface/30 border-2 border-dashed border-brand-primary/20 rounded-xl flex flex-col items-center justify-center mb-3 overflow-hidden">
                                 {quickImageUrl ? (
                                    <img src={quickImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                 ) : (
                                    <>
                                       <ImageIcon size={20} className="text-brand-muted mb-1" />
                                       <span className="text-xs text-brand-muted">Imagem do produto</span>
                                    </>
                                 )}
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                 <button
                                    type="button"
                                    onClick={handleQuickOpenCamera}
                                    className="flex flex-col items-center gap-1 p-2 bg-brand-surface rounded-lg cursor-pointer hover:bg-white/5 transition-colors border border-white/5"
                                 >
                                    <Camera size={16} className="text-brand-primary" />
                                    <span className="text-[10px] text-brand-muted">Câmera</span>
                                 </button>
                                 <label className="flex flex-col items-center gap-1 p-2 bg-brand-surface rounded-lg cursor-pointer hover:bg-white/5 transition-colors border border-white/5">
                                    <ImageIcon size={16} className="text-brand-primary" />
                                    <span className="text-[10px] text-brand-muted">Galeria</span>
                                    <input
                                       type="file"
                                       accept="image/*"
                                       onChange={handleQuickGallerySelect}
                                       className="hidden"
                                    />
                                 </label>
                                 <button
                                    type="button"
                                    onClick={() => setShowQuickUrlInput(!showQuickUrlInput)}
                                    className="flex flex-col items-center gap-1 p-2 bg-brand-surface rounded-lg cursor-pointer hover:bg-white/5 transition-colors border border-white/5"
                                 >
                                    <LinkIcon size={16} className="text-brand-primary" />
                                    <span className="text-[10px] text-brand-muted">URL</span>
                                 </button>
                              </div>

                              {showQuickUrlInput && (
                                 <div className="mt-3">
                                    <input
                                       type="text"
                                       value={quickImageUrl.startsWith('data:') ? '' : quickImageUrl}
                                       onChange={(e) => setQuickImageUrl(e.target.value)}
                                       placeholder="Cole a URL da imagem aqui..."
                                       className="w-full bg-brand-surface text-white rounded-xl py-2 px-3 outline-none border border-brand-primary/50 text-xs"
                                    />
                                 </div>
                              )}
                           </div>

                           {/* Marca */}
                           <div>
                              <label className="block text-sm text-brand-muted mb-2">Marca *</label>
                              <div className="relative">
                                 <select
                                    value={quickProductBrand}
                                    onChange={(e) => setQuickProductBrand(e.target.value)}
                                    className="w-full appearance-none bg-brand-surface text-white rounded-xl py-3 px-4 pr-10 outline-none border border-transparent focus:border-brand-primary/50 text-sm"
                                 >
                                    <option value="">Selecione uma marca</option>
                                    <option value={Brand.NATURA}>{Brand.NATURA}</option>
                                    <option value={Brand.AVON}>{Brand.AVON}</option>
                                    <option value={Brand.OTHER}>{Brand.OTHER}</option>
                                 </select>
                                 <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                              </div>
                           </div>

                           {/* Categoria */}
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="block text-sm text-brand-muted mb-2">Categoria *</label>
                                 <div className="relative">
                                    <select
                                       value={quickProductCategory}
                                       onChange={(e) => {
                                          setQuickProductCategory(e.target.value);
                                          setQuickProductSubcategory('');
                                       }}
                                       className="w-full appearance-none bg-brand-surface text-white rounded-xl py-3 px-4 pr-10 outline-none border border-transparent focus:border-brand-primary/50 text-sm"
                                    >
                                       <option value="">Selecione</option>
                                       {categories.map(cat => (
                                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                                       ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                                 </div>
                              </div>

                              {quickSubcategories.length > 0 && (
                                 <div>
                                    <label className="block text-sm text-brand-muted mb-2">Subcategoria</label>
                                    <div className="relative">
                                       <select
                                          value={quickProductSubcategory}
                                          onChange={(e) => setQuickProductSubcategory(e.target.value)}
                                          className="w-full appearance-none bg-brand-surface text-white rounded-xl py-3 px-4 pr-10 outline-none border border-transparent focus:border-brand-primary/50 text-sm"
                                       >
                                          <option value="">Nenhuma</option>
                                          {quickSubcategories.map(sub => (
                                             <option key={sub} value={sub}>{sub}</option>
                                          ))}
                                       </select>
                                       <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                                    </div>
                                 </div>
                              )}
                           </div>

                           {/* Preço de Catálogo */}
                           <div>
                              <label className="block text-sm text-brand-muted mb-2">Preço de Catálogo *</label>
                              <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted text-sm">R$</span>
                                 <input
                                    type="number"
                                    step="0.01"
                                    value={quickProductCostPrice}
                                    onChange={(e) => setQuickProductCostPrice(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full bg-brand-surface text-white rounded-xl py-3 px-4 pl-12 outline-none border border-transparent focus:border-brand-primary/50 text-sm"
                                 />
                              </div>
                              <p className="text-xs text-brand-muted mt-1">Valor pelo qual o cliente paga</p>
                           </div>
                        </>
                     )}
                  </div>

                  {/* Modal Footer */}
                  {!selectedExistingProduct && (
                     <div className="p-6 border-t border-white/5">
                        <button
                           onClick={handleQuickAddProduct}
                           className="w-full bg-brand-primary text-brand-dark font-bold py-3.5 rounded-xl hover:brightness-105 transition-all"
                        >
                           Cadastrar Produto
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Camera Modal */}
         {showQuickCamera && (
            <div className="fixed inset-0 bg-black z-[60] flex flex-col">
               <div className="flex items-center justify-between p-4 bg-black/50">
                  <button onClick={handleQuickCloseCamera} className="text-white">
                     <X size={24} />
                  </button>
                  <h3 className="text-white font-semibold">Capturar Foto</h3>
                  <div className="w-6"></div>
               </div>
               <div className="flex-1 relative">
                  <video
                     ref={quickVideoRef}
                     autoPlay
                     playsInline
                     className="w-full h-full object-cover"
                  />
               </div>
               <div className="p-6 bg-black/50">
                  <button
                     onClick={handleQuickCapturePhoto}
                     className="w-full bg-white text-black font-bold py-4 rounded-xl"
                  >
                     Capturar Foto
                  </button>
               </div>
            </div>
         )}

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
                  {saleType === SaleType.PHYSICAL
                     ? `Preço sugerido: Custo Médio + ${(settings.physicalProfitMargin * 100).toFixed(0)}%`
                     : `Preço = Catálogo • Lucro = ${(settings.defaultCommission * 100).toFixed(0)}% de comissão`
                  }
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

            {/* Sale Date */}
            <div className="flex flex-col gap-2">
               <label className="text-sm font-semibold text-gray-300 ml-1">Data da Venda</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                     <Calendar size={20} />
                  </div>
                  <input
                     type="text"
                     value={saleDate}
                     onChange={(e) => handleDateChange(e.target.value)}
                     placeholder="dd/mm/yyyy"
                     maxLength={10}
                     className="w-full rounded-xl bg-brand-surface py-4 pl-10 pr-4 text-base shadow-sm border border-white/10 focus:border-brand-primary text-white placeholder-gray-500 outline-none transition-all"
                  />
               </div>
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

               {/* Quick Add Product Button (Only for Online Sales) */}
               {saleType === SaleType.ONLINE && (
                  <button
                     onClick={() => setShowQuickAddProduct(true)}
                     className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary py-3 rounded-xl hover:bg-brand-primary/20 transition-all"
                  >
                     <Plus size={18} />
                     <span className="text-sm font-semibold">Cadastrar Produto Novo</span>
                  </button>
               )}
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
                                    <span className="text-[10px] text-brand-muted flex items-center gap-1">
                                       {saleType === SaleType.PHYSICAL ? 'Custo Médio' : 'Catálogo'}: {formatCurrency(product.costPrice)}
                                    </span>
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
                              <div className="mt-3 pt-2 border-t border-white/5 space-y-2 animate-fade-in">
                                 {saleType === SaleType.ONLINE ? (
                                    // Para vendas online: mostrar campo "Valor Recebido"
                                    <>
                                       <div className="flex items-center justify-between">
                                          <span className="text-xs text-brand-muted">Valor Recebido</span>
                                          <div className="flex items-center gap-2">
                                             <span className="text-xs text-brand-muted">R$</span>
                                             <input
                                                type="number"
                                                step="0.01"
                                                value={cartItem.customProfit?.toFixed(2) || ''}
                                                onChange={(e) => updateCustomProfit(product.id, e.target.value)}
                                                placeholder="0,00"
                                                className="w-20 bg-[#1a121d] text-white text-right text-sm font-medium rounded p-1 border border-white/10 focus:border-brand-primary outline-none"
                                             />
                                          </div>
                                       </div>
                                       <div className="flex items-center justify-between text-[10px]">
                                          <span className="text-brand-muted/60">Preço Unit. Calculado</span>
                                          <span className="text-brand-muted/80">{formatCurrency(cartItem.unitPrice)}</span>
                                       </div>
                                    </>
                                 ) : (
                                    // Para vendas físicas: mostrar campo "Preço Unitário"
                                    <div className="flex items-center justify-between">
                                       <span className="text-xs text-brand-muted">Preço Unitário</span>
                                       <div className="flex items-center gap-2">
                                          <span className="text-xs text-brand-muted">R$</span>
                                          <input
                                             type="number"
                                             step="0.01"
                                             value={cartItem.unitPrice.toFixed(2)}
                                             onChange={(e) => updateCartItemPrice(product.id, e.target.value)}
                                             className="w-20 bg-[#1a121d] text-white text-right text-sm font-medium rounded p-1 border border-white/10 focus:border-brand-primary outline-none"
                                          />
                                       </div>
                                    </div>
                                 )}
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

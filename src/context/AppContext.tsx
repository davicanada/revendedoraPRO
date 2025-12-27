import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Customer, Sale, Category, CreditCard, AppSettings, View } from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { productsService } from '../services/products.service';
import { customersService } from '../services/customers.service';
import { salesService } from '../services/sales.service';
import { categoriesService } from '../services/categories.service';
import { creditCardsService } from '../services/creditCards.service';
import { settingsService } from '../services/settings.service';

interface AppContextType {
  // State
  view: View;
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  categories: Category[];
  creditCards: CreditCard[];
  settings: AppSettings;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setView: (view: View) => void;
  setProducts: (products: Product[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setSales: (sales: Sale[]) => void;
  setCategories: (categories: Category[]) => void;
  setCreditCards: (cards: CreditCard[]) => void;
  setSettings: (settings: AppSettings) => void;

  // Auth methods from useAuth
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signOut: () => Promise<any>;

  // Legacy login/logout for compatibility
  login: () => void;
  logout: () => Promise<void>;

  // Helper methods
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  // Refresh data
  refreshData: () => Promise<void>;

  // User profile data
  user: any;
  updateUserProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'revendedora-pro-cache';

const defaultSettings: AppSettings = {
  defaultCommission: 0.15, // 15% comissão online
  physicalProfitMargin: 0.15, // 15% margem de lucro físico
  lowStockThreshold: 3,
  currency: 'BRL'
};

const defaultCategories: Category[] = [
  { id: '1', name: 'Perfumaria', color: '#FF6B9D', subcategories: ['Perfumes Femininos', 'Perfumes Masculinos', 'Infantil'] },
  { id: '2', name: 'Maquiagem', color: '#C084FC', subcategories: ['Batom', 'Base', 'Máscara'] },
  { id: '3', name: 'Cabelos', color: '#60A5FA', subcategories: ['Shampoo', 'Condicionador', 'Máscara'] },
  { id: '4', name: 'Corpo & Banho', color: '#34D399', subcategories: ['Sabonete', 'Hidratante', 'Desodorante'] },
  { id: '5', name: 'Rosto', color: '#FBBF24', subcategories: ['Limpeza', 'Hidratação', 'Tratamento'] }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { user, signIn, signUp, signOut } = auth;

  const [view, setView] = useState<View>('login');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Load data from Supabase when user logs in
  const loadDataFromSupabase = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [
        productsData,
        customersData,
        salesData,
        categoriesData,
        creditCardsData,
        settingsData
      ] = await Promise.all([
        productsService.getAll(userId),
        customersService.getAll(userId),
        salesService.getAll(userId),
        categoriesService.getAll(userId),
        creditCardsService.getAll(userId),
        settingsService.get(userId)
      ]);

      setProducts(productsData);
      setCustomers(customersData);
      setSales(salesData);
      setCategories(categoriesData.length > 0 ? categoriesData : defaultCategories);
      setCreditCards(creditCardsData);
      setSettings(settingsData);

      // Save to localStorage as offline cache
      const cacheData = {
        products: productsData,
        customers: customersData,
        sales: salesData,
        categories: categoriesData.length > 0 ? categoriesData : defaultCategories,
        creditCards: creditCardsData,
        settings: settingsData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));

    } catch (err: any) {
      console.error('Error loading data from Supabase:', err);
      setError(err.message || 'Erro ao carregar dados do servidor');

      // Try to load from localStorage cache as fallback
      try {
        const cachedData = localStorage.getItem(STORAGE_KEY);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setProducts(parsed.products || []);
          setCustomers(parsed.customers || []);
          setSales(parsed.sales || []);
          setCategories(parsed.categories || defaultCategories);
          setCreditCards(parsed.creditCards || []);
          setSettings(parsed.settings || defaultSettings);
          alert('Usando dados em cache. Você pode estar offline.');
        }
      } catch (cacheErr) {
        console.error('Error loading cache:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect to load data when user changes
  useEffect(() => {
    if (user?.id) {
      loadDataFromSupabase(user.id);
      setView('dashboard');
    } else {
      // Clear data when user logs out
      setProducts([]);
      setCustomers([]);
      setSales([]);
      setCategories(defaultCategories);
      setCreditCards([]);
      setSettings(defaultSettings);
      setView('login');
    }
  }, [user?.id]);

  // Refresh data from Supabase
  const refreshData = async () => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }
    await loadDataFromSupabase(user.id);
  };

  // Legacy login (for compatibility)
  const login = () => {
    setView('dashboard');
  };

  // Legacy logout (for compatibility)
  const logout = async () => {
    await signOut();
    setView('login');
  };

  // Update user profile metadata
  const updateUserProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      alert(err.message || 'Erro ao atualizar perfil');
      throw err;
    }
  };

  // Product methods
  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newProduct = await productsService.create(user.id, product);
      setProducts(prev => [newProduct, ...prev]);
    } catch (err: any) {
      console.error('Error adding product:', err);
      const errorMsg = err.message || 'Erro ao adicionar produto';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await productsService.update(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err: any) {
      console.error('Error updating product:', err);
      const errorMsg = err.message || 'Erro ao atualizar produto';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await productsService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting product:', err);
      const errorMsg = err.message || 'Erro ao deletar produto';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Customer methods
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCustomer = await customersService.create(user.id, customer);
      setCustomers(prev => [newCustomer, ...prev]);
    } catch (err: any) {
      console.error('Error adding customer:', err);
      const errorMsg = err.message || 'Erro ao adicionar cliente';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await customersService.update(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err: any) {
      console.error('Error updating customer:', err);
      const errorMsg = err.message || 'Erro ao atualizar cliente';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await customersService.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      const errorMsg = err.message || 'Erro ao deletar cliente';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sale methods
  const addSale = async (sale: Omit<Sale, 'id'>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newSale = await salesService.create(user.id, sale);
      setSales(prev => [newSale, ...prev]);
    } catch (err: any) {
      console.error('Error adding sale:', err);
      const errorMsg = err.message || 'Erro ao adicionar venda';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Category methods
  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCategory = await categoriesService.create(user.id, category);
      setCategories(prev => [newCategory, ...prev]);
    } catch (err: any) {
      console.error('Error adding category:', err);
      const errorMsg = err.message || 'Erro ao adicionar categoria';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await categoriesService.update(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err: any) {
      console.error('Error updating category:', err);
      const errorMsg = err.message || 'Erro ao atualizar categoria';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await categoriesService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting category:', err);
      const errorMsg = err.message || 'Erro ao deletar categoria';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Credit Card methods
  const addCreditCard = async (card: Omit<CreditCard, 'id'>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCard = await creditCardsService.create(user.id, card);
      setCreditCards(prev => [newCard, ...prev]);
    } catch (err: any) {
      console.error('Error adding credit card:', err);
      const errorMsg = err.message || 'Erro ao adicionar cartão';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCreditCard = async (id: string, updates: Partial<CreditCard>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await creditCardsService.update(id, updates);
      setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err: any) {
      console.error('Error updating credit card:', err);
      const errorMsg = err.message || 'Erro ao atualizar cartão';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCreditCard = async (id: string) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await creditCardsService.delete(id);
      setCreditCards(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting credit card:', err);
      const errorMsg = err.message || 'Erro ao deletar cartão';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Settings methods
  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!user?.id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await settingsService.update(user.id, updates);
      setSettings(prev => ({ ...prev, ...updates }));
    } catch (err: any) {
      console.error('Error updating settings:', err);
      const errorMsg = err.message || 'Erro ao atualizar configurações';
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AppContextType = {
    view,
    products,
    customers,
    sales,
    categories,
    creditCards,
    settings,
    isAuthenticated,
    loading,
    error,
    setView,
    setProducts,
    setCustomers,
    setSales,
    setCategories,
    setCreditCards,
    setSettings,
    signIn,
    signUp,
    signOut,
    login,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSale,
    addCategory,
    updateCategory,
    deleteCategory,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    updateSettings,
    refreshData,
    user,
    updateUserProfile
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Re-export useAuth for direct access to authentication
export { useAuth };

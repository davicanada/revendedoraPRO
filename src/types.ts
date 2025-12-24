export enum Brand {
  NATURA = 'Natura',
  AVON = 'Avon',
  OTHER = 'Outra'
}

export enum SaleType {
  PHYSICAL = 'Física (Estoque)',
  ONLINE = 'Online (Link)'
}

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  category: string;
  stockQuantity: number;
  costPrice: number;
  salePrice: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags: string[];
  totalSpent: number;
  lastPurchaseDate?: string;
  birthDate?: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName: string;
  date: string;
  type: SaleType;
  items: SaleItem[];
  totalAmount: number;
  profit: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface DashboardMetrics {
  totalProfitMonth: number;
  totalSalesMonth: number;
  activeCustomers: number;
  lowStockCount: number;
}

export interface CreditCard {
  id: string;
  bank: string;
  lastDigits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  subcategories?: string[];
}

export interface AppSettings {
  defaultCommission: number;
  lowStockThreshold: number;
  currency: string;
}

export type View =
  | 'login'
  | 'dashboard'
  | 'stock'
  | 'customers'
  | 'sales'
  | 'add-product'
  | 'add-customer'
  | 'new-sale'
  | 'categories'
  | 'settings'
  | 'credit-cards'
  | 'manage-brands';

export interface AppState {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  categories: Category[];
  creditCards: CreditCard[];
  settings: AppSettings;
}

import { Brand, Product, Customer, Sale, SaleType } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Kaiak Urbe Desodorante',
    brand: Brand.NATURA,
    category: 'Perfumaria',
    stockQuantity: 5,
    costPrice: 89.90,
    salePrice: 139.90,
    image: 'https://picsum.photos/100/100?random=1'
  },
  {
    id: '2',
    name: 'Essencial Oud Masculino',
    brand: Brand.NATURA,
    category: 'Perfumaria',
    stockQuantity: 2,
    costPrice: 110.00,
    salePrice: 190.00,
    image: 'https://picsum.photos/100/100?random=2'
  },
  {
    id: '3',
    name: 'Renew Platinum Dia',
    brand: Brand.AVON,
    category: 'Cuidados com a Pele',
    stockQuantity: 8,
    costPrice: 45.50,
    salePrice: 75.90,
    image: 'https://picsum.photos/100/100?random=3'
  },
  {
    id: '4',
    name: 'Batom Power Stay Vermelho',
    brand: Brand.AVON,
    category: 'Maquiagem',
    stockQuantity: 12,
    costPrice: 18.00,
    salePrice: 39.90,
    image: 'https://picsum.photos/100/100?random=4'
  },
  {
    id: '5',
    name: 'Hidratante Todo Dia Algodão',
    brand: Brand.NATURA,
    category: 'Corpo',
    stockQuantity: 0,
    costPrice: 25.00,
    salePrice: 49.90,
    image: 'https://picsum.photos/100/100?random=5'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Ana Silva',
    phone: '11999999999',
    email: 'ana@email.com',
    tags: ['VIP'],
    totalSpent: 450.00,
    lastPurchaseDate: '2023-12-10'
  },
  {
    id: 'c2',
    name: 'Beatriz Costa',
    phone: '11888888888',
    tags: ['Novo'],
    totalSpent: 89.90,
    lastPurchaseDate: '2023-12-20'
  },
  {
    id: 'c3',
    name: 'Carla Dias',
    tags: ['Inativo'],
    totalSpent: 1200.00,
    lastPurchaseDate: '2023-06-15'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 's1',
    customerId: 'c1',
    customerName: 'Ana Silva',
    date: '2023-12-10',
    type: SaleType.PHYSICAL,
    totalAmount: 150.00,
    profit: 50.00,
    items: []
  },
  {
    id: 's2',
    customerId: 'c2',
    customerName: 'Beatriz Costa',
    date: '2023-12-20',
    type: SaleType.ONLINE,
    totalAmount: 89.90,
    profit: 15.00,
    items: []
  }
];

export const CATEGORIES = [
  'Perfumaria',
  'Maquiagem',
  'Cuidados com a Pele',
  'Cabelos',
  'Corpo',
  'Infantil'
];

export const BANKS_PRESETS = [
  'Nubank',
  'Inter',
  'C6 Bank',
  'Itaú',
  'Bradesco',
  'Santander',
  'Banco do Brasil',
  'Caixa',
  'Outro'
];

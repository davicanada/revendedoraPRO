import { Product, Sale, SaleItem, SaleType } from '../types';

/**
 * Calcula o desconto com base no tipo e valor
 */
export const calculateDiscount = (
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    return subtotal * (discountValue / 100);
  }
  return discountValue;
};

/**
 * Calcula o lucro de uma venda
 */
export const calculateProfit = (
  items: SaleItem[],
  products: Product[],
  saleType: SaleType,
  discountValue: number
): number => {
  if (saleType === SaleType.PHYSICAL) {
    const totalCost = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.costPrice || 0) * item.quantity;
    }, 0);

    const totalRevenue = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return totalRevenue - totalCost - discountValue;
  } else {
    // Online: 15% commission
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const commission = subtotal * 0.15;
    return Math.max(0, commission - discountValue);
  }
};

/**
 * Calcula a comissão de venda online
 */
export const calculateCommission = (subtotal: number, commissionRate: number = 0.15): number => {
  return subtotal * commissionRate;
};

/**
 * Formata valor para moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Calcula métricas do dashboard
 */
export const calculateDashboardMetrics = (
  sales: Sale[],
  products: Product[]
) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const salesThisMonth = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const totalProfitMonth = salesThisMonth.reduce((sum, sale) => sum + sale.profit, 0);
  const totalSalesMonth = salesThisMonth.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const lowStockCount = products.filter(p => p.stockQuantity < 3).length;

  // Unique customers this month
  const uniqueCustomerIds = new Set(salesThisMonth.map(s => s.customerId).filter(Boolean));
  const activeCustomers = uniqueCustomerIds.size;

  return {
    totalProfitMonth,
    totalSalesMonth,
    activeCustomers,
    lowStockCount
  };
};

/**
 * Gera ID único
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Verifica se produto está com estoque baixo
 */
export const isLowStock = (quantity: number, threshold: number = 3): boolean => {
  return quantity < threshold && quantity > 0;
};

/**
 * Verifica se produto está esgotado
 */
export const isOutOfStock = (quantity: number): boolean => {
  return quantity === 0;
};

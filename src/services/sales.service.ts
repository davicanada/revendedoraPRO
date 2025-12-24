import { supabase } from '../lib/supabase';
import { Sale, SaleType, SaleItem } from '../types';

export const salesService = {
  async getAll(userId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      customerId: row.customer_id || undefined,
      customerName: row.customer_name,
      date: row.date,
      type: row.type as SaleType,
      totalAmount: parseFloat(row.total_amount),
      profit: parseFloat(row.profit),
      items: (row.sale_items || []).map((item: any) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
      })),
    }));
  },

  async create(userId: string, sale: Omit<Sale, 'id'>): Promise<Sale> {
    // Insert sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: userId,
        customer_id: sale.customerId,
        customer_name: sale.customerName,
        date: sale.date,
        type: sale.type,
        total_amount: sale.totalAmount,
        profit: sale.profit,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // Insert sale items
    if (sale.items.length > 0) {
      const { error: itemsError } = await supabase.from('sale_items').insert(
        sale.items.map((item) => ({
          sale_id: saleData.id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        }))
      );

      if (itemsError) throw itemsError;
    }

    return {
      id: saleData.id,
      customerId: saleData.customer_id || undefined,
      customerName: saleData.customer_name,
      date: saleData.date,
      type: saleData.type as SaleType,
      totalAmount: parseFloat(saleData.total_amount),
      profit: parseFloat(saleData.profit),
      items: sale.items,
    };
  },

  async delete(id: string): Promise<void> {
    // Sale items will be deleted automatically due to CASCADE
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) throw error;
  },
};

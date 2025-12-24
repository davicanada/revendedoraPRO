import { supabase } from '../lib/supabase';
import { Product, Brand } from '../types';

export const productsService = {
  async getAll(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand as Brand,
      category: row.category,
      stockQuantity: row.stock_quantity,
      costPrice: parseFloat(row.cost_price),
      salePrice: parseFloat(row.sale_price),
      image: row.image || undefined,
    }));
  },

  async create(userId: string, product: Omit<Product, 'id'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        stock_quantity: product.stockQuantity,
        cost_price: product.costPrice,
        sale_price: product.salePrice,
        image: product.image,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      brand: data.brand as Brand,
      category: data.category,
      stockQuantity: data.stock_quantity,
      costPrice: parseFloat(data.cost_price),
      salePrice: parseFloat(data.sale_price),
      image: data.image || undefined,
    };
  },

  async update(id: string, updates: Partial<Product>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;
    if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
    if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice;
    if (updates.image !== undefined) dbUpdates.image = updates.image;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};

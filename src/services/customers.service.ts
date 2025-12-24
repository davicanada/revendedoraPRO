import { supabase } from '../lib/supabase';
import { Customer } from '../types';

export const customersService = {
  async getAll(userId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone || undefined,
      email: row.email || undefined,
      notes: row.notes || undefined,
      tags: row.tags || [],
      totalSpent: parseFloat(row.total_spent),
      lastPurchaseDate: row.last_purchase_date || undefined,
      birthDate: row.birth_date || undefined,
    }));
  },

  async create(userId: string, customer: Omit<Customer, 'id'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        notes: customer.notes,
        tags: customer.tags,
        total_spent: customer.totalSpent,
        last_purchase_date: customer.lastPurchaseDate,
        birth_date: customer.birthDate,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
      notes: data.notes || undefined,
      tags: data.tags || [],
      totalSpent: parseFloat(data.total_spent),
      lastPurchaseDate: data.last_purchase_date || undefined,
      birthDate: data.birth_date || undefined,
    };
  },

  async update(id: string, updates: Partial<Customer>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent;
    if (updates.lastPurchaseDate !== undefined) dbUpdates.last_purchase_date = updates.lastPurchaseDate;
    if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate;

    const { error } = await supabase
      .from('customers')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },
};

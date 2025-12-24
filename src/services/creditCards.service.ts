import { supabase } from '../lib/supabase';
import { CreditCard } from '../types';

export const creditCardsService = {
  async getAll(userId: string): Promise<CreditCard[]> {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      bank: row.bank,
      lastDigits: row.last_digits,
      limit: parseFloat(row.limit_amount),
      closingDay: row.closing_day,
      dueDay: row.due_day,
    }));
  },

  async create(userId: string, card: Omit<CreditCard, 'id'>): Promise<CreditCard> {
    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        user_id: userId,
        bank: card.bank,
        last_digits: card.lastDigits,
        limit_amount: card.limit,
        closing_day: card.closingDay,
        due_day: card.dueDay,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      bank: data.bank,
      lastDigits: data.last_digits,
      limit: parseFloat(data.limit_amount),
      closingDay: data.closing_day,
      dueDay: data.due_day,
    };
  },

  async update(id: string, updates: Partial<CreditCard>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.bank !== undefined) dbUpdates.bank = updates.bank;
    if (updates.lastDigits !== undefined) dbUpdates.last_digits = updates.lastDigits;
    if (updates.limit !== undefined) dbUpdates.limit_amount = updates.limit;
    if (updates.closingDay !== undefined) dbUpdates.closing_day = updates.closingDay;
    if (updates.dueDay !== undefined) dbUpdates.due_day = updates.dueDay;

    const { error } = await supabase
      .from('credit_cards')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('credit_cards').delete().eq('id', id);
    if (error) throw error;
  },
};

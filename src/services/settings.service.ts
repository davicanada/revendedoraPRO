import { supabase } from '../lib/supabase';
import { AppSettings } from '../types';

export const settingsService = {
  async get(userId: string): Promise<AppSettings> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If settings don't exist, create default
      return {
        defaultCommission: 0.15,
        lowStockThreshold: 3,
        currency: 'BRL',
      };
    }

    return {
      defaultCommission: parseFloat(data.default_commission),
      lowStockThreshold: data.low_stock_threshold,
      currency: data.currency,
    };
  },

  async update(userId: string, settings: Partial<AppSettings>): Promise<void> {
    const dbUpdates: any = {};
    if (settings.defaultCommission !== undefined) dbUpdates.default_commission = settings.defaultCommission;
    if (settings.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = settings.lowStockThreshold;
    if (settings.currency !== undefined) dbUpdates.currency = settings.currency;

    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        ...dbUpdates,
      });

    if (error) throw error;
  },
};

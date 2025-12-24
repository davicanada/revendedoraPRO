export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string
          category: string
          stock_quantity: number
          cost_price: number
          sale_price: number
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand: string
          category: string
          stock_quantity: number
          cost_price: number
          sale_price: number
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand?: string
          category?: string
          stock_quantity?: number
          cost_price?: number
          sale_price?: number
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          email: string | null
          notes: string | null
          tags: string[]
          total_spent: number
          last_purchase_date: string | null
          birth_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          tags?: string[]
          total_spent?: number
          last_purchase_date?: string | null
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          tags?: string[]
          total_spent?: number
          last_purchase_date?: string | null
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          user_id: string
          customer_id: string | null
          customer_name: string
          date: string
          type: string
          total_amount: number
          profit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id?: string | null
          customer_name: string
          date: string
          type: string
          total_amount: number
          profit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string | null
          customer_name?: string
          date?: string
          type?: string
          total_amount?: number
          profit?: number
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          subcategories: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          subcategories?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          subcategories?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          bank: string
          last_digits: string
          limit: number
          closing_day: number
          due_day: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bank: string
          last_digits: string
          limit: number
          closing_day: number
          due_day: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bank?: string
          last_digits?: string
          limit?: number
          closing_day?: number
          due_day?: number
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          default_commission: number
          low_stock_threshold: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          default_commission?: number
          low_stock_threshold?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          default_commission?: number
          low_stock_threshold?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

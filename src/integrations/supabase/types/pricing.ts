import { Json } from './base';

export interface PricingTable {
  pricing_labor: {
    Row: {
      created_at: string
      description: string | null
      final_price: number
      id: string
      margin_percent: number
      name: string
      provider_value: number
      updated_at: string
      user_id: string
    }
    Insert: {
      created_at?: string
      description?: string | null
      final_price?: number
      id?: string
      margin_percent?: number
      name: string
      provider_value?: number
      updated_at?: string
      user_id: string
    }
    Update: {
      created_at?: string
      description?: string | null
      final_price?: number
      id?: string
      margin_percent?: number
      name?: string
      provider_value?: number
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
  pricing_products: {
    Row: {
      base_price: number
      created_at: string
      description: string | null
      final_price: number
      id: string
      margin_percent: number
      name: string
      updated_at: string
      user_id: string
    }
    Insert: {
      base_price?: number
      created_at?: string
      description?: string | null
      final_price?: number
      id?: string
      margin_percent?: number
      name: string
      updated_at?: string
      user_id: string
    }
    Update: {
      base_price?: number
      created_at?: string
      description?: string | null
      final_price?: number
      id?: string
      margin_percent?: number
      name?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
  pricing_transport: {
    Row: {
      base_cost: number
      created_at: string
      description: string | null
      final_price: number
      id: string
      margin_percent: number
      name: string
      updated_at: string
      user_id: string
    }
    Insert: {
      base_cost?: number
      created_at?: string
      description?: string | null
      final_price?: number
      id?: string
      margin_percent?: number
      name: string
      updated_at?: string
      user_id: string
    }
    Update: {
      base_cost?: number
      created_at?: string
      description?: string | null
      final_price?: number
      id?: string
      margin_percent?: number
      name?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
}
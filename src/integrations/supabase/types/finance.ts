import { Json } from './base';

export interface FinanceTable {
  budgets: {
    Row: {
      client_name: string | null
      created_at: string
      id: string
      margin_percent: number
      name: string
      notes: string | null
      status: string
      total_cost: number
      total_profit: number
      total_value: number
      updated_at: string
      user_id: string
      client_id: string | null
      project_id: string | null
      security_coefficient: number
    }
    Insert: {
      client_name?: string | null
      created_at?: string
      id?: string
      margin_percent?: number
      name: string
      notes?: string | null
      status?: string
      total_cost?: number
      total_profit?: number
      total_value?: number
      updated_at?: string
      user_id: string
      client_id?: string | null
      project_id?: string | null
      security_coefficient?: number
    }
    Update: {
      client_name?: string | null
      created_at?: string
      id?: string
      margin_percent?: number
      name?: string
      notes?: string | null
      status?: string
      total_cost?: number
      total_profit?: number
      total_value?: number
      updated_at?: string
      user_id?: string
      client_id?: string | null
      project_id?: string | null
      security_coefficient?: number
    }
    Relationships: []
  }
  budget_items: {
    Row: {
      budget_id: string
      created_at: string
      group_name: string | null
      id: string
      item_id: string | null
      name: string
      profit: number
      quantity: number
      total_cost: number
      total_price: number
      type: string
      unit_cost: number
      unit_price: number
      margin_percent: number | null
    }
    Insert: {
      budget_id: string
      created_at?: string
      group_name?: string | null
      id?: string
      item_id?: string | null
      name: string
      profit?: number
      quantity?: number
      total_cost?: number
      total_price?: number
      type: string
      unit_cost?: number
      unit_price?: number
      margin_percent?: number | null
    }
    Update: {
      budget_id?: string
      created_at?: string
      group_name?: string | null
      id?: string
      item_id?: string | null
      name?: string
      profit?: number
      quantity?: number
      total_cost?: number
      total_price?: number
      type?: string
      unit_cost?: number
      unit_price?: number
      margin_percent?: number | null
    }
    Relationships: [
      {
        foreignKeyName: "budget_items_budget_id_fkey"
        columns: ["budget_id"]
        isOneToOne: false
        referencedRelation: "budgets"
        referencedColumns: ["id"]
      }
    ]
  }
  transactions: {
    Row: {
      category: string | null
      client_id: string | null
      created_at: string
      date: string
      description: string
      destination: string
      id: string
      project_id: string | null
      type: string
      user_id: string
      value: number
    }
    Insert: {
      category?: string | null
      client_id?: string | null
      created_at?: string
      date?: string
      description: string
      destination?: string
      id?: string
      project_id?: string | null
      type?: string
      user_id: string
      value?: number
    }
    Update: {
      category?: string | null
      client_id?: string | null
      created_at?: string
      date?: string
      description?: string
      destination?: string
      id?: string
      project_id?: string | null
      type?: string
      user_id?: string
      value?: number
    }
    Relationships: [
      {
        foreignKeyName: "transactions_client_id_fkey"
        columns: ["client_id"]
        isOneToOne: false
        referencedRelation: "clients"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "transactions_project_id_fkey"
        columns: ["project_id"]
        isOneToOne: false
        referencedRelation: "projects"
        referencedColumns: ["id"]
      }
    ]
  }
}
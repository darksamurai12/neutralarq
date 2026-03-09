import { Json } from './base';

export interface AuthTable {
  profiles: {
    Row: {
      company_name: string | null
      created_at: string
      full_name: string | null
      id: string
      updated_at: string
      user_id: string
    }
    Insert: {
      company_name?: string | null
      created_at?: string
      full_name?: string | null
      id?: string
      updated_at?: string
      user_id: string
    }
    Update: {
      company_name?: string | null
      created_at?: string
      full_name?: string | null
      id?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
  calendar_events: {
    Row: {
      all_day: boolean
      client_id: string | null
      completed: boolean
      created_at: string
      deal_id: string | null
      description: string
      end_date: string
      id: string
      reminder: number | null
      start_date: string
      title: string
      type: string
      user_id: string
    }
    Insert: {
      all_day?: boolean
      client_id?: string | null
      completed?: boolean
      created_at?: string
      deal_id?: string | null
      description?: string
      end_date?: string
      id?: string
      reminder?: number | null
      start_date?: string
      title: string
      type?: string
      user_id: string
    }
    Update: {
      all_day?: boolean
      client_id?: string | null
      completed?: boolean
      created_at?: string
      deal_id?: string | null
      description?: string
      end_date?: string
      id?: string
      reminder?: number | null
      start_date?: string
      title?: string
      type?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "calendar_events_client_id_fkey"
        columns: ["client_id"]
        isOneToOne: false
        referencedRelation: "clients"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "calendar_events_deal_id_fkey"
        columns: ["deal_id"]
        isOneToOne: false
        referencedRelation: "deals"
        referencedColumns: ["id"]
      }
    ]
  }
}
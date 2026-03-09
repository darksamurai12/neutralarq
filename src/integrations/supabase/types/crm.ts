import { Json } from './base';

export interface CRMTable {
  clients: {
    Row: {
      address: string
      company: string
      created_at: string
      email: string
      id: string
      name: string
      notes: string
      phone: string
      phone2: string | null
      position: string
      status: string
      user_id: string
    }
    Insert: {
      address?: string
      company?: string
      created_at?: string
      email?: string
      id?: string
      name: string
      notes?: string
      phone?: string
      phone2?: string | null
      position?: string
      status?: string
      user_id: string
    }
    Update: {
      address?: string
      company?: string
      created_at?: string
      email?: string
      id?: string
      name?: string
      notes?: string
      phone?: string
      phone2?: string | null
      position?: string
      status?: string
      user_id?: string
    }
    Relationships: []
  }
  deals: {
    Row: {
      client_id: string | null
      created_at: string
      expected_close_date: string | null
      id: string
      notes: string
      probability: number
      stage: string
      title: string
      user_id: string
      value: number
    }
    Insert: {
      client_id?: string | null
      created_at?: string
      expected_close_date?: string | null
      id?: string
      notes?: string
      probability?: number
      stage?: string
      title: string
      user_id: string
      value?: number
    }
    Update: {
      client_id?: string | null
      created_at?: string
      expected_close_date?: string | null
      id?: string
      notes?: string
      probability?: number
      stage?: string
      title?: string
      user_id?: string
      value?: number
    }
    Relationships: [
      {
        foreignKeyName: "deals_client_id_fkey"
        columns: ["client_id"]
        isOneToOne: false
        referencedRelation: "clients"
        referencedColumns: ["id"]
      }
    ]
  }
  client_interactions: {
    Row: {
      client_id: string
      created_at: string
      date: string
      description: string
      id: string
      type: string
      user_id: string
    }
    Insert: {
      client_id: string
      created_at?: string
      date?: string
      description: string
      id?: string
      type: string
      user_id: string
    }
    Update: {
      client_id?: string
      created_at?: string
      date?: string
      description?: string
      id?: string
      type?: string
      user_id?: string
    }
    Relationships: []
  }
}
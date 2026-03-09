import { Json } from './base';

export interface OfficeTable {
  inventory: {
    Row: {
      id: string
      user_id: string
      name: string
      category: string
      quantity: number
      unit: string
      min_stock: number
      unit_cost: number
      location: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      name: string
      category: string
      quantity?: number
      unit: string
      min_stock?: number
      unit_cost?: number
      location?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      name?: string
      category?: string
      quantity?: number
      unit?: string
      min_stock?: number
      unit_cost?: number
      location?: string | null
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  notes: {
    Row: {
      id: string
      user_id: string
      list_id: string | null
      title: string
      content: string | null
      note_type: string
      priority: string
      color: string
      is_pinned: boolean
      is_important: boolean
      is_archived: boolean
      reminder_date: string | null
      author_name: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      list_id?: string | null
      title: string
      content?: string | null
      note_type?: string
      priority?: string
      color?: string
      is_pinned?: boolean
      is_important?: boolean
      is_archived?: boolean
      reminder_date?: string | null
      author_name?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      list_id?: string | null
      title?: string
      content?: string | null
      note_type?: string
      priority?: string
      color?: string
      is_pinned?: boolean
      is_important?: boolean
      is_archived?: boolean
      reminder_date?: string | null
      author_name?: string | null
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  note_lists: {
    Row: {
      id: string
      user_id: string
      name: string
      color: string
      icon: string
      created_at: string
    }
    Insert: {
      id?: string
      user_id: string
      name: string
      color: string
      icon: string
      created_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      name?: string
      color?: string
      icon?: string
      created_at?: string
    }
    Relationships: []
  }
  note_checklist_items: {
    Row: {
      id: string
      note_id: string
      description: string
      is_completed: boolean
      order_index: number
      created_at: string
    }
    Insert: {
      id?: string
      note_id: string
      description: string
      is_completed?: boolean
      order_index?: number
      created_at?: string
    }
    Update: {
      id?: string
      note_id?: string
      description?: string
      is_completed?: boolean
      order_index?: number
      created_at?: string
    }
    Relationships: []
  }
  documents: {
    Row: {
      id: string
      name: string
      description: string | null
      category: string
      department: string | null
      file_path: string
      size: number
      file_type: string
      version: number
      status: string
      expiry_date: string | null
      created_by: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      name: string
      description?: string | null
      category: string
      department?: string | null
      file_path: string
      size: number
      file_type: string
      version?: number
      status?: string
      expiry_date?: string | null
      created_by: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      name?: string
      description?: string | null
      category?: string
      department?: string | null
      file_path?: string
      size?: number
      file_type?: string
      version?: number
      status?: string
      expiry_date?: string | null
      created_by?: string
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
}
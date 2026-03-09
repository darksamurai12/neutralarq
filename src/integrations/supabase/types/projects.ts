import { Json } from './base';

export interface ProjectsTable {
  projects: {
    Row: {
      budget: number
      client_id: string | null
      created_at: string
      deadline: string
      description: string
      id: string
      location: string
      name: string
      parent_project_id: string | null
      start_date: string
      status: string
      type: string
      user_id: string
    }
    Insert: {
      budget?: number
      client_id?: string | null
      created_at?: string
      deadline?: string
      description?: string
      id?: string
      location?: string
      name: string
      parent_project_id?: string | null
      start_date?: string
      status?: string
      type?: string
      user_id: string
    }
    Update: {
      budget?: number
      client_id?: string | null
      created_at?: string
      deadline?: string
      description?: string
      id?: string
      location?: string
      name?: string
      parent_project_id?: string | null
      start_date?: string
      status?: string
      type?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "projects_client_id_fkey"
        columns: ["client_id"]
        isOneToOne: false
        referencedRelation: "clients"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "projects_parent_project_id_fkey"
        columns: ["parent_project_id"]
        isOneToOne: false
        referencedRelation: "projects"
        referencedColumns: ["id"]
      }
    ]
  }
  tasks: {
    Row: {
      comments: Json
      completion_percentage: number
      created_at: string
      deadline: string | null
      description: string
      id: string
      phase: string
      priority: string
      project_id: string | null
      responsible: string
      status: string
      subtasks: Json
      title: string
      user_id: string
    }
    Insert: {
      comments?: Json
      completion_percentage?: number
      created_at?: string
      deadline?: string | null
      description?: string
      id?: string
      phase?: string
      priority?: string
      project_id?: string | null
      responsible?: string
      status?: string
      subtasks?: Json
      title: string
      user_id: string
    }
    Update: {
      comments?: Json
      completion_percentage?: number
      created_at?: string
      deadline?: string | null
      description?: string
      id?: string
      phase?: string
      priority?: string
      project_id?: string | null
      responsible?: string
      status?: string
      subtasks?: Json
      title?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "tasks_project_id_fkey"
        columns: ["project_id"]
        isOneToOne: false
        referencedRelation: "projects"
        referencedColumns: ["id"]
      }
    ]
  }
  project_history: {
    Row: {
      action: string
      date: string
      description: string
      id: string
      project_id: string
      user_id: string
    }
    Insert: {
      action: string
      date?: string
      description?: string
      id?: string
      project_id: string
      user_id: string
    }
    Update: {
      action?: string
      date?: string
      description?: string
      id?: string
      project_id?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "project_history_project_id_fkey"
        columns: ["project_id"]
        isOneToOne: false
        referencedRelation: "projects"
        referencedColumns: ["id"]
      }
    ]
  }
}
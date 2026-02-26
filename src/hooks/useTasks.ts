"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { toast } from 'sonner';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks((data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      type: (row.phase === 'pessoal' ? 'personal' : 'internal') as any,
      responsible: row.responsible || 'Não atribuído',
      deadline: row.deadline ? new Date(row.deadline) : new Date(),
      startDate: row.created_at ? new Date(row.created_at) : new Date(),
      status: (row.status === 'todo' ? 'pending' : row.status === 'doing' ? 'in_progress' : row.status === 'done' ? 'completed' : row.status === 'canceled' ? 'canceled' : 'pending') as any,
      priority: (row.priority === 'critical' ? 'urgent' : row.priority) as any,
      completionPercentage: Number(row.completion_percentage || 0),
      subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
      comments: Array.isArray(row.comments) ? row.comments : [],
      createdAt: new Date(row.created_at),
      projectId: row.project_id
    })));
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!userId) {
      toast.error('Utilizador não autenticado');
      return;
    }
    
    const dbStatus = task.status === 'pending' ? 'todo' : task.status === 'in_progress' ? 'doing' : task.status === 'completed' ? 'done' : 'canceled';
    const dbPriority = task.priority === 'urgent' ? 'critical' : task.priority;

    const { data, error } = await supabase.from('tasks').insert({
      title: task.title,
      description: task.description,
      responsible: task.responsible,
      deadline: task.deadline.toISOString(),
      status: dbStatus,
      priority: dbPriority,
      phase: task.type === 'personal' ? 'pessoal' : 'interna',
      completion_percentage: task.completionPercentage,
      subtasks: task.subtasks,
      comments: task.comments,
      user_id: userId,
      project_id: null // Explicitamente nulo para evitar erros de UUID vazio
    }).select().single();

    if (error) { 
      console.error('Erro Supabase:', error);
      toast.error(`Erro ao adicionar tarefa: ${error.message}`); 
      return; 
    }
    
    fetchTasks();
    toast.success('Tarefa adicionada com sucesso');
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const dbUpdates: any = { ...updates };
    
    if (updates.status) {
      dbUpdates.status = updates.status === 'pending' ? 'todo' : updates.status === 'in_progress' ? 'doing' : updates.status === 'completed' ? 'done' : 'canceled';
    }
    if (updates.priority) {
      dbUpdates.priority = updates.priority === 'urgent' ? 'critical' : updates.priority;
    }
    if (updates.type) {
      dbUpdates.phase = updates.type === 'personal' ? 'pessoal' : 'interna';
    }
    if (updates.deadline) dbUpdates.deadline = updates.deadline.toISOString();
    if (updates.startDate) dbUpdates.created_at = updates.startDate.toISOString();

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) { 
      toast.error('Erro ao atualizar tarefa'); 
      return; 
    }
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar tarefa'); return; }
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Tarefa eliminada');
  };

  return { tasks, setTasks, fetchTasks, addTask, updateTask, deleteTask };
}
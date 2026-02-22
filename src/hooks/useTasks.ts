"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { toast } from 'sonner';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    // Removido o filtro .eq('user_id', userId)
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
      projectId: row.project_id,
      title: row.title,
      description: row.description,
      responsible: row.responsible,
      deadline: row.deadline ? new Date(row.deadline) : null,
      status: row.status as any,
      priority: row.priority as any,
      phase: row.phase as any,
      completionPercentage: Number(row.completion_percentage),
      subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
      comments: Array.isArray(row.comments) ? row.comments : [],
      createdAt: new Date(row.created_at)
    })));
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('tasks').insert({
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      responsible: task.responsible,
      deadline: task.deadline?.toISOString(),
      status: task.status,
      priority: task.priority,
      phase: task.phase,
      completion_percentage: task.completionPercentage,
      subtasks: task.subtasks,
      comments: task.comments,
      user_id: userId
    }).select().single();
    if (error) { toast.error('Erro ao adicionar tarefa'); return; }
    setTasks(prev => [{
      ...data,
      projectId: data.project_id,
      deadline: data.deadline ? new Date(data.deadline) : null,
      completionPercentage: data.completion_percentage,
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Tarefa adicionada');
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const dbUpdates: any = { ...updates };
    if (updates.projectId) { dbUpdates.project_id = updates.projectId; delete dbUpdates.projectId; }
    if (updates.deadline) { dbUpdates.deadline = updates.deadline.toISOString(); delete dbUpdates.deadline; }
    if (updates.completionPercentage !== undefined) { dbUpdates.completion_percentage = updates.completionPercentage; delete dbUpdates.completionPercentage; }

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar tarefa'); return; }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar tarefa'); return; }
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Tarefa eliminada');
  };

  return { tasks, setTasks, fetchTasks, addTask, updateTask, deleteTask };
}
"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';
import { toast } from 'sonner';

export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = useCallback(async () => {
    // Removido o filtro .eq('user_id', userId)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects((data || []).map(row => ({
      id: row.id,
      name: row.name,
      clientId: row.client_id,
      type: row.type as any,
      location: row.location,
      description: row.description,
      startDate: new Date(row.start_date),
      deadline: new Date(row.deadline),
      budget: Number(row.budget),
      status: row.status as any,
      parentProjectId: row.parent_project_id,
      createdAt: new Date(row.created_at)
    })));
  }, []);

  const addProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('projects').insert({
      name: project.name,
      client_id: project.clientId,
      type: project.type,
      location: project.location,
      description: project.description,
      start_date: project.startDate.toISOString(),
      deadline: project.deadline.toISOString(),
      budget: project.budget,
      status: project.status,
      parent_project_id: project.parentProjectId,
      user_id: userId
    }).select().single();
    if (error) { toast.error('Erro ao adicionar projecto'); return; }
    setProjects(prev => [{
      ...data,
      clientId: data.client_id,
      startDate: new Date(data.start_date),
      deadline: new Date(data.deadline),
      parentProjectId: data.parent_project_id,
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Projecto adicionado');
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const dbUpdates: any = { ...updates };
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.startDate) { dbUpdates.start_date = updates.startDate.toISOString(); delete dbUpdates.startDate; }
    if (updates.deadline) { dbUpdates.deadline = updates.deadline.toISOString(); delete dbUpdates.deadline; }
    
    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar projecto'); return; }
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    toast.success('Projecto atualizado');
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar projecto'); return; }
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success('Projecto eliminado');
  };

  return { projects, setProjects, fetchProjects, addProject, updateProject, deleteProject };
}
"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note, NoteColor } from '@/types';
import { toast } from 'sonner';

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes((data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content || '',
        color: row.color as NoteColor,
        isPinned: row.is_pinned,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      })));
    }
    setLoading(false);
  }, [userId]);

  const addNote = async (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
      toast.error('Utilizador não autenticado');
      return;
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: note.title,
        content: note.content,
        color: note.color,
        is_pinned: note.isPinned
      })
      .select()
      .single();

    if (error) {
      console.error('Erro detalhado ao criar nota:', error);
      toast.error(`Erro ao criar nota: ${error.message}`);
    } else {
      setNotes(prev => [{
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content || '',
        color: data.color as NoteColor,
        isPinned: data.is_pinned,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }, ...prev]);
      toast.success('Nota criada');
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const dbUpdates: any = { ...updates };
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('notes')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar nota:', error);
      toast.error('Erro ao atualizar nota');
    } else {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n));
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao eliminar nota:', error);
      toast.error('Erro ao eliminar nota');
    } else {
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Nota eliminada');
    }
  };

  return { notes, loading, fetchNotes, addNote, updateNote, deleteNote };
}
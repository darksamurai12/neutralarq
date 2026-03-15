"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note, NoteColor, NoteType } from '@/types';
import { toast } from 'sonner';

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
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
        type: row.note_type as NoteType,
        color: row.color as NoteColor,
        isPinned: row.is_pinned,
        isArchived: row.is_archived,
        tags: row.tags || [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      })));
    }
    setLoading(false);
  }, []);

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('notes').insert({
      title: note.title,
      content: note.content,
      note_type: note.type,
      color: note.color,
      is_pinned: note.isPinned,
      is_archived: note.isArchived,
      tags: note.tags,
      user_id: userId
    }).select().single();

    if (error) {
      toast.error('Erro ao criar nota');
      return;
    }
    
    fetchNotes();
    toast.success('Nota criada');
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const dbUpdates: any = { ...updates };
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;
    if (updates.type !== undefined) dbUpdates.note_type = updates.type;
    
    delete dbUpdates.id;
    delete dbUpdates.createdAt;
    delete dbUpdates.updatedAt;
    delete dbUpdates.userId;

    const { error } = await supabase.from('notes').update(dbUpdates).eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar nota');
      return;
    }
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao eliminar nota');
      return;
    }
    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Nota eliminada');
  };

  return { notes, loading, fetchNotes, addNote, updateNote, deleteNote };
}
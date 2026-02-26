"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note, NoteColor, NoteType } from '@/types';
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
        userId: row.user_id || '',
        title: row.title,
        content: row.content || '',
        color: (row.color as NoteColor) || 'default',
        type: (row.type as NoteType) || 'office',
        category: row.category || '',
        isPinned: row.is_pinned || false,
        isImportant: row.is_important || false,
        isArchived: row.is_archived || false,
        reminderDate: row.reminder_date ? new Date(row.reminder_date) : null,
        authorName: row.author_name || '',
        attachments: row.attachments || [],
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
        type: note.type,
        category: note.category,
        is_pinned: note.isPinned,
        is_important: note.isImportant,
        is_archived: note.isArchived,
        reminder_date: note.reminderDate?.toISOString(),
        author_name: note.authorName,
        attachments: note.attachments
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar nota:', error);
      toast.error(`Erro ao criar nota: ${error.message}`);
    } else {
      fetchNotes();
      toast.success('Nota criada com sucesso');
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.isImportant !== undefined) dbUpdates.is_important = updates.isImportant;
    if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;
    if (updates.reminderDate !== undefined) dbUpdates.reminder_date = updates.reminderDate?.toISOString();
    if (updates.authorName !== undefined) dbUpdates.author_name = updates.authorName;
    if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
    
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
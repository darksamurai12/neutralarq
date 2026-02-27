"use client";

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note, NoteList, NoteChecklistItem, NotePriority, NoteType } from '@/types';
import { toast } from 'sonner';

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [lists, setLists] = useState<NoteList[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLists = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('note_lists').select('*').order('name');
    if (!error && data) setLists(data.map(l => ({ id: l.id, name: l.name, color: l.color, icon: l.icon, userId: l.user_id })));
  }, [userId]);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*, note_checklist_items(*)')
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setNotes(data.map(n => ({
        id: n.id,
        userId: n.user_id,
        listId: n.list_id,
        title: n.title,
        content: n.content || '',
        type: (n.note_type as NoteType) || 'text',
        priority: (n.priority as NotePriority) || 'medium',
        isPinned: n.is_pinned || false,
        isArchived: n.is_archived || false,
        reminderDate: n.reminder_date ? new Date(n.reminder_date) : null,
        createdAt: new Date(n.created_at),
        updatedAt: new Date(n.updated_at),
        checklistItems: (n.note_checklist_items || []).map((item: any) => ({
          id: item.id,
          noteId: item.note_id,
          description: item.description,
          isCompleted: item.is_completed,
          orderIndex: item.order_index
        })).sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      })));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchLists();
      fetchNotes();
    }
  }, [userId, fetchLists, fetchNotes]);

  const addNote = async (note: Partial<Note>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('notes').insert({
      user_id: userId,
      title: note.title || 'Nova Nota',
      content: note.content || '',
      list_id: note.listId,
      priority: note.priority || 'medium',
      note_type: note.type || 'text',
      is_pinned: note.isPinned || false,
      reminder_date: note.reminderDate?.toISOString()
    }).select().single();

    if (!error && data) {
      await fetchNotes();
      return data.id;
    }
    return null;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const dbUpdates: any = { ...updates };
    if (updates.listId !== undefined) dbUpdates.list_id = updates.listId;
    if (updates.type !== undefined) dbUpdates.note_type = updates.type;
    if (updates.reminderDate !== undefined) dbUpdates.reminder_date = updates.reminderDate?.toISOString();
    
    delete dbUpdates.checklistItems;
    delete dbUpdates.id;
    delete dbUpdates.createdAt;
    delete dbUpdates.updatedAt;

    const { error } = await supabase.from('notes').update(dbUpdates).eq('id', id);
    if (!error) fetchNotes();
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Nota eliminada');
    }
  };

  const addChecklistItem = async (noteId: string, description: string) => {
    const { error } = await supabase.from('note_checklist_items').insert({
      note_id: noteId,
      description,
      order_index: notes.find(n => n.id === noteId)?.checklistItems?.length || 0
    });
    if (!error) fetchNotes();
  };

  const toggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
    const { error } = await supabase.from('note_checklist_items').update({ is_completed: isCompleted }).eq('id', itemId);
    if (!error) fetchNotes();
  };

  const deleteChecklistItem = async (itemId: string) => {
    const { error } = await supabase.from('note_checklist_items').delete().eq('id', itemId);
    if (!error) fetchNotes();
  };

  const addList = async (name: string, color: string, icon: string) => {
    if (!userId) return;
    const { error } = await supabase.from('note_lists').insert({ user_id: userId, name, color, icon });
    if (!error) fetchLists();
  };

  return { 
    notes, lists, loading, 
    addNote, updateNote, deleteNote, 
    addChecklistItem, toggleChecklistItem, deleteChecklistItem,
    addList, fetchNotes, fetchLists 
  };
}
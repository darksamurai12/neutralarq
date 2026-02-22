"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types';
import { toast } from 'sonner';

export function useCalendarEvents(userId: string | undefined) {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const fetchCalendarEvents = useCallback(async () => {
    // Removido o filtro .eq('user_id', userId)
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    setCalendarEvents((data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type as any,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      allDay: row.all_day,
      clientId: row.client_id,
      dealId: row.deal_id,
      reminder: row.reminder,
      completed: row.completed,
      createdAt: new Date(row.created_at)
    })));
  }, []);

  const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('calendar_events').insert({
      title: event.title,
      description: event.description,
      type: event.type,
      start_date: event.startDate.toISOString(),
      end_date: event.endDate.toISOString(),
      all_day: event.allDay,
      client_id: event.clientId,
      deal_id: event.dealId,
      reminder: event.reminder,
      completed: event.completed,
      user_id: userId
    }).select().single();
    if (error) { toast.error('Erro ao adicionar evento'); return; }
    setCalendarEvents(prev => [{
      ...data,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      allDay: data.all_day,
      client_id: data.client_id,
      dealId: data.deal_id,
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Evento agendado');
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const dbUpdates: any = { ...updates };
    if (updates.startDate) { dbUpdates.start_date = updates.startDate.toISOString(); delete dbUpdates.startDate; }
    if (updates.endDate) { dbUpdates.end_date = updates.endDate.toISOString(); delete dbUpdates.endDate; }
    if (updates.allDay !== undefined) { dbUpdates.all_day = updates.allDay; delete dbUpdates.allDay; }
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.dealId) { dbUpdates.deal_id = updates.dealId; delete dbUpdates.dealId; }

    const { error } = await supabase.from('calendar_events').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar evento'); return; }
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteCalendarEvent = async (id: string) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar evento'); return; }
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    toast.success('Evento eliminado');
  };

  return { calendarEvents, setCalendarEvents, fetchCalendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent };
}
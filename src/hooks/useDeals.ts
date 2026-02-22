"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealStage } from '@/types';
import { toast } from 'sonner';

export function useDeals(userId: string | undefined) {
  const [deals, setDeals] = useState<Deal[]>([]);

  const fetchDeals = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
      return;
    }

    setDeals((data || []).map(row => ({
      id: row.id,
      title: row.title,
      clientId: row.client_id,
      value: Number(row.value),
      stage: row.stage as any,
      probability: Number(row.probability),
      expectedCloseDate: row.expected_close_date ? new Date(row.expected_close_date) : null,
      notes: row.notes,
      createdAt: new Date(row.created_at)
    })));
  }, [userId]);

  const addDeal = async (deal: Omit<Deal, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('deals').insert({
      title: deal.title,
      client_id: deal.clientId,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expected_close_date: deal.expectedCloseDate?.toISOString(),
      notes: deal.notes,
      user_id: userId
    }).select().single();
    if (error) { toast.error('Erro ao adicionar negócio'); return; }
    setDeals(prev => [{
      ...data,
      clientId: data.client_id,
      expectedCloseDate: data.expected_close_date ? new Date(data.expected_close_date) : null,
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Negócio adicionado');
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const dbUpdates: any = { ...updates };
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.expectedCloseDate) { dbUpdates.expected_close_date = updates.expectedCloseDate.toISOString(); delete dbUpdates.expectedCloseDate; }

    const { error } = await supabase.from('deals').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar negócio'); return; }
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDeal = async (id: string) => {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar negócio'); return; }
    setDeals(prev => prev.filter(d => d.id !== id));
    toast.success('Negócio eliminado');
  };

  return { deals, setDeals, fetchDeals, addDeal, updateDeal, deleteDeal };
}
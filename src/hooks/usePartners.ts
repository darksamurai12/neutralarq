"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Partner } from '@/types';
import { toast } from 'sonner';

export function usePartners(userId: string | undefined) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPartners = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching partners:', error);
    } else {
      setPartners((data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        type: row.type || '',
        email: row.email || '',
        phone: row.phone || '',
        services: row.services || '',
        status: (row.status || 'Ativo') as 'Ativo' | 'Inativo',
        nif: row.nif || '',
        address: row.address || '',
        createdAt: new Date(row.created_at)
      })));
    }
    setLoading(false);
  }, [userId]);

  const addPartner = async (partner: Omit<Partner, 'id' | 'createdAt' | 'userId'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('partners').insert({
      ...partner,
      user_id: userId
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar parceiro');
      return;
    }
    
    fetchPartners();
    toast.success('Parceiro adicionado');
  };

  const updatePartner = async (id: string, updates: Partial<Partner>) => {
    const { error } = await supabase.from('partners').update(updates).eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar parceiro');
      return;
    }
    fetchPartners();
    toast.success('Parceiro atualizado');
  };

  const deletePartner = async (id: string) => {
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao eliminar parceiro');
      return;
    }
    setPartners(prev => prev.filter(p => p.id !== id));
    toast.success('Parceiro eliminado');
  };

  return { partners, loading, fetchPartners, addPartner, updatePartner, deletePartner };
}
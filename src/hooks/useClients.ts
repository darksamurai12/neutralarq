"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';
import { toast } from 'sonner';

export function useClients(userId: string | undefined) {
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    setClients((data || []).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      phone2: (row as any).phone2,
      company: row.company,
      position: row.position,
      address: row.address,
      notes: row.notes,
      status: row.status as any,
      createdAt: new Date(row.created_at)
    })));
  }, []);

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('clients').insert({ ...client, user_id: userId }).select().single();
    if (error) { 
      console.error('Erro ao adicionar cliente:', error);
      toast.error('Erro ao adicionar cliente: ' + error.message); 
      return; 
    }
    setClients(prev => [{ ...data, createdAt: new Date(data.created_at) } as any, ...prev]);
    toast.success('Cliente adicionado');
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    // Remove campos que não devem ser enviados na atualização
    const { id: _, createdAt: __, ...updatableFields } = updates as any;
    
    const { error } = await supabase
      .from('clients')
      .update(updatableFields)
      .eq('id', id);

    if (error) { 
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente: ' + error.message); 
      return; 
    }
    
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    toast.success('Cliente atualizado');
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) { 
      console.error('Erro ao eliminar cliente:', error);
      toast.error('Erro ao eliminar cliente'); 
      return; 
    }
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('Cliente eliminado');
  };

  return { clients, setClients, fetchClients, addClient, updateClient, deleteClient };
}
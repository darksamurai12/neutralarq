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
      phone2: (row as any).phone2 || '',
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
    
    // Criar objeto de inserção limpo
    const insertData: any = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      position: client.position,
      address: client.address,
      notes: client.notes,
      status: client.status,
      user_id: userId
    };

    // Só adiciona phone2 se o campo existir no objeto (evita erro se a coluna não existir)
    if (client.phone2) insertData.phone2 = client.phone2;

    const { data, error } = await supabase.from('clients').insert(insertData).select().single();
    
    if (error) { 
      console.error('Erro ao adicionar cliente:', error);
      toast.error('Erro ao adicionar cliente: ' + error.message); 
      return; 
    }
    
    setClients(prev => [{ 
      ...data, 
      phone2: (data as any).phone2 || '',
      createdAt: new Date(data.created_at) 
    } as any, ...prev]);
    toast.success('Cliente adicionado');
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    // Mapear apenas os campos que sabemos que existem com certeza
    const updatableFields: any = {};
    if (updates.name !== undefined) updatableFields.name = updates.name;
    if (updates.email !== undefined) updatableFields.email = updates.email;
    if (updates.phone !== undefined) updatableFields.phone = updates.phone;
    if (updates.company !== undefined) updatableFields.company = updates.company;
    if (updates.position !== undefined) updatableFields.position = updates.position;
    if (updates.address !== undefined) updatableFields.address = updates.address;
    if (updates.notes !== undefined) updatableFields.notes = updates.notes;
    if (updates.status !== undefined) updatableFields.status = updates.status;
    
    // Tentar incluir phone2 apenas se estiver presente nos updates
    if (updates.phone2 !== undefined) updatableFields.phone2 = updates.phone2;
    
    const { error } = await supabase
      .from('clients')
      .update(updatableFields)
      .eq('id', id);

    if (error) { 
      console.error('Erro ao atualizar cliente:', error);
      // Se o erro for especificamente sobre a coluna phone2, tentamos atualizar sem ela
      if (error.message.includes('phone2')) {
        delete updatableFields.phone2;
        const { error: retryError } = await supabase.from('clients').update(updatableFields).eq('id', id);
        if (retryError) {
          toast.error('Erro ao atualizar cliente: ' + retryError.message);
          return;
        }
        toast.warning('Cliente atualizado, mas o segundo telefone não foi guardado (coluna em falta na DB)');
      } else {
        toast.error('Erro ao atualizar cliente: ' + error.message); 
        return; 
      }
    } else {
      toast.success('Cliente atualizado');
    }
    
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
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
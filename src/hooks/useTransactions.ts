"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { toast } from 'sonner';

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = useCallback(async () => {
    // Removido o filtro .eq('user_id', userId)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    setTransactions((data || []).map(row => ({
      id: row.id,
      description: row.description,
      value: Number(row.value),
      type: row.type as any,
      destination: row.destination as any,
      category: row.category as any,
      projectId: row.project_id,
      clientId: row.client_id,
      date: new Date(row.date),
      createdAt: new Date(row.created_at)
    })));
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('transactions').insert({
      description: transaction.description,
      value: transaction.value,
      type: transaction.type,
      destination: transaction.destination,
      category: transaction.category,
      project_id: transaction.projectId,
      client_id: transaction.clientId,
      date: transaction.date.toISOString(),
      user_id: userId
    }).select().single();
    if (error) { toast.error('Erro ao adicionar transação'); return; }
    setTransactions(prev => [{
      ...data,
      projectId: data.project_id,
      clientId: data.client_id,
      date: new Date(data.date),
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Transação registada');
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const dbUpdates: any = { ...updates };
    if (updates.projectId) { dbUpdates.project_id = updates.projectId; delete dbUpdates.projectId; }
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.date) { dbUpdates.date = updates.date.toISOString(); delete dbUpdates.date; }

    const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar transação'); return; }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    toast.success('Transação atualizada');
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar transação'); return; }
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transação eliminada');
  };

  return { transactions, setTransactions, fetchTransactions, addTransaction, updateTransaction, deleteTransaction };
}
"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types';
import { toast } from 'sonner';

export function useInventory(userId: string | undefined) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const fetchInventory = useCallback(async () => {
    // Removido o filtro .eq('user_id', userId)
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching inventory:', error);
      return;
    }

    setInventory((data || []).map(row => ({
      id: row.id,
      name: row.name,
      category: row.category as any,
      quantity: Number(row.quantity),
      unit: row.unit,
      minStock: Number(row.min_stock),
      unitCost: Number(row.unit_cost),
      totalValue: Number(row.quantity) * Number(row.unit_cost),
      location: row.location || '',
      lastUpdated: new Date(row.updated_at),
      createdAt: new Date(row.created_at)
    })));
  }, []);

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated' | 'totalValue'>) => {
    if (!userId) return;
    const { data, error } = await supabase.from('inventory').insert({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_stock: item.minStock,
      unit_cost: item.unitCost,
      location: item.location,
      user_id: userId
    }).select().single();

    if (error) { toast.error(`Erro ao adicionar item: ${error.message}`); return; }

    if (data) {
      setInventory(prev => [...prev, {
        id: data.id,
        name: data.name,
        category: data.category as any,
        quantity: Number(data.quantity),
        unit: data.unit,
        minStock: Number(data.min_stock),
        unitCost: Number(data.unit_cost),
        totalValue: Number(data.quantity) * Number(data.unit_cost),
        location: data.location || '',
        lastUpdated: new Date(data.updated_at),
        createdAt: new Date(data.created_at)
      }]);
      toast.success('Item adicionado ao inventário');
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    const dbUpdates: any = { ...updates };
    if (updates.minStock !== undefined) { dbUpdates.min_stock = updates.minStock; delete dbUpdates.minStock; }
    if (updates.unitCost !== undefined) { dbUpdates.unit_cost = updates.unitCost; delete dbUpdates.unitCost; }

    const { error } = await supabase.from('inventory').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar item'); return; }
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        return { ...updated, totalValue: updated.quantity * updated.unitCost, lastUpdated: new Date() };
      }
      return item;
    }));
  };

  const deleteInventoryItem = async (id: string) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar item'); return; }
    setInventory(prev => prev.filter(i => i.id !== id));
    toast.success('Item eliminado do inventário');
  };

  return { inventory, setInventory, fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem };
}
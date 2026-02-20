"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Client, Project, Transaction, Task, ProjectWithDetails, 
  DashboardMetrics, MonthlyFlow, TaskStatus, ProjectStatus, 
  ProjectKPIs, Deal, DealStage, DealStageConfig, 
  CalendarEvent, CalendarEventType, ClientInteraction, InteractionType,
  InventoryItem, StockMovement, InventoryCategory
} from '@/types';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth, differenceInDays, isPast, isFuture, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// ... (dealStageConfig existente)

interface AppContextType {
  // ... (propriedades existentes)
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
  tasks: Task[];
  deals: Deal[];
  calendarEvents: CalendarEvent[];
  inventory: InventoryItem[];
  loading: boolean;
  
  // ... (métodos existentes)
  
  // Inventory operations
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated' | 'totalValue'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  adjustStock: (itemId: string, quantity: number, type: 'in' | 'out', reason: string) => Promise<void>;
  
  // ... (outros métodos)
  getDashboardMetrics: () => DashboardMetrics;
  getProjectKPIs: (projectId: string) => ProjectKPIs;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [projectHistories, setProjectHistories] = useState<Record<string, Project['history']>>({});
  const [loading, setLoading] = useState(true);

  // ==================== FETCH ALL DATA ====================
  useEffect(() => {
    if (!user) {
      // ... (reset states)
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Nota: Assumindo que as tabelas de inventário serão criadas no Supabase
        // Por agora, vamos carregar dados vazios ou mockados se a tabela não existir
        const [clientsRes, projectsRes, transactionsRes, tasksRes, dealsRes, eventsRes, historyRes, interactionsRes, inventoryRes] = await Promise.all([
          supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('deals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('calendar_events').select('*').eq('user_id', user.id).order('start_date', { ascending: true }),
          supabase.from('project_history').select('*').eq('user_id', user.id).order('date', { ascending: true }),
          supabase.from('client_interactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('inventory').select('*').eq('user_id', user.id).order('name', { ascending: true }),
        ]);

        // ... (mapeamento existente para clients, projects, etc.)

        // Map inventory
        setInventory((inventoryRes.data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          category: row.category as InventoryCategory,
          quantity: Number(row.quantity),
          unit: row.unit,
          minStock: Number(row.min_stock),
          unitCost: Number(row.unit_cost),
          totalValue: Number(row.quantity) * Number(row.unit_cost),
          location: row.location,
          lastUpdated: new Date(row.updated_at),
          createdAt: new Date(row.created_at),
        })));

        // (Resto do mapeamento existente...)
        setClients((clientsRes.data || []).map((row: any) => ({ /* ... */ }))); 
        // (Mantenha a lógica de mapeamento original aqui)
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  // ==================== INVENTORY OPERATIONS ====================
  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated' | 'totalValue'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('inventory').insert({
      user_id: user.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_stock: item.minStock,
      unit_cost: item.unitCost,
      location: item.location,
    }).select().single();

    if (error) { console.error('Error adding inventory item:', error); return; }
    if (data) {
      setInventory(prev => [...prev, {
        id: data.id,
        name: data.name,
        category: data.category as InventoryCategory,
        quantity: Number(data.quantity),
        unit: data.unit,
        minStock: Number(data.min_stock),
        unitCost: Number(data.unit_cost),
        totalValue: Number(data.quantity) * Number(data.unit_cost),
        location: data.location,
        lastUpdated: new Date(data.updated_at),
        createdAt: new Date(data.created_at),
      }]);
    }
  }, [user]);

  const updateInventoryItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;
    if (updates.unitCost !== undefined) dbUpdates.unit_cost = updates.unitCost;
    if (updates.location !== undefined) dbUpdates.location = updates.location;

    const { error } = await supabase.from('inventory').update(dbUpdates).eq('id', id);
    if (error) { console.error('Error updating inventory item:', error); return; }
    
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        return { ...updated, totalValue: updated.quantity * updated.unitCost, lastUpdated: new Date() };
      }
      return item;
    }));
  }, [user]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) { console.error('Error deleting inventory item:', error); return; }
    setInventory(prev => prev.filter(item => item.id !== id));
  }, [user]);

  const adjustStock = useCallback(async (itemId: string, amount: number, type: 'in' | 'out', reason: string) => {
    if (!user) return;
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = type === 'in' ? item.quantity + amount : item.quantity - amount;
    if (newQuantity < 0) return;

    const { error } = await supabase.from('inventory').update({ quantity: newQuantity }).eq('id', itemId);
    if (error) { console.error('Error adjusting stock:', error); return; }

    // Registar movimento (opcional, se houver tabela stock_movements)
    await supabase.from('stock_movements').insert({
      user_id: user.id,
      item_id: itemId,
      type,
      quantity: amount,
      reason,
    });

    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity, totalValue: newQuantity * i.unitCost, lastUpdated: new Date() } : i));
  }, [user, inventory]);

  // ... (resto do Provider e value)
  const value = useMemo(() => ({
    // ... (valores existentes)
    clients, projects, transactions, tasks, deals, calendarEvents, inventory, loading,
    addInventoryItem, updateInventoryItem, deleteInventoryItem, adjustStock,
    // ...
  }), [/* ... dependências */]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
// ...
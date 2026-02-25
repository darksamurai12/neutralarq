import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { PricingProduct, PricingLabor, PricingTransport, Budget, BudgetItem } from '@/types';

export function usePricingDB() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<PricingProduct[]>([]);
  const [labor, setLabor] = useState<PricingLabor[]>([]);
  const [transport, setTransport] = useState<PricingTransport[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateFinalPrice = (baseValue: number, marginPercent: number) => {
    return baseValue * (1 + marginPercent / 100);
  };

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('pricing_products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data.map(p => ({
      id: p.id, name: p.name, description: p.description || '', basePrice: Number(p.base_price),
      marginPercent: Number(p.margin_percent), finalPrice: Number(p.final_price), createdAt: new Date(p.created_at),
    })));
  }, []);

  const fetchLabor = useCallback(async () => {
    const { data, error } = await supabase.from('pricing_labor').select('*').order('created_at', { ascending: false });
    if (!error && data) setLabor(data.map(l => ({
      id: l.id, name: l.name, description: l.description || '', providerValue: Number(l.provider_value),
      marginPercent: Number(l.margin_percent), finalPrice: Number(l.final_price), createdAt: new Date(l.created_at),
    })));
  }, []);

  const fetchTransport = useCallback(async () => {
    const { data, error } = await supabase.from('pricing_transport').select('*').order('created_at', { ascending: false });
    if (!error && data) setTransport(data.map(t => ({
      id: t.id, name: t.name, description: t.description || '', baseCost: Number(t.base_cost),
      marginPercent: Number(t.margin_percent), finalPrice: Number(t.final_price), createdAt: new Date(t.created_at),
    })));
  }, []);

  const fetchBudgets = useCallback(async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*, budget_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar orçamentos:', error);
      return;
    }

    if (data) {
      const mappedBudgets: Budget[] = data.map((budget) => ({
        id: budget.id,
        name: budget.name,
        clientId: budget.client_id || null,
        clientName: budget.client_name,
        projectId: budget.project_id,
        status: budget.status as any,
        totalValue: Number(budget.total_value),
        totalCost: Number(budget.total_cost),
        totalProfit: Number(budget.total_profit),
        marginPercent: Number(budget.margin_percent),
        createdAt: new Date(budget.created_at),
        notes: budget.notes || '',
        items: (budget.budget_items || []).map((item: any) => ({
          id: item.id,
          type: item.type as any,
          itemId: item.item_id || '',
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
          unitCost: Number(item.unit_cost),
          totalCost: Number(item.total_cost),
          profit: Number(item.profit),
          marginPercent: Number(item.margin_percent || 0),
          groupName: item.group_name || undefined,
        })),
      }));
      setBudgets(mappedBudgets);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchProducts(), fetchLabor(), fetchTransport(), fetchBudgets()]).finally(() => setLoading(false));
    }
  }, [user, fetchProducts, fetchLabor, fetchTransport, fetchBudgets]);

  const addProduct = async (product: any) => {
    if (!user) return;
    const finalPrice = calculateFinalPrice(product.basePrice, product.marginPercent);
    const { error } = await supabase.from('pricing_products').insert({
      user_id: user.id, name: product.name, description: product.description,
      base_price: product.basePrice, margin_percent: product.marginPercent, final_price: finalPrice,
    });
    if (!error) { fetchProducts(); toast({ title: 'Sucesso', description: 'Produto adicionado' }); }
  };

  const updateProduct = async (id: string, updates: any) => {
    const basePrice = updates.basePrice !== undefined ? updates.basePrice : products.find(p => p.id === id)?.basePrice || 0;
    const marginPercent = updates.marginPercent !== undefined ? updates.marginPercent : products.find(p => p.id === id)?.marginPercent || 0;
    const finalPrice = calculateFinalPrice(basePrice, marginPercent);

    const { error } = await supabase.from('pricing_products').update({
      name: updates.name,
      description: updates.description,
      base_price: basePrice,
      margin_percent: marginPercent,
      final_price: finalPrice,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (!error) { fetchProducts(); toast({ title: 'Sucesso', description: 'Produto atualizado' }); }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('pricing_products').delete().eq('id', id);
    if (!error) { fetchProducts(); toast({ title: 'Sucesso', description: 'Produto eliminado' }); }
  };

  const addLabor = async (laborItem: any) => {
    if (!user) return;
    const finalPrice = calculateFinalPrice(laborItem.providerValue, laborItem.marginPercent);
    const { error } = await supabase.from('pricing_labor').insert({
      user_id: user.id, name: laborItem.name, description: laborItem.description,
      provider_value: laborItem.providerValue, margin_percent: laborItem.marginPercent, final_price: finalPrice,
    });
    if (!error) { fetchLabor(); toast({ title: 'Sucesso', description: 'Prestador adicionado' }); }
  };

  const updateLabor = async (id: string, updates: any) => {
    const providerValue = updates.providerValue !== undefined ? updates.providerValue : labor.find(l => l.id === id)?.providerValue || 0;
    const marginPercent = updates.marginPercent !== undefined ? updates.marginPercent : labor.find(l => l.id === id)?.marginPercent || 0;
    const finalPrice = calculateFinalPrice(providerValue, marginPercent);

    const { error } = await supabase.from('pricing_labor').update({
      name: updates.name,
      description: updates.description,
      provider_value: providerValue,
      margin_percent: marginPercent,
      final_price: finalPrice,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (!error) { fetchLabor(); toast({ title: 'Sucesso', description: 'Prestador atualizado' }); }
  };

  const deleteLabor = async (id: string) => {
    const { error } = await supabase.from('pricing_labor').delete().eq('id', id);
    if (!error) { fetchLabor(); toast({ title: 'Sucesso', description: 'Prestador eliminado' }); }
  };

  const addTransport = async (transportItem: any) => {
    if (!user) return;
    const finalPrice = calculateFinalPrice(transportItem.baseCost, transportItem.marginPercent);
    const { error } = await supabase.from('pricing_transport').insert({
      user_id: user.id, name: transportItem.name, description: transportItem.description,
      base_cost: transportItem.baseCost, margin_percent: transportItem.marginPercent, final_price: finalPrice,
    });
    if (!error) { fetchTransport(); toast({ title: 'Sucesso', description: 'Transporte adicionado' }); }
  };

  const updateTransport = async (id: string, updates: any) => {
    const baseCost = updates.baseCost !== undefined ? updates.baseCost : transport.find(t => t.id === id)?.baseCost || 0;
    const marginPercent = updates.marginPercent !== undefined ? updates.marginPercent : transport.find(t => t.id === id)?.marginPercent || 0;
    const finalPrice = calculateFinalPrice(baseCost, marginPercent);

    const { error } = await supabase.from('pricing_transport').update({
      name: updates.name,
      description: updates.description,
      base_cost: baseCost,
      margin_percent: marginPercent,
      final_price: finalPrice,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (!error) { fetchTransport(); toast({ title: 'Sucesso', description: 'Transporte atualizado' }); }
  };

  const deleteTransport = async (id: string) => {
    const { error } = await supabase.from('pricing_transport').delete().eq('id', id);
    if (!error) { fetchTransport(); toast({ title: 'Sucesso', description: 'Transporte eliminado' }); }
  };

  const createBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'totalValue' | 'totalCost' | 'totalProfit' | 'marginPercent'>) => {
    if (!user) return null;
    const totalValue = budget.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCost = budget.items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalProfit = totalValue - totalCost;
    const marginPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    
    const { data: bData, error: bError } = await supabase.from('budgets').insert({
      user_id: user.id, 
      name: budget.name, 
      client_name: budget.clientName || null,
      client_id: budget.clientId || null,
      project_id: budget.projectId || null,
      status: budget.status, 
      total_value: totalValue, 
      total_cost: totalCost,
      total_profit: totalProfit, 
      margin_percent: marginPercent,
      notes: budget.notes || null
    }).select().single();

    if (bError || !bData) {
      console.error('Erro ao criar orçamento:', bError);
      toast({ title: 'Erro', description: 'Não foi possível guardar o orçamento. Verifique a ligação.', variant: 'destructive' });
      return null;
    }

    const itemsToInsert = budget.items.map(item => ({
      budget_id: bData.id, 
      type: item.type, 
      item_id: item.itemId || null, 
      name: item.name,
      quantity: item.quantity, 
      unit_price: item.unitPrice, 
      total_price: item.totalPrice,
      unit_cost: item.unitCost, 
      total_cost: item.totalCost, 
      profit: item.profit, 
      group_name: item.groupName || null,
      margin_percent: item.marginPercent
    }));

    const { error: itemsError } = await supabase.from('budget_items').insert(itemsToInsert);
    
    if (itemsError) {
      console.error('Erro ao inserir itens do orçamento:', itemsError);
      toast({ title: 'Aviso', description: 'Orçamento criado, mas houve um erro ao salvar os itens.', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Orçamento criado com sucesso!' });
    }
    
    fetchBudgets();
    return { ...budget, id: bData.id, totalValue, totalCost, totalProfit, marginPercent, createdAt: new Date() } as any;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user) return;

    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

    if (updates.items) {
      const totalValue = updates.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalCost = updates.items.reduce((sum, item) => sum + item.totalCost, 0);
      const totalProfit = totalValue - totalCost;
      
      dbUpdates.total_value = totalValue;
      dbUpdates.total_cost = totalCost;
      dbUpdates.total_profit = totalProfit;
      dbUpdates.margin_percent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

      // Atualizar itens: remover antigos e inserir novos
      const { error: deleteError } = await supabase.from('budget_items').delete().eq('budget_id', id);
      if (deleteError) console.error('Erro ao limpar itens antigos:', deleteError);

      const itemsToInsert = updates.items.map(item => ({
        budget_id: id, 
        type: item.type, 
        item_id: item.itemId || null, 
        name: item.name,
        quantity: item.quantity, 
        unit_price: item.unitPrice, 
        total_price: item.totalPrice,
        unit_cost: item.unitCost, 
        total_cost: item.totalCost, 
        profit: item.profit, 
        group_name: item.groupName || null,
        margin_percent: item.marginPercent
      }));
      const { error: insertError } = await supabase.from('budget_items').insert(itemsToInsert);
      if (insertError) console.error('Erro ao inserir novos itens:', insertError);
    }

    const { error } = await supabase.from('budgets').update(dbUpdates).eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar orçamento:', error);
      toast({ title: 'Erro', description: 'Erro ao atualizar orçamento na base de dados.', variant: 'destructive' });
    } else {
      fetchBudgets();
      toast({ title: 'Sucesso', description: 'Orçamento atualizado' });
    }
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) { fetchBudgets(); toast({ title: 'Sucesso', description: 'Orçamento eliminado' }); }
    else console.error('Erro ao eliminar orçamento:', error);
  };

  return {
    loading, products, labor, transport, budgets,
    addProduct, updateProduct, deleteProduct,
    addLabor, updateLabor, deleteLabor,
    addTransport, updateTransport, deleteTransport,
    createBudget, updateBudget, deleteBudget,
    createBudgetItem: (type: any, itemId: string, quantity: number, customMargin?: number): BudgetItem | null => {
      let item: any;
      if (type === 'product') item = products.find(p => p.id === itemId);
      else if (type === 'labor') item = labor.find(l => l.id === itemId);
      else item = transport.find(t => t.id === itemId);
      
      if (!item) return null;
      
      const unitCost = item.basePrice || item.providerValue || item.baseCost;
      const margin = customMargin !== undefined ? customMargin : item.marginPercent;
      const unitPrice = unitCost * (1 + margin / 100);
      
      return {
        id: crypto.randomUUID(), 
        type, 
        itemId, 
        name: item.name, 
        quantity, 
        unitPrice,
        totalPrice: unitPrice * quantity, 
        unitCost, 
        totalCost: unitCost * quantity,
        profit: (unitPrice - unitCost) * quantity,
        marginPercent: margin,
      };
    },
    getPricingMetrics: () => ({ totalProducts: products.length, totalLabor: labor.length, totalTransport: transport.length, totalBudgets: budgets.length, approvedBudgets: budgets.filter(b => b.status === 'approved').length, totalBudgetValue: budgets.reduce((s, b) => s + b.totalValue, 0), totalProfit: budgets.reduce((s, b) => s + b.totalProfit, 0) }),
  };
}
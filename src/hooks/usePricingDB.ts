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
    // Removido o filtro .eq('user_id', user.id)
    const { data, error } = await supabase.from('pricing_products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data.map(p => ({
      id: p.id, name: p.name, description: p.description || '', basePrice: Number(p.base_price),
      marginPercent: Number(p.margin_percent), finalPrice: Number(p.final_price), createdAt: new Date(p.created_at),
    })));
  }, []);

  const fetchLabor = useCallback(async () => {
    // Removido o filtro .eq('user_id', user.id)
    const { data, error } = await supabase.from('pricing_labor').select('*').order('created_at', { ascending: false });
    if (!error && data) setLabor(data.map(l => ({
      id: l.id, name: l.name, description: l.description || '', providerValue: Number(l.provider_value),
      marginPercent: Number(l.margin_percent), finalPrice: Number(l.final_price), createdAt: new Date(l.created_at),
    })));
  }, []);

  const fetchTransport = useCallback(async () => {
    // Removido o filtro .eq('user_id', user.id)
    const { data, error } = await supabase.from('pricing_transport').select('*').order('created_at', { ascending: false });
    if (!error && data) setTransport(data.map(t => ({
      id: t.id, name: t.name, description: t.description || '', baseCost: Number(t.base_cost),
      marginPercent: Number(t.margin_percent), finalPrice: Number(t.final_price), createdAt: new Date(t.created_at),
    })));
  }, []);

  const fetchBudgets = useCallback(async () => {
    // Removido o filtro .eq('user_id', user.id)
    const { data: budgetsData, error: budgetsError } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });
    if (budgetsError) return;

    const budgetsWithItems = await Promise.all(
      budgetsData.map(async (budget) => {
        const { data: itemsData } = await supabase.from('budget_items').select('*').eq('budget_id', budget.id);
        const items: BudgetItem[] = (itemsData || []).map(item => ({
          id: item.id, type: item.type as any, itemId: item.item_id || '', name: item.name,
          quantity: Number(item.quantity), unitPrice: Number(item.unit_price), totalPrice: Number(item.total_price),
          unitCost: Number(item.unit_cost), totalCost: Number(item.total_cost), profit: Number(item.profit),
          groupName: item.group_name || undefined,
        }));

        return {
          id: budget.id, name: budget.name, clientId: budget.client_id, projectId: budget.project_id,
          items, status: budget.status as any, totalValue: Number(budget.total_value),
          totalCost: Number(budget.total_cost), totalProfit: Number(budget.total_profit),
          marginPercent: Number(budget.margin_percent), createdAt: new Date(budget.created_at),
        };
      })
    );
    setBudgets(budgetsWithItems);
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchProducts(), fetchLabor(), fetchTransport(), fetchBudgets()]).finally(() => setLoading(false));
    }
  }, [user, fetchProducts, fetchLabor, fetchTransport, fetchBudgets]);

  const addProduct = async (product: any) => {
    if (!user) return;
    const finalPrice = calculateFinalPrice(product.basePrice, product.margin_percent || product.marginPercent);
    const { error } = await supabase.from('pricing_products').insert({
      user_id: user.id, name: product.name, description: product.description,
      base_price: product.basePrice, margin_percent: product.marginPercent, final_price: finalPrice,
    });
    if (!error) { fetchProducts(); toast({ title: 'Sucesso', description: 'Produto adicionado' }); }
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

  const addTransport = async (transportItem: any) => {
    if (!user) return;
    const finalPrice = calculateFinalPrice(transportItem.baseCost, transportItem.marginPercent);
    const { error } = await supabase.from('pricing_transport').insert({
      user_id: user.id, name: transportItem.name, description: transportItem.description,
      base_cost: transportItem.baseCost, margin_percent: transportItem.marginPercent, final_price: finalPrice,
    });
    if (!error) { fetchTransport(); toast({ title: 'Sucesso', description: 'Transporte adicionado' }); }
  };

  const createBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'totalValue' | 'totalCost' | 'totalProfit' | 'marginPercent'>) => {
    if (!user) return null;
    const totalValue = budget.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCost = budget.items.reduce((sum, item) => sum + item.totalCost, 0);
    const { data: bData, error: bError } = await supabase.from('budgets').insert({
      user_id: user.id, name: budget.name, client_id: budget.clientId, project_id: budget.projectId,
      status: budget.status, total_value: totalValue, total_cost: totalCost,
      total_profit: totalValue - totalCost, margin_percent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    }).select().single();

    if (bError || !bData) return null;

    const itemsToInsert = budget.items.map(item => ({
      budget_id: bData.id, type: item.type, item_id: item.itemId || null, name: item.name,
      quantity: item.quantity, unit_price: item.unitPrice, total_price: item.totalPrice,
      unit_cost: item.unitCost, total_cost: item.totalCost, profit: item.profit, group_name: item.groupName || null,
    }));

    await supabase.from('budget_items').insert(itemsToInsert);
    fetchBudgets();
    toast({ title: 'Sucesso', description: 'Orçamento criado' });
    return { ...budget, id: bData.id, totalValue, totalCost, totalProfit: totalValue - totalCost, marginPercent: 0, createdAt: new Date() } as any;
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) { fetchBudgets(); toast({ title: 'Sucesso', description: 'Orçamento eliminado' }); }
  };

  return {
    loading, products, labor, transport, budgets,
    addProduct, updateProduct: async () => {}, deleteProduct: async () => {},
    addLabor, updateLabor: async () => {}, deleteLabor: async () => {},
    addTransport, updateTransport: async () => {}, deleteTransport: async () => {},
    createBudget, updateBudget: async () => {}, deleteBudget,
    createBudgetItem: (type: any, itemId: string, quantity: number): BudgetItem | null => {
      let item: any;
      if (type === 'product') item = products.find(p => p.id === itemId);
      else if (type === 'labor') item = labor.find(l => l.id === itemId);
      else item = transport.find(t => t.id === itemId);
      if (!item) return null;
      const unitCost = item.basePrice || item.providerValue || item.baseCost;
      return {
        id: crypto.randomUUID(), type, itemId, name: item.name, quantity, unitPrice: item.finalPrice,
        totalPrice: item.finalPrice * quantity, unitCost, totalCost: unitCost * quantity,
        profit: (item.finalPrice - unitCost) * quantity,
      };
    },
    getPricingMetrics: () => ({ totalProducts: products.length, totalLabor: labor.length, totalTransport: transport.length, totalBudgets: budgets.length, approvedBudgets: budgets.filter(b => b.status === 'approved').length, totalBudgetValue: budgets.reduce((s, b) => s + b.totalValue, 0), totalProfit: budgets.reduce((s, b) => s + b.totalProfit, 0) }),
  };
}
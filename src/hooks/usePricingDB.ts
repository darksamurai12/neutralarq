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

  // Calculate final price with margin
  const calculateFinalPrice = (baseValue: number, marginPercent: number) => {
    return baseValue * (1 + marginPercent / 100);
  };

  // Fetch all data
  const fetchProducts = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('pricing_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      basePrice: Number(p.base_price),
      marginPercent: Number(p.margin_percent),
      finalPrice: Number(p.final_price),
      createdAt: new Date(p.created_at),
    })));
  }, [user]);

  const fetchLabor = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('pricing_labor')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching labor:', error);
      return;
    }

    setLabor(data.map(l => ({
      id: l.id,
      name: l.name,
      description: l.description || '',
      providerValue: Number(l.provider_value),
      marginPercent: Number(l.margin_percent),
      finalPrice: Number(l.final_price),
      createdAt: new Date(l.created_at),
    })));
  }, [user]);

  const fetchTransport = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('pricing_transport')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transport:', error);
      return;
    }

    setTransport(data.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      baseCost: Number(t.base_cost),
      marginPercent: Number(t.margin_percent),
      finalPrice: Number(t.final_price),
      createdAt: new Date(t.created_at),
    })));
  }, [user]);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });

    if (budgetsError) {
      console.error('Error fetching budgets:', budgetsError);
      return;
    }

    // Fetch items for each budget
    const budgetsWithItems = await Promise.all(
      budgetsData.map(async (budget) => {
        const { data: itemsData } = await supabase
          .from('budget_items')
          .select('*')
          .eq('budget_id', budget.id);

        const items: BudgetItem[] = (itemsData || []).map(item => ({
          id: item.id,
          type: item.type as 'product' | 'labor' | 'transport',
          itemId: item.item_id || '',
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
          unitCost: Number(item.unit_cost),
          totalCost: Number(item.total_cost),
          profit: Number(item.profit),
        }));

        return {
          id: budget.id,
          name: budget.name,
          clientId: budget.client_name ? null : null,
          projectId: null,
          items,
          status: budget.status as Budget['status'],
          totalValue: Number(budget.total_value),
          totalCost: Number(budget.total_cost),
          totalProfit: Number(budget.total_profit),
          marginPercent: Number(budget.margin_percent),
          createdAt: new Date(budget.created_at),
        };
      })
    );

    setBudgets(budgetsWithItems);
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchProducts(), fetchLabor(), fetchTransport(), fetchBudgets()])
        .finally(() => setLoading(false));
    } else {
      setProducts([]);
      setLabor([]);
      setTransport([]);
      setBudgets([]);
      setLoading(false);
    }
  }, [user, fetchProducts, fetchLabor, fetchTransport, fetchBudgets]);

  // Product operations
  const addProduct = useCallback(async (product: Omit<PricingProduct, 'id' | 'createdAt' | 'finalPrice'>) => {
    if (!user) return;
    
    const finalPrice = calculateFinalPrice(product.basePrice, product.marginPercent);
    
    const { error } = await supabase
      .from('pricing_products')
      .insert({
        user_id: user.id,
        name: product.name,
        description: product.description,
        base_price: product.basePrice,
        margin_percent: product.marginPercent,
        final_price: finalPrice,
      });

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao adicionar produto', variant: 'destructive' });
      return;
    }

    await fetchProducts();
    toast({ title: 'Sucesso', description: 'Produto adicionado' });
  }, [user, fetchProducts, toast]);

  const updateProduct = useCallback(async (id: string, updates: Partial<PricingProduct>) => {
    if (!user) return;

    const current = products.find(p => p.id === id);
    if (!current) return;

    const basePrice = updates.basePrice ?? current.basePrice;
    const marginPercent = updates.marginPercent ?? current.marginPercent;
    const finalPrice = calculateFinalPrice(basePrice, marginPercent);
    
    const { error } = await supabase
      .from('pricing_products')
      .update({
        name: updates.name ?? current.name,
        description: updates.description ?? current.description,
        base_price: basePrice,
        margin_percent: marginPercent,
        final_price: finalPrice,
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar produto', variant: 'destructive' });
      return;
    }

    await fetchProducts();
    toast({ title: 'Sucesso', description: 'Produto atualizado' });
  }, [user, products, fetchProducts, toast]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('pricing_products')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao eliminar produto', variant: 'destructive' });
      return;
    }

    await fetchProducts();
    toast({ title: 'Sucesso', description: 'Produto eliminado' });
  }, [user, fetchProducts, toast]);

  // Labor operations
  const addLabor = useCallback(async (laborItem: Omit<PricingLabor, 'id' | 'createdAt' | 'finalPrice'>) => {
    if (!user) return;
    
    const finalPrice = calculateFinalPrice(laborItem.providerValue, laborItem.marginPercent);
    
    const { error } = await supabase
      .from('pricing_labor')
      .insert({
        user_id: user.id,
        name: laborItem.name,
        description: laborItem.description,
        provider_value: laborItem.providerValue,
        margin_percent: laborItem.marginPercent,
        final_price: finalPrice,
      });

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao adicionar prestador', variant: 'destructive' });
      return;
    }

    await fetchLabor();
    toast({ title: 'Sucesso', description: 'Prestador adicionado' });
  }, [user, fetchLabor, toast]);

  const updateLabor = useCallback(async (id: string, updates: Partial<PricingLabor>) => {
    if (!user) return;

    const current = labor.find(l => l.id === id);
    if (!current) return;

    const providerValue = updates.providerValue ?? current.providerValue;
    const marginPercent = updates.marginPercent ?? current.marginPercent;
    const finalPrice = calculateFinalPrice(providerValue, marginPercent);
    
    const { error } = await supabase
      .from('pricing_labor')
      .update({
        name: updates.name ?? current.name,
        description: updates.description ?? current.description,
        provider_value: providerValue,
        margin_percent: marginPercent,
        final_price: finalPrice,
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar prestador', variant: 'destructive' });
      return;
    }

    await fetchLabor();
    toast({ title: 'Sucesso', description: 'Prestador atualizado' });
  }, [user, labor, fetchLabor, toast]);

  const deleteLabor = useCallback(async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('pricing_labor')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao eliminar prestador', variant: 'destructive' });
      return;
    }

    await fetchLabor();
    toast({ title: 'Sucesso', description: 'Prestador eliminado' });
  }, [user, fetchLabor, toast]);

  // Transport operations
  const addTransport = useCallback(async (transportItem: Omit<PricingTransport, 'id' | 'createdAt' | 'finalPrice'>) => {
    if (!user) return;
    
    const finalPrice = calculateFinalPrice(transportItem.baseCost, transportItem.marginPercent);
    
    const { error } = await supabase
      .from('pricing_transport')
      .insert({
        user_id: user.id,
        name: transportItem.name,
        description: transportItem.description,
        base_cost: transportItem.baseCost,
        margin_percent: transportItem.marginPercent,
        final_price: finalPrice,
      });

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao adicionar transporte', variant: 'destructive' });
      return;
    }

    await fetchTransport();
    toast({ title: 'Sucesso', description: 'Transporte adicionado' });
  }, [user, fetchTransport, toast]);

  const updateTransport = useCallback(async (id: string, updates: Partial<PricingTransport>) => {
    if (!user) return;

    const current = transport.find(t => t.id === id);
    if (!current) return;

    const baseCost = updates.baseCost ?? current.baseCost;
    const marginPercent = updates.marginPercent ?? current.marginPercent;
    const finalPrice = calculateFinalPrice(baseCost, marginPercent);
    
    const { error } = await supabase
      .from('pricing_transport')
      .update({
        name: updates.name ?? current.name,
        description: updates.description ?? current.description,
        base_cost: baseCost,
        margin_percent: marginPercent,
        final_price: finalPrice,
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar transporte', variant: 'destructive' });
      return;
    }

    await fetchTransport();
    toast({ title: 'Sucesso', description: 'Transporte atualizado' });
  }, [user, transport, fetchTransport, toast]);

  const deleteTransport = useCallback(async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('pricing_transport')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao eliminar transporte', variant: 'destructive' });
      return;
    }

    await fetchTransport();
    toast({ title: 'Sucesso', description: 'Transporte eliminado' });
  }, [user, fetchTransport, toast]);

  // Budget operations
  const createBudget = useCallback(async (
    budget: Omit<Budget, 'id' | 'createdAt' | 'totalValue' | 'totalCost' | 'totalProfit' | 'marginPercent'>
  ): Promise<Budget | null> => {
    if (!user) return null;

    const totalValue = budget.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCost = budget.items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalProfit = totalValue - totalCost;
    const marginPercent = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;

    // Insert budget
    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        name: budget.name,
        client_name: null,
        status: budget.status,
        total_value: totalValue,
        total_cost: totalCost,
        total_profit: totalProfit,
        margin_percent: marginPercent,
      })
      .select()
      .single();

    if (budgetError || !budgetData) {
      toast({ title: 'Erro', description: 'Falha ao criar orçamento', variant: 'destructive' });
      return null;
    }

    // Insert budget items
    const itemsToInsert = budget.items.map(item => ({
      budget_id: budgetData.id,
      type: item.type,
      item_id: item.itemId || null,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      unit_cost: item.unitCost,
      total_cost: item.totalCost,
      profit: item.profit,
    }));

    const { error: itemsError } = await supabase
      .from('budget_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error inserting budget items:', itemsError);
    }

    await fetchBudgets();
    toast({ title: 'Sucesso', description: 'Orçamento criado' });

    return {
      ...budget,
      id: budgetData.id,
      totalValue,
      totalCost,
      totalProfit,
      marginPercent,
      createdAt: new Date(budgetData.created_at),
    };
  }, [user, fetchBudgets, toast]);

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    if (!user) return;

    const updateData: Record<string, unknown> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.status) updateData.status = updates.status;

    if (updates.items) {
      const totalValue = updates.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalCost = updates.items.reduce((sum, item) => sum + item.totalCost, 0);
      updateData.total_value = totalValue;
      updateData.total_cost = totalCost;
      updateData.total_profit = totalValue - totalCost;
      updateData.margin_percent = totalCost > 0 ? (((totalValue - totalCost) / totalCost) * 100) : 0;
    }

    const { error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar orçamento', variant: 'destructive' });
      return;
    }

    await fetchBudgets();
    toast({ title: 'Sucesso', description: 'Orçamento atualizado' });
  }, [user, fetchBudgets, toast]);

  const deleteBudget = useCallback(async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao eliminar orçamento', variant: 'destructive' });
      return;
    }

    await fetchBudgets();
    toast({ title: 'Sucesso', description: 'Orçamento eliminado' });
  }, [user, fetchBudgets, toast]);

  // Create budget item from pricing item
  const createBudgetItem = useCallback((
    type: 'product' | 'labor' | 'transport',
    itemId: string,
    quantity: number
  ): BudgetItem | null => {
    let item: PricingProduct | PricingLabor | PricingTransport | undefined;
    let unitCost: number;
    let unitPrice: number;

    if (type === 'product') {
      item = products.find(p => p.id === itemId);
      if (!item) return null;
      unitCost = (item as PricingProduct).basePrice;
      unitPrice = item.finalPrice;
    } else if (type === 'labor') {
      item = labor.find(l => l.id === itemId);
      if (!item) return null;
      unitCost = (item as PricingLabor).providerValue;
      unitPrice = item.finalPrice;
    } else {
      item = transport.find(t => t.id === itemId);
      if (!item) return null;
      unitCost = (item as PricingTransport).baseCost;
      unitPrice = item.finalPrice;
    }

    const totalPrice = unitPrice * quantity;
    const totalCost = unitCost * quantity;

    return {
      id: crypto.randomUUID(),
      type,
      itemId,
      name: item.name,
      quantity,
      unitPrice,
      totalPrice,
      unitCost,
      totalCost,
      profit: totalPrice - totalCost,
    };
  }, [products, labor, transport]);

  // Get summary metrics
  const getPricingMetrics = useCallback(() => {
    const totalProducts = products.length;
    const totalLabor = labor.length;
    const totalTransport = transport.length;
    const totalBudgets = budgets.length;
    const approvedBudgets = budgets.filter(b => b.status === 'approved').length;
    const totalBudgetValue = budgets.reduce((sum, b) => sum + b.totalValue, 0);
    const totalProfit = budgets.reduce((sum, b) => sum + b.totalProfit, 0);

    return {
      totalProducts,
      totalLabor,
      totalTransport,
      totalBudgets,
      approvedBudgets,
      totalBudgetValue,
      totalProfit,
    };
  }, [products, labor, transport, budgets]);

  return {
    // Loading state
    loading,
    // Data
    products,
    labor,
    transport,
    budgets,
    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
    // Labor operations
    addLabor,
    updateLabor,
    deleteLabor,
    // Transport operations
    addTransport,
    updateTransport,
    deleteTransport,
    // Budget operations
    createBudget,
    updateBudget,
    deleteBudget,
    createBudgetItem,
    // Metrics
    getPricingMetrics,
    // Refresh
    refresh: () => Promise.all([fetchProducts(), fetchLabor(), fetchTransport(), fetchBudgets()]),
  };
}

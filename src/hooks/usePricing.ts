import { useState, useEffect, useCallback } from 'react';
import { PricingProduct, PricingLabor, PricingTransport, Budget, BudgetItem } from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'pricing_products',
  LABOR: 'pricing_labor',
  TRANSPORT: 'pricing_transport',
  BUDGETS: 'pricing_budgets',
};

// Initial mock data
const initialProducts: PricingProduct[] = [
  { id: '1', name: 'Cimento Portland', description: 'Saco 50kg', basePrice: 2500, marginPercent: 15, finalPrice: 2875, createdAt: new Date() },
  { id: '2', name: 'Azulejo Cerâmico', description: 'Metro quadrado', basePrice: 4500, marginPercent: 20, finalPrice: 5400, createdAt: new Date() },
  { id: '3', name: 'Tinta Acrílica Premium', description: 'Lata 18L', basePrice: 18000, marginPercent: 25, finalPrice: 22500, createdAt: new Date() },
];

const initialLabor: PricingLabor[] = [
  { id: '1', name: 'Pedreiro Especializado', description: 'Diária', providerValue: 8000, marginPercent: 30, finalPrice: 10400, createdAt: new Date() },
  { id: '2', name: 'Electricista', description: 'Diária', providerValue: 12000, marginPercent: 25, finalPrice: 15000, createdAt: new Date() },
  { id: '3', name: 'Pintor Profissional', description: 'Diária', providerValue: 6500, marginPercent: 35, finalPrice: 8775, createdAt: new Date() },
];

const initialTransport: PricingTransport[] = [
  { id: '1', name: 'Frete Local', description: 'Até 20km', baseCost: 15000, marginPercent: 20, finalPrice: 18000, createdAt: new Date() },
  { id: '2', name: 'Frete Intermunicipal', description: 'Até 100km', baseCost: 45000, marginPercent: 25, finalPrice: 56250, createdAt: new Date() },
  { id: '3', name: 'Transporte de Equipamentos', description: 'Carga pesada', baseCost: 80000, marginPercent: 30, finalPrice: 104000, createdAt: new Date() },
];

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })) as T;
      }
      return parsed;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export function usePricing() {
  const [products, setProducts] = useState<PricingProduct[]>(() => 
    loadFromStorage(STORAGE_KEYS.PRODUCTS, initialProducts)
  );
  const [labor, setLabor] = useState<PricingLabor[]>(() => 
    loadFromStorage(STORAGE_KEYS.LABOR, initialLabor)
  );
  const [transport, setTransport] = useState<PricingTransport[]>(() => 
    loadFromStorage(STORAGE_KEYS.TRANSPORT, initialTransport)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() => 
    loadFromStorage(STORAGE_KEYS.BUDGETS, [])
  );

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LABOR, labor);
  }, [labor]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRANSPORT, transport);
  }, [transport]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BUDGETS, budgets);
  }, [budgets]);

  // Calculate final price with margin
  const calculateFinalPrice = (baseValue: number, marginPercent: number) => {
    return baseValue * (1 + marginPercent / 100);
  };

  // Product operations
  const addProduct = useCallback((product: Omit<PricingProduct, 'id' | 'createdAt' | 'finalPrice'>) => {
    const finalPrice = calculateFinalPrice(product.basePrice, product.marginPercent);
    const newProduct: PricingProduct = {
      ...product,
      id: crypto.randomUUID(),
      finalPrice,
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<PricingProduct>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        if (updates.basePrice !== undefined || updates.marginPercent !== undefined) {
          updated.finalPrice = calculateFinalPrice(
            updates.basePrice ?? p.basePrice,
            updates.marginPercent ?? p.marginPercent
          );
        }
        return updated;
      }
      return p;
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Labor operations
  const addLabor = useCallback((laborItem: Omit<PricingLabor, 'id' | 'createdAt' | 'finalPrice'>) => {
    const finalPrice = calculateFinalPrice(laborItem.providerValue, laborItem.marginPercent);
    const newLabor: PricingLabor = {
      ...laborItem,
      id: crypto.randomUUID(),
      finalPrice,
      createdAt: new Date(),
    };
    setLabor(prev => [...prev, newLabor]);
  }, []);

  const updateLabor = useCallback((id: string, updates: Partial<PricingLabor>) => {
    setLabor(prev => prev.map(l => {
      if (l.id === id) {
        const updated = { ...l, ...updates };
        if (updates.providerValue !== undefined || updates.marginPercent !== undefined) {
          updated.finalPrice = calculateFinalPrice(
            updates.providerValue ?? l.providerValue,
            updates.marginPercent ?? l.marginPercent
          );
        }
        return updated;
      }
      return l;
    }));
  }, []);

  const deleteLabor = useCallback((id: string) => {
    setLabor(prev => prev.filter(l => l.id !== id));
  }, []);

  // Transport operations
  const addTransport = useCallback((transportItem: Omit<PricingTransport, 'id' | 'createdAt' | 'finalPrice'>) => {
    const finalPrice = calculateFinalPrice(transportItem.baseCost, transportItem.marginPercent);
    const newTransport: PricingTransport = {
      ...transportItem,
      id: crypto.randomUUID(),
      finalPrice,
      createdAt: new Date(),
    };
    setTransport(prev => [...prev, newTransport]);
  }, []);

  const updateTransport = useCallback((id: string, updates: Partial<PricingTransport>) => {
    setTransport(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        if (updates.baseCost !== undefined || updates.marginPercent !== undefined) {
          updated.finalPrice = calculateFinalPrice(
            updates.baseCost ?? t.baseCost,
            updates.marginPercent ?? t.marginPercent
          );
        }
        return updated;
      }
      return t;
    }));
  }, []);

  const deleteTransport = useCallback((id: string) => {
    setTransport(prev => prev.filter(t => t.id !== id));
  }, []);

  // Budget operations
  const createBudget = useCallback((budget: Omit<Budget, 'id' | 'createdAt' | 'totalValue' | 'totalCost' | 'totalProfit' | 'marginPercent'>) => {
    const totalValue = budget.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCost = budget.items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalProfit = totalValue - totalCost;
    const marginPercent = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;

    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      totalValue,
      totalCost,
      totalProfit,
      marginPercent,
      createdAt: new Date(),
    };
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => {
      if (b.id === id) {
        const updated = { ...b, ...updates };
        if (updates.items) {
          updated.totalValue = updates.items.reduce((sum, item) => sum + item.totalPrice, 0);
          updated.totalCost = updates.items.reduce((sum, item) => sum + item.totalCost, 0);
          updated.totalProfit = updated.totalValue - updated.totalCost;
          updated.marginPercent = updated.totalCost > 0 ? ((updated.totalProfit / updated.totalCost) * 100) : 0;
        }
        return updated;
      }
      return b;
    }));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

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
  };
}

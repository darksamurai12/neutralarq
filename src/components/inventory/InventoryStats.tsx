"use client";

import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { InventoryItem } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface InventoryStatsProps {
  items: InventoryItem[];
}

export function InventoryStats({ items }: InventoryStatsProps) {
  const totalItems = items.length;
  const lowStockItems = items.filter(i => i.quantity <= i.minStock).length;
  const totalValue = items.reduce((sum, i) => sum + i.totalValue, 0);
  const categoriesCount = new Set(items.map(i => i.category)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Total de Itens</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{totalItems}</p>
        <p className="text-[10px] text-muted-foreground mt-2">{categoriesCount} categorias</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-rose transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Stock Baixo</p>
        <p className="text-xl font-bold text-rose-600 tracking-tight">{lowStockItems}</p>
        <p className="text-[10px] text-rose-500 mt-2">Necessitam reposição</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Valor em Stock</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(totalValue)}</p>
        <p className="text-[10px] text-muted-foreground mt-2">Capital imobilizado</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Movimentações</p>
        <p className="text-xl font-bold text-foreground tracking-tight">--</p>
        <p className="text-[10px] text-muted-foreground mt-2">Últimos 30 dias</p>
      </div>
    </div>
  );
}
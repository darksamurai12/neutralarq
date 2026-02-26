"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Package, 
  Users, 
  Truck, 
  Plus, 
  X, 
  Check,
  ArrowRight,
  Filter
} from 'lucide-react';
import { PricingProduct, PricingLabor, PricingTransport, BudgetItem, PricingItemType } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface ItemSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: PricingProduct[];
  labor: PricingLabor[];
  transport: PricingTransport[];
  groups: string[];
  selectedGroup: string;
  onConfirm: (item: BudgetItem) => void;
  createBudgetItem: (type: PricingItemType, itemId: string, quantity: number, customMargin?: number) => BudgetItem | null;
}

export function ItemSelectionDialog({
  open,
  onOpenChange,
  products,
  labor,
  transport,
  groups,
  selectedGroup,
  onConfirm,
  createBudgetItem
}: ItemSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<PricingItemType | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [customMargin, setCustomMargin] = useState('');

  // Unificar todos os itens para a listagem
  const allItems = useMemo(() => {
    const p = products.map(i => ({ ...i, type: 'product' as const, category: 'Produto' }));
    const l = labor.map(i => ({ ...i, type: 'labor' as const, category: 'Mão de Obra', basePrice: i.providerValue }));
    const t = transport.map(i => ({ ...i, type: 'transport' as const, category: 'Transporte', basePrice: i.baseCost }));
    return [...p, ...l, ...t];
  }, [products, labor, transport]);

  // Filtragem em tempo real
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesType = activeType === 'all' || item.type === activeType;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));
      
      return matchesType && matchesSearch;
    });
  }, [allItems, searchQuery, activeType]);

  // Resetar estados ao abrir
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedId(null);
      setQuantity('1');
      setCustomMargin('');
    }
  }, [open]);

  const handleSelectItem = (item: any) => {
    setSelectedId(item.id);
    setCustomMargin(item.marginPercent.toString());
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    const item = allItems.find(i => i.id === selectedId);
    if (!item) return;

    const margin = customMargin ? parseFloat(customMargin) : undefined;
    const newItem = createBudgetItem(item.type, item.id, parseInt(quantity), margin);
    
    if (newItem) {
      newItem.groupName = selectedGroup || undefined;
      onConfirm(newItem);
      onOpenChange(false);
    }
  };

  const selectedItemData = allItems.find(i => i.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-slate-800">Seleccionar Item</DialogTitle>
          <p className="text-sm text-muted-foreground">Pesquise e seleccione produtos ou serviços para o orçamento.</p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 flex-1 flex flex-col min-h-0">
          {/* Barra de Pesquisa e Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Pesquisar por nome, código ou categoria..."
                className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <Button 
                variant={activeType === 'all' ? 'secondary' : 'ghost'} 
                size="sm" 
                className={cn("h-9 rounded-lg text-xs font-bold", activeType === 'all' && "bg-white shadow-sm")}
                onClick={() => setActiveType('all')}
              >
                Todos
              </Button>
              <Button 
                variant={activeType === 'product' ? 'secondary' : 'ghost'} 
                size="sm" 
                className={cn("h-9 rounded-lg text-xs font-bold", activeType === 'product' && "bg-white shadow-sm")}
                onClick={() => setActiveType('product')}
              >
                <Package className="w-3 h-3 mr-1" /> Produtos
              </Button>
              <Button 
                variant={activeType === 'labor' ? 'secondary' : 'ghost'} 
                size="sm" 
                className={cn("h-9 rounded-lg text-xs font-bold", activeType === 'labor' && "bg-white shadow-sm")}
                onClick={() => setActiveType('labor')}
              >
                <Users className="w-3 h-3 mr-1" /> Mão de Obra
              </Button>
              <Button 
                variant={activeType === 'transport' ? 'secondary' : 'ghost'} 
                size="sm" 
                className={cn("h-9 rounded-lg text-xs font-bold", activeType === 'transport' && "bg-white shadow-sm")}
                onClick={() => setActiveType('transport')}
              >
                <Truck className="w-3 h-3 mr-1" /> Transporte
              </Button>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div className="border rounded-2xl overflow-hidden flex-1 flex flex-col bg-white">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead>Nome do Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço Base</TableHead>
                  <TableHead className="text-right">Preço Final</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="flex-1">
              <Table>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Filter className="w-10 h-10 mb-2 opacity-20" />
                          <p>Nenhum item encontrado com estes critérios.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className={cn(
                          "cursor-pointer transition-colors group",
                          selectedId === item.id ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50"
                        )}
                        onClick={() => handleSelectItem(item)}
                        onDoubleClick={handleConfirm}
                      >
                        <TableCell className="font-mono text-[10px] text-slate-400">
                          #{item.id.slice(0, 6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                              {item.description || 'Sem descrição'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-medium bg-white">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-500 text-xs">
                          {formatCurrency(item.basePrice)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(item.finalPrice)}
                        </TableCell>
                        <TableCell>
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                            selectedId === item.id 
                              ? "bg-primary border-primary text-white" 
                              : "border-slate-200 group-hover:border-primary/50"
                          )}>
                            {selectedId === item.id && <Check className="w-3 h-3" />}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        {/* Rodapé com Configurações de Quantidade e Margem */}
        <div className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Quantidade</Label>
              <Input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                className="h-10 w-24 rounded-xl bg-white font-bold text-center"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Margem (%)</Label>
              <Input 
                type="number" 
                step="0.1" 
                value={customMargin} 
                onChange={(e) => setCustomMargin(e.target.value)}
                className="h-10 w-24 rounded-xl bg-white font-bold text-center"
              />
            </div>
            {selectedItemData && (
              <div className="hidden md:block pl-4 border-l border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Estimado</p>
                <p className="text-lg font-black text-primary">
                  {formatCurrency(
                    (selectedItemData.basePrice * (1 + (parseFloat(customMargin) || 0) / 100)) * (parseInt(quantity) || 0)
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-11 rounded-xl px-6">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedId} 
              className="h-11 rounded-xl px-8 gap-2 shadow-lg shadow-primary/20"
            >
              Confirmar Selecção <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
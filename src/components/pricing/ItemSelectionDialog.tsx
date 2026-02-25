"use client";

import { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Users, Truck, Percent, Plus } from 'lucide-react';
import { PricingProduct, PricingLabor, PricingTransport, BudgetItem, PricingItemType } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent } from '@/components/ui/card';

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
  const [type, setType] = useState<PricingItemType>('product');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [margin, setMargin] = useState('');
  const [group, setGroup] = useState(selectedGroup);

  useEffect(() => {
    if (open) {
      setGroup(selectedGroup);
      setItemId('');
      setQuantity('1');
      setMargin('');
    }
  }, [open, selectedGroup]);

  useEffect(() => {
    if (itemId) {
      let item: any;
      if (type === 'product') item = products.find(p => p.id === itemId);
      else if (type === 'labor') item = labor.find(l => l.id === itemId);
      else item = transport.find(t => t.id === itemId);
      
      if (item) {
        setMargin(item.marginPercent.toString());
      }
    }
  }, [itemId, type, products, labor, transport]);

  const handleConfirm = () => {
    if (!itemId || !quantity) return;
    const customMargin = margin ? parseFloat(margin) : undefined;
    const newItem = createBudgetItem(type, itemId, parseInt(quantity), customMargin);
    if (newItem) {
      newItem.groupName = group || undefined;
      onConfirm(newItem);
      onOpenChange(false);
    }
  };

  const getAvailableItems = () => {
    switch (type) {
      case 'product': return products;
      case 'labor': return labor;
      case 'transport': return transport;
    }
  };

  const selectedItemData = getAvailableItems().find(i => i.id === itemId);
  const unitCost = selectedItemData ? ('basePrice' in selectedItemData ? selectedItemData.basePrice : 'providerValue' in selectedItemData ? selectedItemData.providerValue : selectedItemData.baseCost) : 0;
  const currentMargin = margin ? parseFloat(margin) : 0;
  const unitPrice = unitCost * (1 + currentMargin / 100);
  const totalPrice = unitPrice * (parseInt(quantity) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Orçamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Tipo de Item</Label>
            <Select value={type} onValueChange={(v: any) => { setType(v); setItemId(''); }}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">
                  <div className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /> Produto</div>
                </SelectItem>
                <SelectItem value="labor">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-500" /> Mão de Obra</div>
                </SelectItem>
                <SelectItem value="transport">
                  <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-cyan-500" /> Transporte</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Seleccionar Item</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Escolha um item..." />
              </SelectTrigger>
              <SelectContent>
                {getAvailableItems().map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({formatCurrency('finalPrice' in item ? item.finalPrice : 0)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Margem (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  step="0.1" 
                  value={margin} 
                  onChange={(e) => setMargin(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Grupo (Opcional)</Label>
            <Select value={group || 'none'} onValueChange={(v) => setGroup(v === 'none' ? '' : v)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Sem grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem grupo</SelectItem>
                {groups.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {itemId && (
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço Unitário:</span>
                  <span className="font-bold">{formatCurrency(unitPrice)}</span>
                </div>
                <div className="flex justify-between text-base border-t border-primary/10 pt-2">
                  <span className="font-semibold">Total do Item:</span>
                  <span className="font-bold text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-xl px-6">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!itemId} className="h-11 rounded-xl px-8 gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
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
import { InventoryItem, InventoryCategory } from '@/types';

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: InventoryItem | null;
  onSubmit: (data: any) => void;
}

const emptyFormData = {
  name: '',
  category: 'material' as InventoryCategory,
  quantity: '0',
  unit: 'un',
  minStock: '5',
  unitCost: '0',
  location: '',
};

export function InventoryFormDialog({ open, onOpenChange, editingItem, onSubmit }: InventoryFormDialogProps) {
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity.toString(),
        unit: editingItem.unit,
        minStock: editingItem.minStock.toString(),
        unitCost: editingItem.unitCost.toString(),
        location: editingItem.location || '',
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [editingItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseFloat(formData.quantity),
      minStock: parseFloat(formData.minStock),
      unitCost: parseFloat(formData.unitCost),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item no Inventário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Item *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Cimento Portland, Berbequim, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value: InventoryCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="ferramenta">Ferramenta</SelectItem>
                  <SelectItem value="consumivel">Consumível</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade (kg, m, un, etc.)</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="un"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade Inicial</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                step="0.01"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCost">Custo Unitário (AOA)</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização / Armazém</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Armazém A, Prateleira 2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingItem ? 'Guardar Alterações' : 'Adicionar ao Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
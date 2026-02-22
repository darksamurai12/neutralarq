"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { Package, Plus, Search, MoreHorizontal, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InventoryStats } from '@/components/inventory/InventoryStats';
import { InventoryFormDialog } from '@/components/inventory/InventoryFormDialog';
import { InventoryItem, InventoryCategory } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

const categoryLabels: Record<InventoryCategory, string> = {
  material: 'Material',
  ferramenta: 'Ferramenta',
  consumivel: 'Consumível',
  outro: 'Outro',
};

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, adjustStock } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleFormSubmit = (data: any) => {
    if (editingItem) {
      updateInventoryItem(editingItem.id, data);
    } else {
      addInventoryItem(data);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Inventário"
        description="Gestão de stock, materiais e ferramentas"
        icon={Package}
      >
        <Button 
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
        >
          <Plus className="w-4 h-4" />
          Novo Item
        </Button>
      </PageHeader>

      <InventoryStats items={inventory} />

      <Card className="shadow-card border-border/50 rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar itens..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="ferramenta">Ferramenta</SelectItem>
                  <SelectItem value="consumivel">Consumível</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold">Item</TableHead>
                <TableHead className="font-bold">Categoria</TableHead>
                <TableHead className="font-bold text-center">Stock</TableHead>
                <TableHead className="font-bold text-right">Custo Unit.</TableHead>
                <TableHead className="font-bold text-right">Valor Total</TableHead>
                <TableHead className="font-bold">Localização</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhum item encontrado no inventário.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-700">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ID: {item.id.slice(0, 8)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg font-medium">
                        {categoryLabels[item.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "font-bold",
                          item.quantity <= item.minStock ? "text-rose-600" : "text-slate-700"
                        )}>
                          {item.quantity} {item.unit}
                        </span>
                        {item.quantity <= item.minStock && (
                          <span className="text-[10px] text-rose-500 font-medium">Stock Baixo</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-600">
                      {formatCurrency(item.unitCost)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(item.totalValue)}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {item.location || '---'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => adjustStock(item.id, 1, 'in', 'Entrada manual')}>
                            <ArrowUpRight className="w-4 h-4 mr-2 text-emerald-500" />
                            Entrada (+1)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => adjustStock(item.id, 1, 'out', 'Saída manual')}>
                            <ArrowDownRight className="w-4 h-4 mr-2 text-rose-500" />
                            Saída (-1)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteInventoryItem(item.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InventoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingItem={editingItem}
        onSubmit={handleFormSubmit}
      />
    </AppLayout>
  );
}
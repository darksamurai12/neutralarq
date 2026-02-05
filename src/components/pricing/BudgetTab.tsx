import { useState } from 'react';
import { Plus, Trash2, FileText, DollarSign, TrendingUp, Eye, ChevronDown, ChevronUp, Package, Users, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Budget, BudgetItem, PricingProduct, PricingLabor, PricingTransport, Client, Project } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface BudgetTabProps {
  budgets: Budget[];
  products: PricingProduct[];
  labor: PricingLabor[];
  transport: PricingTransport[];
  clients: Client[];
  projects: Project[];
  onCreateBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'totalValue' | 'totalCost' | 'totalProfit' | 'marginPercent'>) => Budget | Promise<Budget | null>;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
  onDeleteBudget: (id: string) => void;
  createBudgetItem: (type: 'product' | 'labor' | 'transport', itemId: string, quantity: number) => BudgetItem | null;
}

export function BudgetTab({
  budgets,
  products,
  labor,
  transport,
  clients,
  projects,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
  createBudgetItem,
}: BudgetTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedBudget, setExpandedBudget] = useState<string | null>(null);
  const [budgetName, setBudgetName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  
  // Item selection state
  const [selectedItemType, setSelectedItemType] = useState<'product' | 'labor' | 'transport'>('product');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');

  const resetForm = () => {
    setBudgetName('');
    setSelectedClientId('');
    setSelectedProjectId('');
    setBudgetItems([]);
    setSelectedItemType('product');
    setSelectedItemId('');
    setItemQuantity('1');
    setIsDialogOpen(false);
  };

  const addItemToBudget = () => {
    if (!selectedItemId || !itemQuantity) return;
    
    const newItem = createBudgetItem(selectedItemType, selectedItemId, parseInt(itemQuantity));
    if (newItem) {
      setBudgetItems(prev => [...prev, newItem]);
      setSelectedItemId('');
      setItemQuantity('1');
    }
  };

  const removeItemFromBudget = (itemId: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCreateBudget = () => {
    if (!budgetName || budgetItems.length === 0) return;

    onCreateBudget({
      name: budgetName,
      clientId: selectedClientId || null,
      projectId: selectedProjectId || null,
      items: budgetItems,
      status: 'draft',
    });
    resetForm();
  };

  const getAvailableItems = () => {
    switch (selectedItemType) {
      case 'product':
        return products.map(p => ({ id: p.id, name: p.name, description: p.description, price: p.finalPrice }));
      case 'labor':
        return labor.map(l => ({ id: l.id, name: l.name, description: l.description, price: l.finalPrice }));
      case 'transport':
        return transport.map(t => ({ id: t.id, name: t.name, description: t.description, price: t.finalPrice }));
    }
  };

  const currentTotalValue = budgetItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const currentTotalCost = budgetItems.reduce((sum, item) => sum + item.totalCost, 0);
  const currentTotalProfit = currentTotalValue - currentTotalCost;

  // Summary metrics
  const totalBudgetsValue = budgets.reduce((sum, b) => sum + b.totalValue, 0);
  const totalProfit = budgets.reduce((sum, b) => sum + b.totalProfit, 0);
  const approvedBudgets = budgets.filter(b => b.status === 'approved').length;

  const getStatusBadge = (status: Budget['status']) => {
    const config = {
      draft: { label: 'Rascunho', className: 'bg-slate-100 text-slate-700' },
      sent: { label: 'Enviado', className: 'bg-blue-100 text-blue-700' },
      approved: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700' },
      rejected: { label: 'Rejeitado', className: 'bg-rose-100 text-rose-700' },
    };
    return config[status];
  };

  const getItemIcon = (type: BudgetItem['type']) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4 text-blue-500" />;
      case 'labor': return <Users className="w-4 h-4 text-amber-500" />;
      case 'transport': return <Truck className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Orçamentos</p>
                <p className="text-2xl font-bold">{budgets.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Aprovados</p>
                <p className="text-2xl font-bold">{approvedBudgets}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudgetsValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Lucro Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Orçamentos</h3>
          <p className="text-sm text-muted-foreground">Crie orçamentos completos selecionando produtos, mão de obra e transporte</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Orçamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Budget Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetName">Nome do Orçamento</Label>
                  <Input
                    id="budgetName"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    placeholder="Ex: Orçamento Obra Talatona"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cliente (opcional)</Label>
                  <Select value={selectedClientId || 'none'} onValueChange={(v) => setSelectedClientId(v === 'none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Projecto (opcional)</Label>
                  <Select value={selectedProjectId || 'none'} onValueChange={(v) => setSelectedProjectId(v === 'none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Items Section */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Adicionar Itens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Select value={selectedItemType} onValueChange={(v: any) => { setSelectedItemType(v); setSelectedItemId(''); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Produto</SelectItem>
                        <SelectItem value="labor">Mão de Obra</SelectItem>
                        <SelectItem value="transport">Transporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedItemId || 'none'} onValueChange={(v) => setSelectedItemId(v === 'none' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Selecione...</SelectItem>
                        {getAvailableItems().map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - {formatCurrency(item.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      placeholder="Qtd"
                    />
                    <Button onClick={addItemToBudget} disabled={!selectedItemId}>
                      <Plus className="w-4 h-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Items List */}
              {budgetItems.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Itens do Orçamento</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Qtd</TableHead>
                          <TableHead className="text-right">Preço Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right text-emerald-600">Lucro</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {budgetItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getItemIcon(item.type)}
                                <span>{item.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                            <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(item.profit)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => removeItemFromBudget(item.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              {budgetItems.length > 0 && (
                <Card className="bg-gradient-to-r from-slate-50 to-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Total Cliente</p>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(currentTotalValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Custo Total</p>
                        <p className="text-xl font-bold text-slate-600">{formatCurrency(currentTotalCost)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lucro Empresa</p>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(currentTotalProfit)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={handleCreateBudget} disabled={!budgetName || budgetItems.length === 0}>
                  Criar Orçamento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budgets List */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum orçamento criado. Clique em "Novo Orçamento" para começar.
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const client = clients.find(c => c.id === budget.clientId);
            const project = projects.find(p => p.id === budget.projectId);
            const isExpanded = expandedBudget === budget.id;
            const statusConfig = getStatusBadge(budget.status);

            return (
              <Collapsible key={budget.id} open={isExpanded} onOpenChange={() => setExpandedBudget(isExpanded ? null : budget.id)}>
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{budget.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client?.name || 'Sem cliente'} • {format(new Date(budget.createdAt), "dd MMM yyyy", { locale: pt })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{formatCurrency(budget.totalValue)}</p>
                          <p className="text-sm text-emerald-600">Lucro: {formatCurrency(budget.totalProfit)}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-4 pb-4">
                      {/* Items Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-center">Tipo</TableHead>
                            <TableHead className="text-center">Qtd</TableHead>
                            <TableHead className="text-right">Custo Unit.</TableHead>
                            <TableHead className="text-right">Preço Unit.</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right text-emerald-600">Lucro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {budget.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">{getItemIcon(item.type)}</div>
                              </TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right text-muted-foreground">{formatCurrency(item.unitCost)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                              <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(item.profit)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Budget Summary */}
                      <Card className="mt-4 bg-gradient-to-r from-slate-50 to-emerald-50 border-emerald-200">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Custo Total</p>
                              <p className="text-lg font-bold text-slate-600">{formatCurrency(budget.totalCost)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Valor Cliente</p>
                              <p className="text-lg font-bold text-blue-600">{formatCurrency(budget.totalValue)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Lucro Empresa</p>
                              <p className="text-lg font-bold text-emerald-600">{formatCurrency(budget.totalProfit)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Margem</p>
                              <p className="text-lg font-bold text-violet-600">{budget.marginPercent.toFixed(1)}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <div className="flex justify-between items-center mt-4">
                        <Select 
                          value={budget.status} 
                          onValueChange={(v: Budget['status']) => onUpdateBudget(budget.id, { status: v })}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="sent">Enviado</SelectItem>
                            <SelectItem value="approved">Aprovado</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="destructive" size="sm" onClick={() => onDeleteBudget(budget.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}

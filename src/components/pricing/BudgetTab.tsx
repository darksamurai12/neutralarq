import { useState } from 'react';
import { Plus, Trash2, FileText, DollarSign, TrendingUp, ChevronDown, ChevronUp, Package, Users, Truck, Edit, Copy, Download, Banknote, PercentCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Budget, BudgetItem, PricingProduct, PricingLabor, PricingTransport, Client, Project } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [expandedBudget, setExpandedBudget] = useState<string | null>(null);
  const [budgetName, setBudgetName] = useState('');
  const [budgetNotes, setBudgetNotes] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  
  const [selectedItemType, setSelectedItemType] = useState<'product' | 'labor' | 'transport'>('product');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');

  const resetForm = () => {
    setBudgetName('');
    setBudgetNotes('');
    setSelectedClientId('');
    setSelectedProjectId('');
    setBudgetItems([]);
    setSelectedItemType('product');
    setSelectedItemId('');
    setItemQuantity('1');
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingBudgetId(null);
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

  const handleCreateOrUpdateBudget = () => {
    if (!budgetName || budgetItems.length === 0) return;

    if (isEditMode && editingBudgetId) {
      onUpdateBudget(editingBudgetId, {
        name: budgetName,
        items: budgetItems,
      });
    } else {
      onCreateBudget({
        name: budgetName,
        clientId: selectedClientId || null,
        projectId: selectedProjectId || null,
        items: budgetItems,
        status: 'draft',
      });
    }
    resetForm();
  };

  const handleEditBudget = (budget: Budget) => {
    setIsEditMode(true);
    setEditingBudgetId(budget.id);
    setBudgetName(budget.name);
    setBudgetItems([...budget.items]);
    setSelectedClientId(budget.clientId || '');
    setSelectedProjectId(budget.projectId || '');
    setIsDialogOpen(true);
  };

  const handleCloneBudget = (budget: Budget) => {
    setIsEditMode(false);
    setEditingBudgetId(null);
    setBudgetName(`${budget.name} (Cópia)`);
    setBudgetItems(budget.items.map(item => ({ ...item, id: crypto.randomUUID() })));
    setSelectedClientId(budget.clientId || '');
    setSelectedProjectId(budget.projectId || '');
    setIsDialogOpen(true);
    toast.success('Orçamento clonado — edite e guarde.');
  };

  const handleExportPDF = (budget: Budget) => {
    const doc = new jsPDF();
    const client = clients.find(c => c.id === budget.clientId);
    const project = projects.find(p => p.id === budget.projectId);

    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    doc.text('ORÇAMENTO', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(`Nº: ${budget.id.slice(0, 8).toUpperCase()}`, 14, 30);
    doc.text(`Data: ${format(new Date(budget.createdAt), "dd/MM/yyyy", { locale: pt })}`, 14, 36);

    const statusLabels: Record<string, string> = { draft: 'Rascunho', sent: 'Enviado', approved: 'Aprovado', rejected: 'Rejeitado' };
    doc.text(`Estado: ${statusLabels[budget.status] || budget.status}`, 14, 42);

    // Budget info
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    doc.text(budget.name, 14, 54);

    let yPos = 62;
    if (client) {
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(`Cliente: ${client.name}`, 14, yPos);
      yPos += 6;
    }
    if (project) {
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(`Projecto: ${project.name}`, 14, yPos);
      yPos += 6;
    }

    yPos += 4;

    // Items table
    const typeLabels: Record<string, string> = { product: 'Produto', labor: 'Mão de Obra', transport: 'Transporte' };
    const tableData = budget.items.map(item => [
      item.name,
      typeLabels[item.type] || item.type,
      item.quantity.toString(),
      formatCurrency(item.unitCost),
      formatCurrency(item.unitPrice),
      formatCurrency(item.totalPrice),
      formatCurrency(item.profit),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Tipo', 'Qtd', 'Custo Unit.', 'Preço Unit.', 'Total', 'Lucro']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
      },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 40;
    const summaryY = finalY + 12;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, summaryY - 4, 182, 28, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text('Custo Total:', 20, summaryY + 4);
    doc.text('Valor Cliente:', 70, summaryY + 4);
    doc.text('Lucro Empresa:', 120, summaryY + 4);
    doc.text('Margem:', 166, summaryY + 4);

    doc.setFontSize(11);
    doc.setTextColor(33, 37, 41);
    doc.text(formatCurrency(budget.totalCost), 20, summaryY + 14);
    doc.setTextColor(37, 99, 235);
    doc.text(formatCurrency(budget.totalValue), 70, summaryY + 14);
    doc.setTextColor(5, 150, 105);
    doc.text(formatCurrency(budget.totalProfit), 120, summaryY + 14);
    doc.setTextColor(124, 58, 237);
    doc.text(`${budget.marginPercent.toFixed(1)}%`, 166, summaryY + 14);

    doc.save(`orcamento-${budget.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    toast.success('PDF exportado com sucesso!');
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
  const currentMargin = currentTotalCost > 0 ? ((currentTotalProfit / currentTotalCost) * 100) : 0;

  const totalBudgetsValue = budgets.reduce((sum, b) => sum + b.totalValue, 0);
  const totalProfit = budgets.reduce((sum, b) => sum + b.totalProfit, 0);
  const approvedBudgets = budgets.filter(b => b.status === 'approved').length;

  const getStatusBadge = (status: Budget['status']) => {
    const config = {
      draft: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
      sent: { label: 'Enviado', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      approved: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      rejected: { label: 'Rejeitado', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
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

  const getTypeLabel = (type: BudgetItem['type']) => {
    switch (type) {
      case 'product': return 'Produto';
      case 'labor': return 'Mão de Obra';
      case 'transport': return 'Transporte';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Banknote className="h-8 w-8 text-violet-200" />
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
          <p className="text-sm text-muted-foreground">Crie, edite, clone e exporte orçamentos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEditMode ? 'Editar Orçamento' : 'Criar Orçamento'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-2">
              {/* Step 1: Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                  Informações do Orçamento
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="budgetName">Nome do Orçamento *</Label>
                    <Input
                      id="budgetName"
                      value={budgetName}
                      onChange={(e) => setBudgetName(e.target.value)}
                      placeholder="Ex: Orçamento Obra Talatona"
                      className="text-base"
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
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notas (opcional)</Label>
                    <Textarea
                      value={budgetNotes}
                      onChange={(e) => setBudgetNotes(e.target.value)}
                      placeholder="Observações sobre o orçamento..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step 2: Add Items */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                  Adicionar Itens
                </div>
                <div className="pl-8">
                  <Card className="border-dashed border-2">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Tipo</Label>
                          <Select value={selectedItemType} onValueChange={(v: any) => { setSelectedItemType(v); setSelectedItemId(''); }}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="product">
                                <span className="flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Produto</span>
                              </SelectItem>
                              <SelectItem value="labor">
                                <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Mão de Obra</span>
                              </SelectItem>
                              <SelectItem value="transport">
                                <span className="flex items-center gap-2"><Truck className="w-3.5 h-3.5" /> Transporte</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Item</Label>
                          <Select value={selectedItemId || 'none'} onValueChange={(v) => setSelectedItemId(v === 'none' ? '' : v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione item" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Selecione...</SelectItem>
                              {getAvailableItems().map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} — {formatCurrency(item.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Quantidade</Label>
                          <Input
                            type="number"
                            min="1"
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(e.target.value)}
                            placeholder="Qtd"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={addItemToBudget} disabled={!selectedItemId} className="w-full gap-1">
                            <Plus className="w-4 h-4" /> Adicionar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Items List */}
              {budgetItems.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                      Itens do Orçamento ({budgetItems.length})
                    </div>
                    <div className="pl-8">
                      <Card>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-center">Tipo</TableHead>
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
                                      <span className="font-medium">{item.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center text-xs text-muted-foreground">{getTypeLabel(item.type)}</TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                  <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                                  <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(item.profit)}</TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeItemFromBudget(item.id)} className="text-destructive h-8 w-8">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      {/* Summary */}
                      <Card className="mt-4 border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Custo Total</p>
                              <p className="text-lg font-bold">{formatCurrency(currentTotalCost)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Valor Cliente</p>
                              <p className="text-lg font-bold text-blue-600">{formatCurrency(currentTotalValue)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Lucro Empresa</p>
                              <p className="text-lg font-bold text-emerald-600">{formatCurrency(currentTotalProfit)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Margem</p>
                              <p className="text-lg font-bold text-violet-600">{currentMargin.toFixed(1)}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={handleCreateOrUpdateBudget} disabled={!budgetName || budgetItems.length === 0} className="gap-2">
                  {isEditMode ? (
                    <><Edit className="w-4 h-4" /> Guardar Alterações</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Criar Orçamento</>
                  )}
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
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum orçamento criado</p>
              <p className="text-sm">Clique em "Novo Orçamento" para começar.</p>
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
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{budget.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client?.name || 'Sem cliente'} • {format(new Date(budget.createdAt), "dd MMM yyyy", { locale: pt })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                        <div className="text-right hidden sm:block">
                          <p className="font-semibold text-blue-600">{formatCurrency(budget.totalValue)}</p>
                          <p className="text-xs text-emerald-600">Lucro: {formatCurrency(budget.totalProfit)}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-4 pb-4">
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
                      <Card className="mt-4 border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Custo Total</p>
                              <p className="text-lg font-bold">{formatCurrency(budget.totalCost)}</p>
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

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExportPDF(budget)}>
                            <Download className="w-3.5 h-3.5" /> PDF
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleCloneBudget(budget)}>
                            <Copy className="w-3.5 h-3.5" /> Clonar
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleEditBudget(budget)}>
                            <Edit className="w-3.5 h-3.5" /> Editar
                          </Button>
                          <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => onDeleteBudget(budget.id)}>
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </Button>
                        </div>
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

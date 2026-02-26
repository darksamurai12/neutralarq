import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, TrendingUp, ChevronDown, ChevronUp, Package, Users, Truck, Edit, Copy, Download, Banknote, FolderPlus, Folder, Percent, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Budget, BudgetItem, PricingProduct, PricingLabor, PricingTransport, Client, Project } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ItemSelectionDialog } from './ItemSelectionDialog';

// Função de agrupamento melhorada com ordenação alfabética
function groupItems(items: BudgetItem[]): { groupName: string; items: BudgetItem[] }[] {
  const groups: Record<string, BudgetItem[]> = {};
  
  // 1. Ordenar todos os itens por nome (A-Z)
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'));
  
  // 2. Agrupar os itens já ordenados
  sortedItems.forEach(item => { 
    const key = item.groupName || '__ungrouped__'; 
    if (!groups[key]) groups[key] = []; 
    groups[key].push(item); 
  });
  
  const result: { groupName: string; items: BudgetItem[] }[] = [];
  
  // 3. Obter e ordenar os nomes dos grupos alfabeticamente
  const groupNames = Object.keys(groups)
    .filter(k => k !== '__ungrouped__')
    .sort((a, b) => a.localeCompare(b, 'pt-PT'));
  
  groupNames.forEach(name => { 
    result.push({ groupName: name, items: groups[name] }); 
  });
  
  // 4. Adicionar itens sem grupo no final
  if (groups['__ungrouped__']) { 
    result.push({ groupName: '', items: groups['__ungrouped__'] }); 
  }
  
  return result;
}

export function BudgetTab({ budgets, products, labor, transport, clients, projects, onCreateBudget, onUpdateBudget, onDeleteBudget, createBudgetItem }: BudgetTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [expandedBudget, setExpandedBudget] = useState<string | null>(null);
  const [budgetName, setBudgetName] = useState('');
  const [budgetNotes, setBudgetNotes] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [budgetGroups, setBudgetGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);

  const resetForm = () => { setBudgetName(''); setBudgetNotes(''); setSelectedClientId(''); setSelectedProjectId(''); setBudgetItems([]); setBudgetGroups([]); setSelectedGroup(''); setNewGroupName(''); setShowNewGroupInput(false); setIsDialogOpen(false); setIsEditMode(false); setEditingBudgetId(null); };

  const addGroup = () => { const name = newGroupName.trim(); if (!name || budgetGroups.includes(name)) return; setBudgetGroups(prev => [...prev, name]); setSelectedGroup(name); setNewGroupName(''); setShowNewGroupInput(false); toast.success(`Grupo "${name}" criado`); };

  const handleAddItem = (item: BudgetItem) => {
    setBudgetItems(prev => [...prev, item]);
    toast.success(`Item "${item.name}" adicionado`);
  };

  const updateItemInBudget = (id: string, field: 'quantity' | 'marginPercent', value: string) => {
    const numValue = parseFloat(value) || 0;
    setBudgetItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: numValue };
        const unitCost = updated.unitCost;
        const margin = updated.marginPercent;
        const qty = updated.quantity;

        updated.unitPrice = unitCost * (1 + margin / 100);
        updated.totalPrice = updated.unitPrice * qty;
        updated.totalCost = unitCost * qty;
        updated.profit = updated.totalPrice - updated.totalCost;

        return updated;
      }
      return item;
    }));
  };

  const removeItemFromBudget = (itemId: string) => { setBudgetItems(prev => prev.filter(item => item.id !== itemId)); };

  const handleCreateOrUpdateBudget = () => { 
    if (!budgetName || budgetItems.length === 0) return; 
    const client = clients.find(c => c.id === selectedClientId);
    if (isEditMode && editingBudgetId) {
      onUpdateBudget(editingBudgetId, { name: budgetName, items: budgetItems, notes: budgetNotes, clientName: client?.name || null, projectId: selectedProjectId || null });
    } else {
      onCreateBudget({ name: budgetName, clientId: selectedClientId || null, clientName: client?.name || null, projectId: selectedProjectId || null, items: budgetItems, status: 'draft', notes: budgetNotes }); 
    }
    resetForm(); 
  };

  const handleEditBudget = (budget: Budget) => { 
    setIsEditMode(true); setEditingBudgetId(budget.id); setBudgetName(budget.name); setBudgetNotes(budget.notes || ''); setBudgetItems([...budget.items]); 
    const client = clients.find(c => c.name === budget.clientName);
    setSelectedClientId(client?.id || ''); setSelectedProjectId(budget.projectId || ''); 
    const existingGroups = [...new Set(budget.items.map(i => i.groupName).filter(Boolean))] as string[]; 
    setBudgetGroups(existingGroups); setIsDialogOpen(true); 
  };

  const handleCloneBudget = (budget: Budget) => { 
    setIsEditMode(false); setEditingBudgetId(null); setBudgetName(`${budget.name} (Cópia)`); setBudgetNotes(budget.notes || ''); setBudgetItems(budget.items.map(item => ({ ...item, id: crypto.randomUUID() }))); 
    const client = clients.find(c => c.name === budget.clientName);
    setSelectedClientId(client?.id || ''); setSelectedProjectId(budget.projectId || ''); 
    const existingGroups = [...new Set(budget.items.map(i => i.groupName).filter(Boolean))] as string[]; 
    setBudgetGroups(existingGroups); setIsDialogOpen(true); 
    toast.success('Orçamento clonado — edite e guarde.'); 
  };

  const handleExportPDF = (budget: Budget) => {
    const doc = new jsPDF();
    const client = clients.find(c => c.id === budget.clientId) || { name: budget.clientName };
    const project = projects.find(p => p.id === budget.projectId);
    const grouped = groupItems(budget.items);
    const typeLabels: Record<string, string> = { product: 'Produto', labor: 'Mão de Obra', transport: 'Transporte' };
    const statusLabels: Record<string, string> = { draft: 'Rascunho', sent: 'Enviado', approved: 'Aprovado', rejected: 'Rejeitado' };
    const pageHeight = doc.internal.pageSize.height;

    const renderHeader = (title: string, isInternal: boolean) => {
      doc.setFontSize(20); doc.setTextColor(33, 37, 41); doc.text(title, 14, 22);
      doc.setFontSize(10); doc.setTextColor(108, 117, 125); 
      doc.text(`Nº: ${budget.id.slice(0, 8).toUpperCase()}`, 14, 30); 
      doc.text(`Data: ${format(new Date(budget.createdAt), "dd/MM/yyyy", { locale: pt })}`, 14, 36); 
      doc.text(`Estado: ${statusLabels[budget.status] || budget.status}`, 14, 42);
      doc.setFontSize(12); doc.setTextColor(33, 37, 41); doc.text(budget.name, 14, 54);
      let y = 62; 
      if (client?.name) { doc.setFontSize(10); doc.setTextColor(108, 117, 125); doc.text(`Cliente: ${client.name}`, 14, y); y += 6; } 
      if (project) { doc.setFontSize(10); doc.setTextColor(108, 117, 125); doc.text(`Projecto: ${project.name}`, 14, y); y += 6; }
      if (isInternal) { doc.setFontSize(10); doc.setTextColor(220, 38, 38); doc.text('DOCUMENTO PARA USO INTERNO - NÃO ENVIAR AO CLIENTE', 14, y); y += 6; }
      return y + 4;
    };

    let yPos = renderHeader('ORÇAMENTO (CLIENTE)', false);
    grouped.forEach((group) => {
      if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
      if (group.groupName) { doc.setFontSize(11); doc.setTextColor(79, 70, 229); doc.text(`▸ ${group.groupName}`, 14, yPos); yPos += 6; }
      const tableData = group.items.map(item => [item.name, typeLabels[item.type] || item.type, item.quantity.toString(), formatCurrency(item.unitPrice), formatCurrency(item.totalPrice)]);
      autoTable(doc, { startY: yPos, head: [['Item', 'Tipo', 'Qtd', 'Preço Unit.', 'Total']], body: tableData, theme: 'striped', headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 }, bodyStyles: { fontSize: 8 }, columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } }, margin: { bottom: 20 } });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    });
    if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
    doc.setDrawColor(200, 200, 200); doc.setFillColor(248, 249, 250); doc.roundedRect(14, yPos, 182, 20, 3, 3, 'FD'); 
    doc.setFontSize(10); doc.setTextColor(108, 117, 125); doc.text('VALOR TOTAL DO ORÇAMENTO:', 20, yPos + 12); 
    doc.setFontSize(14); doc.setTextColor(37, 99, 235); doc.text(formatCurrency(budget.totalValue), 100, yPos + 12);
    if (budget.notes) { yPos += 30; if (yPos > pageHeight - 30) { doc.addPage(); yPos = 20; } doc.setFontSize(10); doc.setTextColor(33, 37, 41); doc.text('Notas:', 14, yPos); doc.setFontSize(9); doc.setTextColor(108, 117, 125); const splitNotes = doc.splitTextToSize(budget.notes, 180); doc.text(splitNotes, 14, yPos + 6); }

    doc.addPage();
    yPos = renderHeader('RELATÓRIO DE CUSTOS (INTERNO)', true);
    grouped.forEach((group) => {
      if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
      if (group.groupName) { doc.setFontSize(11); doc.setTextColor(220, 38, 38); doc.text(`▸ ${group.groupName}`, 14, yPos); yPos += 6; }
      const tableData = group.items.map(item => [item.name, item.quantity.toString(), formatCurrency(item.unitCost), formatCurrency(item.totalCost), `${item.marginPercent}%`, formatCurrency(item.profit)]);
      autoTable(doc, { startY: yPos, head: [['Item', 'Qtd', 'Custo Unit.', 'Custo Total', 'Margem', 'Lucro']], body: tableData, theme: 'grid', headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 9 }, bodyStyles: { fontSize: 8 }, columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'center' }, 5: { halign: 'right' } }, margin: { bottom: 20 } });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    });
    if (yPos > pageHeight - 60) { doc.addPage(); yPos = 20; }
    doc.setDrawColor(200, 200, 200); doc.setFillColor(254, 242, 242); doc.roundedRect(14, yPos, 182, 40, 3, 3, 'FD'); 
    doc.setFontSize(10); doc.setTextColor(108, 117, 125); doc.text('RESUMO FINANCEIRO INTERNO:', 20, yPos + 10); doc.text('Custo Total de Execução:', 20, yPos + 20); doc.text('Lucro Bruto Previsto:', 20, yPos + 28); doc.text('Margem Média Global:', 20, yPos + 36);
    doc.setFontSize(11); doc.setTextColor(33, 37, 41); doc.text(formatCurrency(budget.totalCost), 100, yPos + 20); doc.setTextColor(22, 163, 74); doc.text(formatCurrency(budget.totalProfit), 100, yPos + 28); doc.text(`${budget.marginPercent.toFixed(1)}%`, 100, yPos + 36);

    doc.save(`orcamento-${budget.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    toast.success('PDF exportado com folhas de cliente e interna!');
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

  const getTypeLabel = (type: BudgetItem['type']) => { switch (type) { case 'product': return 'Produto'; case 'labor': return 'Mão de Obra'; case 'transport': return 'Transporte'; } };

  const renderItemsTable = (items: BudgetItem[], isEditable = false) => {
    if (items.length === 0) return (<div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2"><AlertCircle className="w-8 h-8 opacity-20" /><p className="text-sm">Este orçamento não tem itens.</p></div>);
    return (
      <Table>
        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-center">Tipo</TableHead><TableHead className="text-center w-[100px]">Qtd</TableHead><TableHead className="text-center w-[100px]">Margem (%)</TableHead><TableHead className="text-right">Custo Unit.</TableHead><TableHead className="text-right">Preço Unit.</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right text-emerald-600">Lucro</TableHead>{isEditable && <TableHead className="w-[50px]"></TableHead>}</TableRow></TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell><div className="flex items-center gap-2">{getItemIcon(item.type)}<span className="font-medium">{item.name}</span></div></TableCell>
              <TableCell className="text-center text-xs text-muted-foreground">{getTypeLabel(item.type)}</TableCell>
              <TableCell className="text-center">{isEditable ? (<Input type="number" min="1" value={item.quantity} onChange={(e) => updateItemInBudget(item.id, 'quantity', e.target.value)} className="h-8 text-center px-1" />) : (item.quantity)}</TableCell>
              <TableCell className="text-center">{isEditable ? (<Input type="number" step="0.1" value={item.marginPercent || 0} onChange={(e) => updateItemInBudget(item.id, 'marginPercent', e.target.value)} className="h-8 text-center px-1" />) : (<Badge variant="outline" className="text-[10px]">{item.marginPercent || 0}%</Badge>)}</TableCell>
              <TableCell className="text-right text-muted-foreground">{formatCurrency(item.unitCost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
              <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(item.profit)}</TableCell>
              {isEditable && (<TableCell><Button variant="ghost" size="icon" onClick={() => removeItemFromBudget(item.id)} className="text-destructive h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button></TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderGroupedItems = (items: BudgetItem[], isEditable = false) => {
    const grouped = groupItems(items);
    if (grouped.length === 1 && !grouped[0].groupName) return renderItemsTable(items, isEditable);
    return (
      <div className="space-y-4">
        {grouped.map((group, idx) => {
          const groupTotal = group.items.reduce((s, i) => s + i.totalPrice, 0);
          const groupProfit = group.items.reduce((s, i) => s + i.profit, 0);
          return (
            <div key={idx}>
              {group.groupName && (<div className="flex items-center justify-between px-2 py-2 bg-primary/5 rounded-lg mb-2"><div className="flex items-center gap-2"><Folder className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">{group.groupName}</span><Badge variant="secondary" className="text-xs">{group.items.length} itens</Badge></div><div className="flex gap-4 text-xs"><span className="text-muted-foreground">Total: <strong className="text-foreground">{formatCurrency(groupTotal)}</strong></span><span className="text-muted-foreground">Lucro: <strong className="text-emerald-600">{formatCurrency(groupProfit)}</strong></span></div></div>)}
              {!group.groupName && grouped.length > 1 && (<div className="flex items-center gap-2 px-2 py-2 bg-muted/50 rounded-lg mb-2"><span className="font-medium text-sm text-muted-foreground">Sem grupo</span><Badge variant="secondary" className="text-xs">{group.items.length} itens</Badge></div>)}
              {renderItemsTable(group.items, isEditable)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5"><div className="flex items-center justify-between mb-3"><div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div></div><p className="text-xs font-medium text-muted-foreground mb-1">Total Orçamentos</p><p className="text-xl font-bold text-foreground tracking-tight">{budgets.length}</p></div>
        <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5"><div className="flex items-center justify-between mb-3"><div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div></div><p className="text-xs font-medium text-muted-foreground mb-1">Aprovados</p><p className="text-xl font-bold text-foreground tracking-tight">{approvedBudgets}</p></div>
        <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5"><div className="flex items-center justify-between mb-3"><div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Banknote className="w-5 h-5" /></div></div><p className="text-xs font-medium text-muted-foreground mb-1">Valor Total</p><p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(totalBudgetsValue)}</p></div>
        <div className="rounded-2xl p-5 bg-pastel-amber transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5"><div className="flex items-center justify-between mb-3"><div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div></div><p className="text-xs font-medium text-muted-foreground mb-1">Lucro Total</p><p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(totalProfit)}</p></div>
      </div>

      <div className="flex items-center justify-between">
        <div><h3 className="text-lg font-semibold">Orçamentos</h3><p className="text-sm text-muted-foreground">Crie, edite, clone e exporte orçamentos</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Novo Orçamento</Button></DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-xl">{isEditMode ? 'Editar Orçamento' : 'Criar Orçamento'}</DialogTitle></DialogHeader>
            <div className="space-y-6 mt-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary"><div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>Informações do Orçamento</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                  <div className="space-y-2 md:col-span-2"><Label htmlFor="budgetName">Nome do Orçamento *</Label><Input id="budgetName" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} placeholder="Ex: Orçamento Obra Talatona" className="text-base bg-white" /></div>
                  <div className="space-y-2"><Label>Cliente (opcional)</Label><Select value={selectedClientId || 'none'} onValueChange={(v) => setSelectedClientId(v === 'none' ? '' : v)}><SelectTrigger className="bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent className="bg-white border shadow-xl"><SelectItem value="none">Nenhum</SelectItem>{clients.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Projecto (opcional)</Label><Select value={selectedProjectId || 'none'} onValueChange={(v) => setSelectedProjectId(v === 'none' ? '' : v)}><SelectTrigger className="bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent className="bg-white border shadow-xl"><SelectItem value="none">Nenhum</SelectItem>{projects.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2 md:col-span-2"><Label>Notas (opcional)</Label><Textarea value={budgetNotes} onChange={(e) => setBudgetNotes(e.target.value)} placeholder="Observações sobre o orçamento..." rows={2} className="bg-white" /></div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary"><div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>Adicionar Itens</div>
                <div className="pl-8 space-y-3">
                  <Card className="border border-primary/20 bg-primary/5"><CardContent className="p-3"><div className="flex items-center gap-2 mb-2"><Folder className="w-4 h-4 text-primary" /><Label className="text-xs font-medium">Grupo (opcional)</Label></div><div className="flex flex-wrap items-center gap-2"><Badge variant={selectedGroup === '' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedGroup('')}>Sem grupo</Badge>{budgetGroups.map(g => (<Badge key={g} variant={selectedGroup === g ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedGroup(g)}>{g}</Badge>))}{showNewGroupInput ? (<div className="flex items-center gap-1"><Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Nome do grupo" className="h-7 text-xs w-36 bg-white" onKeyDown={(e) => e.key === 'Enter' && addGroup()} autoFocus /><Button size="sm" variant="ghost" className="h-7 px-2" onClick={addGroup}><Plus className="w-3 h-3" /></Button><Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowNewGroupInput(false)}>✕</Button></div>) : (<Button size="sm" variant="outline" className="h-7 gap-1 text-xs bg-white" onClick={() => setShowNewGroupInput(true)}><FolderPlus className="w-3 h-3" /> Novo Grupo</Button>)}</div></CardContent></Card>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      className="h-14 w-full border-dashed border-2 rounded-2xl flex items-center justify-between px-6 hover:bg-slate-50 hover:border-primary/50 transition-all group bg-white"
                      onClick={() => setIsItemModalOpen(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Search className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-700">Seleccionar Item</p>
                          <p className="text-[10px] text-slate-400">Pesquise no catálogo de produtos, mão de obra e transporte</p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                    </Button>
                    {selectedGroup && (
                      <p className="text-[10px] text-muted-foreground px-2">
                        Os itens seleccionados serão adicionados ao grupo: <strong className="text-primary">{selectedGroup}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {budgetItems.length > 0 && (<><Separator /><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-primary"><div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>Itens do Orçamento ({budgetItems.length})</div><div className="pl-8"><Card><CardContent className="p-0 overflow-x-auto">{renderGroupedItems(budgetItems, true)}</CardContent></Card><Card className="mt-4 border-primary/20 bg-primary/5"><CardContent className="p-4"><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"><div><p className="text-xs text-muted-foreground">Custo Total</p><p className="text-lg font-bold">{formatCurrency(currentTotalCost)}</p></div><div><p className="text-xs text-muted-foreground">Valor Cliente</p><p className="text-lg font-bold text-blue-600">{formatCurrency(currentTotalValue)}</p></div><div><p className="text-xs text-muted-foreground">Lucro Empresa</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(currentTotalProfit)}</p></div><div><p className="text-xs text-muted-foreground">Margem</p><p className="text-lg font-bold text-violet-600">{currentMargin.toFixed(1)}%</p></div></div></CardContent></Card></div></div></>)}
              <div className="flex justify-end gap-3 pt-2 border-t"><Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button><Button onClick={handleCreateOrUpdateBudget} disabled={!budgetName || budgetItems.length === 0} className="gap-2">{isEditMode ? (<><Edit className="w-4 h-4" /> Guardar Alterações</>) : (<><Plus className="w-4 h-4" /> Criar Orçamento</>)}</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ItemSelectionDialog
        open={isItemModalOpen}
        onOpenChange={setIsItemModalOpen}
        products={products}
        labor={labor}
        transport={transport}
        groups={budgetGroups}
        selectedGroup={selectedGroup}
        onConfirm={handleAddItem}
        createBudgetItem={createBudgetItem}
      />

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Nenhum orçamento criado</p><p className="text-sm">Clique em "Novo Orçamento" para começar.</p></CardContent></Card>
        ) : (
          budgets.map((budget) => {
            const client = clients.find(c => c.id === budget.clientId) || { name: budget.clientName };
            const isExpanded = expandedBudget === budget.id;
            const statusConfig = getStatusBadge(budget.status);
            return (
              <Collapsible key={budget.id} open={isExpanded} onOpenChange={() => setExpandedBudget(isExpanded ? null : budget.id)}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <CollapsibleTrigger className="w-full"><div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"><div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div><div className="text-left"><p className="font-semibold">{budget.name}</p><p className="text-sm text-muted-foreground">{client?.name || 'Sem cliente'} • {format(new Date(budget.createdAt), "dd MMM yyyy", { locale: pt })}</p></div></div><div className="flex items-center gap-3"><Badge className={statusConfig.className}>{statusConfig.label}</Badge><div className="text-right hidden sm:block"><p className="font-semibold text-blue-600">{formatCurrency(budget.totalValue)}</p><p className="text-xs text-emerald-600">Lucro: {formatCurrency(budget.totalProfit)}</p></div>{isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}</div></div></CollapsibleTrigger>
                  <CollapsibleContent><div className="border-t px-4 pb-4 pt-4">{renderGroupedItems(budget.items)}<Card className="mt-4 border-primary/20 bg-primary/5"><CardContent className="p-4"><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"><div><p className="text-xs text-muted-foreground">Custo Total</p><p className="text-lg font-bold">{formatCurrency(budget.totalCost)}</p></div><div><p className="text-xs text-muted-foreground">Valor Cliente</p><p className="text-lg font-bold text-blue-600">{formatCurrency(budget.totalValue)}</p></div><div><p className="text-xs text-muted-foreground">Lucro Empresa</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(budget.totalProfit)}</p></div><div><p className="text-xs text-muted-foreground">Margem</p><p className="text-lg font-bold text-violet-600">{budget.marginPercent.toFixed(1)}%</p></div></div></CardContent></Card><div className="flex justify-between items-center mt-4"><Select value={budget.status} onValueChange={(v: Budget['status']) => onUpdateBudget(budget.id, { status: v })}><SelectTrigger className="w-[150px] bg-white"><SelectValue /></SelectTrigger><SelectContent className="bg-white border shadow-xl"><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="sent">Enviado</SelectItem><SelectItem value="approved">Aprovado</SelectItem><SelectItem value="rejected">Rejeitado</SelectItem></SelectContent></Select><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="gap-1.5 bg-white" onClick={() => handleExportPDF(budget)}><Download className="w-3.5 h-3.5" /> PDF</Button><Button variant="outline" size="sm" className="gap-1.5 bg-white" onClick={() => handleCloneBudget(budget)}><Copy className="w-3.5 h-3.5" /> Clonar</Button><Button variant="outline" size="sm" className="gap-1.5 bg-white" onClick={() => handleEditBudget(budget)}><Edit className="w-3.5 h-3.5" /> Editar</Button><Button variant="destructive" size="sm" className="gap-1.5" onClick={() => onDeleteBudget(budget.id)}><Trash2 className="w-3.5 h-3.5" /> Eliminar</Button></div></div></div></CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}
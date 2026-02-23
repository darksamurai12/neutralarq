import { useState } from 'react';
import { useApp, dealStageConfig } from '@/contexts/AppContext';
import { Deal, DealStage } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Calendar,
  DollarSign,
  Percent,
  GripVertical,
  TrendingUp,
  Target,
  Trophy,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

const emptyFormData = {
  title: '',
  clientId: '',
  value: 0,
  stage: 'lead' as DealStage,
  probability: 10,
  expectedCloseDate: null as Date | null,
  notes: '',
};

export function DealPipeline() {
  const { deals, clients, addDeal, updateDeal, deleteDeal, moveDealToStage, getPipelineMetrics } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  const metrics = getPipelineMetrics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeal) {
      updateDeal(editingDeal.id, formData);
    } else {
      addDeal(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingDeal(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      clientId: deal.clientId,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      notes: deal.notes,
    });
    setIsDialogOpen(true);
  };

  const handleStageChange = (stage: DealStage) => {
    const stageConfig = dealStageConfig.find(s => s.id === stage);
    setFormData({ 
      ...formData, 
      stage, 
      probability: stageConfig?.probability || formData.probability 
    });
  };

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, newStage: DealStage) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== newStage) {
      moveDealToStage(draggedDeal.id, newStage);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente desconhecido';
  };

  const pipelineStages = dealStageConfig.filter(s => s.id !== 'won' && s.id !== 'lost');
  const closedStages = dealStageConfig.filter(s => s.id === 'won' || s.id === 'lost');

  return (
    <div className="space-y-6">
      {/* Pipeline Metrics - Pastel Design */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Valor Total Pipeline</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(metrics.totalValue)}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Valor Ponderado</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(metrics.weightedValue)}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Negócios Ganhos</p>
          <p className="text-xl font-bold text-emerald-600 tracking-tight">{formatCurrency(metrics.stageValues.won)}</p>
          <p className="text-[10px] text-emerald-500 mt-1">{metrics.dealsByStage.won} negócio(s)</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-rose transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Negócios Perdidos</p>
          <p className="text-xl font-bold text-rose-600 tracking-tight">{formatCurrency(metrics.stageValues.lost)}</p>
          <p className="text-[10px] text-rose-500 mt-1">{metrics.dealsByStage.lost} negócio(s)</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-11">
              <Plus className="w-4 h-4" />
              Novo Negócio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingDeal ? 'Editar Negócio' : 'Novo Negócio'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Nome do negócio" className="h-11 rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor Estimado (Kz) *</Label>
                  <Input id="value" type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} placeholder="0" className="h-11 rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Etapa</Label>
                  <Select value={formData.stage} onValueChange={(value: DealStage) => handleStageChange(value)}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {dealStageConfig.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>{stage.label} ({stage.probability}%)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probabilidade (%)</Label>
                  <Input id="probability" type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })} className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">Data Prevista de Fecho</Label>
                <Input id="expectedCloseDate" type="date" value={formData.expectedCloseDate ? format(formData.expectedCloseDate, 'yyyy-MM-dd') : ''} onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value ? new Date(e.target.value) : null })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Observações sobre o negócio..." className="rounded-xl resize-none" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" className="h-11 rounded-xl px-6" onClick={resetForm}>Cancelar</Button>
                <Button type="submit" className="h-11 rounded-xl px-8">{editingDeal ? 'Guardar' : 'Criar Negócio'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-6 min-w-max">
          {pipelineStages.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            const isDropTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={cn(
                  "w-80 flex-shrink-0 rounded-2xl transition-all duration-200",
                  isDropTarget && "ring-2 ring-primary ring-offset-4"
                )}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="mb-4 px-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-r", stage.color)} />
                    <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">{stage.label}</h3>
                    <Badge variant="secondary" className="rounded-lg text-[10px] font-bold">{stageDeals.length}</Badge>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{formatCurrency(stageValue)}</span>
                </div>

                <div className="space-y-3 min-h-[400px] p-2 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      className={cn(
                        "cursor-grab active:cursor-grabbing border-none shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl group",
                        draggedDeal?.id === deal.id && "opacity-50 scale-95"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400" />
                            <h4 className="font-bold text-sm text-slate-700 line-clamp-1">{deal.title}</h4>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(deal)}><Pencil className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteDeal(deal.id)}><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3 font-medium">{getClientName(deal.clientId)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-primary font-bold text-xs">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(deal.value)}
                          </div>
                          <Badge variant="outline" className="text-[9px] font-bold border-slate-100 text-slate-400">
                            {deal.probability}%
                          </Badge>
                        </div>
                        {deal.expectedCloseDate && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-50">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(deal.expectedCloseDate), "dd MMM yyyy", { locale: ptBR })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Closed Stages - Pastel Backgrounds */}
          {closedStages.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const isDropTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={cn(
                  "w-72 flex-shrink-0 rounded-2xl transition-all duration-200",
                  isDropTarget && "ring-2 ring-primary ring-offset-4"
                )}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="mb-4 px-2 flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-r", stage.color)} />
                  <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">{stage.label}</h3>
                </div>

                <div className={cn(
                  "space-y-2 min-h-[200px] p-2 rounded-2xl border border-none",
                  stage.id === 'won' ? "bg-pastel-mint/50" : "bg-pastel-rose/50"
                )}>
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      className="cursor-grab border-none shadow-sm bg-white/80 backdrop-blur-sm rounded-xl"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-xs text-slate-700 truncate">{deal.title}</h4>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(deal)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">{formatCurrency(deal.value)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
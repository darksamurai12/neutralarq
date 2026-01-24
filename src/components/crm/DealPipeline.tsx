import { useState, useRef } from 'react';
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('AOA', 'Kz');
};

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

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: DealStage) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== newStage) {
      moveDealToStage(draggedDeal.id, newStage);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente desconhecido';
  };

  // Filter out won/lost for main pipeline, show them separately
  const pipelineStages = dealStageConfig.filter(s => s.id !== 'won' && s.id !== 'lost');
  const closedStages = dealStageConfig.filter(s => s.id === 'won' || s.id === 'lost');

  return (
    <div className="space-y-6">
      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Valor Total Pipeline</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(metrics.totalValue)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Valor Ponderado</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(metrics.weightedValue)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Negócios Ganhos</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(metrics.stageValues.won)}</p>
                <p className="text-emerald-100 text-xs mt-1">{metrics.dealsByStage.won} negócio(s)</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium mb-1">Negócios Perdidos</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(metrics.stageValues.lost)}</p>
                <p className="text-rose-100 text-xs mt-1">{metrics.dealsByStage.lost} negócio(s)</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Deal Button */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4" />
              Novo Negócio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDeal ? 'Editar Negócio' : 'Novo Negócio'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do negócio"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor Estimado (Kz) *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Etapa</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value: DealStage) => handleStageChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dealStageConfig.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.label} ({stage.probability}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probabilidade (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">Data Prevista de Fecho</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate ? format(formData.expectedCloseDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value ? new Date(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre o negócio..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDeal ? 'Guardar' : 'Criar Negócio'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Kanban */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {pipelineStages.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            const isDropTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={cn(
                  "w-80 flex-shrink-0 rounded-xl transition-all duration-200",
                  isDropTarget && "ring-2 ring-primary ring-offset-2"
                )}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <Card className="h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full bg-gradient-to-r",
                          stage.color
                        )} />
                        <CardTitle className="text-sm font-semibold">{stage.label}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {stageDeals.length}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs font-medium">
                        {stage.probability}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(stageValue)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[200px]">
                    {stageDeals.map((deal) => (
                      <Card
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "cursor-grab active:cursor-grabbing border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-background",
                          draggedDeal?.id === deal.id && "opacity-50 scale-95"
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                              <h4 className="font-medium text-sm line-clamp-1">{deal.title}</h4>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(deal)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => deleteDeal(deal.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {getClientName(deal.clientId)}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-primary font-semibold">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(deal.value)}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Percent className="w-3 h-3" />
                              {deal.probability}%
                            </div>
                          </div>
                          {deal.expectedCloseDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(deal.expectedCloseDate), "dd MMM yyyy", { locale: ptBR })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <p>Arraste negócios aqui</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Closed Deals Section */}
          {closedStages.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            const isDropTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={cn(
                  "w-72 flex-shrink-0 rounded-xl transition-all duration-200",
                  isDropTarget && "ring-2 ring-primary ring-offset-2"
                )}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <Card className={cn(
                  "h-full border-0 shadow-lg",
                  stage.id === 'won' ? "bg-emerald-500/10" : "bg-rose-500/10"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full bg-gradient-to-r",
                          stage.color
                        )} />
                        <CardTitle className="text-sm font-semibold">{stage.label}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {stageDeals.length}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(stageValue)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 min-h-[150px]">
                    {stageDeals.map((deal) => (
                      <Card
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "cursor-grab active:cursor-grabbing border-0 shadow-sm transition-all duration-200 bg-background/80",
                          draggedDeal?.id === deal.id && "opacity-50"
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm line-clamp-1">{deal.title}</h4>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(deal)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => deleteDeal(deal.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-xs text-muted-foreground">{getClientName(deal.clientId)}</p>
                          <p className="text-sm font-semibold text-primary mt-1">{formatCurrency(deal.value)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
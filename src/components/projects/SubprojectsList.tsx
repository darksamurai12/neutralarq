import React, { useState } from 'react';
import { Project, ProjectStatus, ProjectType } from '@/types';
import { Plus, Calendar, MapPin, DollarSign, ChevronRight, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { useApp } from '@/contexts/AppContext';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: { label: 'Planeamento', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  in_progress: { label: 'Em Execução', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  paused: { label: 'Parado', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  completed: { label: 'Concluído', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
};

const typeConfig: Record<ProjectType, { label: string; icon: string }> = {
  architecture: { label: 'Arquitectura', icon: '🏛️' },
  construction: { label: 'Construção Civil', icon: '🏗️' },
  interior_design: { label: 'Design de Interiores', icon: '🎨' },
};

interface SubprojectsListProps {
  parentProject: Project;
  subprojects: Project[];
  onSelectSubproject: (projectId: string) => void;
}

const emptyFormData = {
  name: '',
  type: 'architecture' as ProjectType,
  location: '',
  description: '',
  startDate: '',
  deadline: '',
  budget: '',
  status: 'planning' as ProjectStatus,
};

export function SubprojectsList({ parentProject, subprojects, onSelectSubproject }: SubprojectsListProps) {
  const { addProject, getProjectWithDetails } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      name: formData.name,
      clientId: parentProject.clientId,
      type: formData.type,
      location: formData.location || parentProject.location,
      description: formData.description,
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      deadline: formData.deadline ? new Date(formData.deadline) : new Date(parentProject.deadline),
      budget: parseFloat(formData.budget) || 0,
      status: formData.status,
      parentProjectId: parentProject.id,
    });
    setFormData(emptyFormData);
    setIsDialogOpen(false);
  };

  const totalBudget = subprojects.reduce((sum, sp) => sum + sp.budget, 0);
  const completedCount = subprojects.filter(sp => sp.status === 'completed').length;
  const overallProgress = subprojects.length > 0
    ? Math.round(subprojects.reduce((sum, sp) => {
        const details = getProjectWithDetails(sp.id);
        return sum + (details?.kpis.progressPercentage || 0);
      }, 0) / subprojects.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-primary" />
          Subprojectos ({subprojects.length})
        </h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-3 h-3" />
              Novo Subprojecto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Subprojecto</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Este subprojecto será vinculado ao projecto <span className="font-medium text-foreground">{parentProject.name}</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Nome do Subprojecto</Label>
                <Input
                  id="sub-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Fase 1 - Fundações"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ProjectType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="architecture">🏛️ Arquitectura</SelectItem>
                      <SelectItem value="construction">🏗️ Construção Civil</SelectItem>
                      <SelectItem value="interior_design">🎨 Design de Interiores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planeamento</SelectItem>
                      <SelectItem value="in_progress">Em Execução</SelectItem>
                      <SelectItem value="paused">Parado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-location">Local</Label>
                <Input
                  id="sub-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={parentProject.location}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Orçamento (AOA)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o subprojecto..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Subprojecto</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {subprojects.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Progresso Geral</p>
            <p className="text-lg font-bold text-foreground">{overallProgress}%</p>
            <Progress value={overallProgress} className="h-1.5 mt-1" />
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Concluídos</p>
            <p className="text-lg font-bold text-foreground">{completedCount}/{subprojects.length}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Orçamento Total</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(totalBudget)}</p>
          </div>
        </div>
      )}

      {/* Subprojects List */}
      {subprojects.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-muted/30 border border-dashed border-border">
          <FolderTree className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum subprojecto criado</p>
          <p className="text-xs text-muted-foreground mt-1">Divida o projecto em subprojectos para melhor gestão</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subprojects.map((subproject) => {
            const details = getProjectWithDetails(subproject.id);
            const progress = details?.kpis.progressPercentage || 0;
            
            return (
              <div
                key={subproject.id}
                onClick={() => onSelectSubproject(subproject.id)}
                className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
              >
                <span className="text-xl flex-shrink-0">{typeConfig[subproject.type].icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {subproject.name}
                    </h5>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', statusConfig[subproject.status].className)}>
                      {statusConfig[subproject.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {subproject.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {subproject.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(subproject.deadline), "dd MMM yyyy", { locale: pt })}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(subproject.budget)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={progress} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

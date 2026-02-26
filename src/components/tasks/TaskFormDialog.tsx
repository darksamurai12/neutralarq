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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project, TaskStatus, TaskPriority, ProjectPhase } from '@/types';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onSubmit: (data: any) => void;
}

const emptyFormData = {
  title: '',
  description: '',
  projectId: '',
  responsible: '',
  deadline: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as TaskPriority,
  phase: 'projeto' as ProjectPhase,
};

export function TaskFormDialog({ open, onOpenChange, projects, onSubmit }: TaskFormDialogProps) {
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (open) setFormData(emptyFormData);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      ...formData,
      projectId: formData.projectId || null,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      completionPercentage: 0,
      subtasks: [],
      comments: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Tarefa *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Revisão do projeto executivo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Projecto Associado (Opcional)</Label>
            <Select
              value={formData.projectId || "none"}
              onValueChange={(value) => setFormData({ ...formData, projectId: value === "none" ? "" : value })}
            >
              <SelectTrigger className="bg-white dark:bg-slate-950">
                <SelectValue placeholder="Tarefa Geral (Sem Projecto)" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
                <SelectItem value="none">Tarefa Geral (Sem Projecto)</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Nome do responsável"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-white dark:bg-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fase</Label>
              <Select
                value={formData.phase}
                onValueChange={(value: ProjectPhase) => setFormData({ ...formData, phase: value })}
              >
                <SelectTrigger className="bg-white dark:bg-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
                  <SelectItem value="projeto">Projecto</SelectItem>
                  <SelectItem value="obra">Obra</SelectItem>
                  <SelectItem value="acabamento">Acabamento</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-white dark:bg-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="doing">Em Curso</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes da tarefa..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
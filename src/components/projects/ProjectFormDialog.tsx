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
import { Project, ProjectStatus, ProjectType, Client } from '@/types';
import { format } from 'date-fns';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject: Project | null;
  clients: Client[];
  onSubmit: (data: any) => void;
}

const emptyFormData = {
  name: '',
  clientId: '',
  type: 'architecture' as ProjectType,
  location: '',
  description: '',
  startDate: '',
  deadline: '',
  budget: '',
  status: 'planning' as ProjectStatus,
  imageUrl: '', // Adicionado
};

export function ProjectFormDialog({ open, onOpenChange, editingProject, clients, onSubmit }: ProjectFormDialogProps) {
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name,
        clientId: editingProject.clientId,
        type: editingProject.type,
        location: editingProject.location,
        description: editingProject.description,
        startDate: format(new Date(editingProject.startDate), 'yyyy-MM-dd'),
        deadline: format(new Date(editingProject.deadline), 'yyyy-MM-dd'),
        budget: editingProject.budget.toString(),
        status: editingProject.status,
        imageUrl: editingProject.imageUrl || '', // Adicionado
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [editingProject, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate),
      deadline: new Date(formData.deadline),
      budget: parseFloat(formData.budget),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProject ? 'Editar Projecto' : 'Novo Projecto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome do Projecto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Edifício Comercial Talatona"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.filter(c => c.status !== 'inactive').map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Projecto</Label>
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

            <div className="col-span-2 space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem de Capa</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="location">Local da Obra</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Talatona, Luanda Sul"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Data Prevista de Conclusão</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento Aprovado (AOA)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
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

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descrição Geral</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o projecto..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingProject ? 'Guardar' : 'Criar Projecto'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
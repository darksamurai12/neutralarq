"use client";

import { 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  FileText, 
  MessageSquare, 
  FolderKanban, 
  ArrowUpRight, 
  Pencil, 
  Trash2 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client, ClientStatus, Project, ClientInteraction } from '@/types';
import { cn } from '@/lib/utils';
import { ClientInteractions } from './ClientInteractions';

interface ClientDetailsDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  projects: Project[];
  interactions: ClientInteraction[];
  onAddInteraction: (clientId: string, data: any) => void;
  onDeleteInteraction: (clientId: string, id: string) => void;
}

const statusConfig: Record<ClientStatus, { label: string; className: string; bgClass: string }> = {
  lead: { label: 'Lead', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', bgClass: 'from-amber-500 to-amber-600' },
  active: { label: 'Activo', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', bgClass: 'from-emerald-500 to-emerald-600' },
  inactive: { label: 'Inactivo', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', bgClass: 'from-slate-500 to-slate-600' },
};

export function ClientDetailsDialog({ 
  client, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete, 
  projects, 
  interactions,
  onAddInteraction,
  onDeleteInteraction
}: ClientDetailsDialogProps) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br',
              statusConfig[client.status].bgClass
            )}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl">{client.name}</DialogTitle>
              <Badge variant="outline" className={cn('mt-1', statusConfig[client.status].className)}>
                {statusConfig[client.status].label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{client.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm font-medium text-foreground">{client.phone || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Empresa / Cargo</p>
              <p className="text-sm font-medium text-foreground">
                {client.company || '-'} {client.position && `• ${client.position}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Endereço</p>
              <p className="text-sm font-medium text-foreground">{client.address || '-'}</p>
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Notas</p>
              <p className="text-sm text-foreground">{client.notes}</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="interactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="interactions" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Interações
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="w-4 h-4" />
              Projectos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interactions">
            <ClientInteractions 
              clientId={client.id} 
              interactions={interactions} 
              onAdd={onAddInteraction} 
              onDelete={onDeleteInteraction} 
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-2">
            {projects.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-muted/30 border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Nenhum projecto associado</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{project.status.replace('_', ' ')}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(client)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(client.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
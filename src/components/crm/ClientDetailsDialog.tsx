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
  Trash2,
  User
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

  const infoItems = [
    { icon: Mail, label: 'Email', value: client.email },
    { icon: Phone, label: 'Telefone', value: client.phone || 'Não registado' },
    { icon: Building, label: 'Empresa', value: client.company || 'Individual' },
    { icon: User, label: 'Cargo', value: client.position || 'N/A' },
    { icon: MapPin, label: 'Endereço', value: client.address || 'Sem endereço' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br shadow-lg',
              statusConfig[client.status].bgClass
            )}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <DialogTitle className="text-2xl font-bold text-slate-800">{client.name}</DialogTitle>
              <Badge variant="outline" className={cn('mt-1 px-3 py-0.5 rounded-full border-none', statusConfig[client.status].className)}>
                {statusConfig[client.status].label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Lista de Informações do Cliente */}
        <div className="space-y-2 mb-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">Dados do Cliente</p>
          {infoItems.map((item, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:text-primary transition-colors">
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                </div>
                <span className="text-sm text-slate-500 font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-slate-700 truncate max-w-[250px]">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {client.notes && (
          <div className="p-4 rounded-2xl bg-pastel-lavender/30 border border-pastel-lavender/50 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Notas Internas</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{client.notes}</p>
          </div>
        )}

        <Tabs defaultValue="interactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100/50 p-1 rounded-2xl">
            <TabsTrigger value="interactions" className="gap-2 rounded-xl data-[state=active]:shadow-sm">
              <MessageSquare className="w-4 h-4" />
              Interações
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2 rounded-xl data-[state=active]:shadow-sm">
              <FolderKanban className="w-4 h-4" />
              Projectos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interactions" className="mt-0">
            <ClientInteractions 
              clientId={client.id} 
              interactions={interactions} 
              onAdd={onAddInteraction} 
              onDelete={onDeleteInteraction} 
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-3 mt-0">
            {projects.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhum projecto associado</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                      <FolderKanban className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{project.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{project.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold"
            onClick={() => onEdit(client)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
          <Button
            variant="destructive"
            className="h-11 w-11 rounded-xl p-0"
            onClick={() => onDelete(client.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
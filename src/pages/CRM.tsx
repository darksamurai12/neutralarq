import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { 
  Users, 
  Plus, 
  Mail, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Phone, 
  Building, 
  MapPin, 
  FileText,
  UserCheck,
  UserPlus,
  UserX,
  ArrowUpRight,
  FolderKanban,
  Handshake,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client, ClientStatus } from '@/types';
import { cn } from '@/lib/utils';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { StatusFilter } from '@/components/filters/StatusFilter';
import { DealPipeline } from '@/components/crm/DealPipeline';
import { CRMCalendar } from '@/components/crm/CRMCalendar';

const statusConfig: Record<ClientStatus, { label: string; className: string; bgClass: string }> = {
  lead: { label: 'Lead', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', bgClass: 'from-amber-500 to-amber-600' },
  active: { label: 'Activo', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', bgClass: 'from-emerald-500 to-emerald-600' },
  inactive: { label: 'Inactivo', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', bgClass: 'from-slate-500 to-slate-600' },
};

const statusOptions = [
  { value: 'lead' as const, label: 'Lead' },
  { value: 'active' as const, label: 'Activo' },
  { value: 'inactive' as const, label: 'Inactivo' },
];

const emptyFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  address: '',
  notes: '',
  status: 'lead' as ClientStatus,
};

export default function CRM() {
  const { clients, addClient, updateClient, deleteClient, getClientProjects } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'clients' | 'pipeline' | 'calendar'>('clients');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingClient(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      position: client.position,
      address: client.address,
      notes: client.notes,
      status: client.status,
    });
    setIsDialogOpen(true);
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const activeClients = clients.filter(c => c.status === 'active').length;
  const leadClients = clients.filter(c => c.status === 'lead').length;
  const inactiveClients = clients.filter(c => c.status === 'inactive').length;

  return (
    <AppLayout>
      <PageHeader
        title="CRM"
        description="Gestão de clientes, leads e pipeline de vendas"
        icon={Users}
      >
        {activeTab === 'clients' && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+244 9XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Ex: Director Comercial"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: ClientStatus) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Endereço completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observações sobre o cliente..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingClient ? 'Guardar' : 'Criar Cliente'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {/* Tabs for Clients and Pipeline */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'clients' | 'pipeline' | 'calendar')} className="mb-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3 rounded-xl">
          <TabsTrigger value="clients" className="gap-2 rounded-lg">
            <Users className="w-4 h-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2 rounded-lg">
            <Handshake className="w-4 h-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2 rounded-lg">
            <CalendarDays className="w-4 h-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Clientes Activos</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{activeClients}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <ArrowUpRight className="w-3 h-3" />
            <span>Com projectos</span>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-amber transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Leads no Funil</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{leadClients}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <UserPlus className="w-3 h-3" />
            <span>Potenciais clientes</span>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Clientes Inactivos</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{inactiveClients}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <UserX className="w-3 h-3" />
            <span>Sem actividade</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-border/50 rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 max-w-md">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Pesquisar clientes por nome, email ou empresa..."
              />
            </div>
            <StatusFilter<ClientStatus>
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={statusOptions}
              placeholder="Filtrar por status"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientProjects = getClientProjects(client.id);
          return (
            <Card 
              key={client.id}
              className="group cursor-pointer shadow-lg border-0 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              onClick={() => setSelectedClient(client)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br',
                      statusConfig[client.status].bgClass
                    )}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{client.company || 'Sem empresa'}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(client); }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.position && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="w-4 h-4 flex-shrink-0" />
                      <span>{client.position}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <Badge variant="outline" className={cn('font-medium', statusConfig[client.status].className)}>
                    {statusConfig[client.status].label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {clientProjects.length} projecto{clientProjects.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredClients.length === 0 && (
          <div className="col-span-full">
            <Card className="shadow-lg border-0">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Nenhum cliente encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros ou adicione um novo cliente</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <DealPipeline />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CRMCalendar />
        </TabsContent>
      </Tabs>

      {/* Client Detail Sheet */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br',
                    statusConfig[selectedClient.status].bgClass
                  )}>
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{selectedClient.name}</SheetTitle>
                    <Badge variant="outline" className={cn('mt-1', statusConfig[selectedClient.status].className)}>
                      {statusConfig[selectedClient.status].label}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">{selectedClient.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium text-foreground">{selectedClient.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Empresa / Cargo</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedClient.company || '-'} {selectedClient.position && `• ${selectedClient.position}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Endereço</p>
                    <p className="text-sm font-medium text-foreground">{selectedClient.address || '-'}</p>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Notas</p>
                      <p className="text-sm text-foreground">{selectedClient.notes}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-primary" />
                    Projectos Associados
                  </h4>
                  {getClientProjects(selectedClient.id).length === 0 ? (
                    <div className="text-center py-8 rounded-xl bg-muted/30 border border-dashed border-border">
                      <p className="text-sm text-muted-foreground">Nenhum projecto associado</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getClientProjects(selectedClient.id).map((project) => (
                        <div
                          key={project.id}
                          className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                        >
                          <p className="text-sm font-medium text-foreground">{project.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">{project.status.replace('_', ' ')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handleEdit(selectedClient);
                    setSelectedClient(null);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteClient(selectedClient.id);
                    setSelectedClient(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

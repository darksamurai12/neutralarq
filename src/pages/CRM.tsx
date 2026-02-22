import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { Users, Plus, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client, ClientStatus } from '@/types';
import { DealPipeline } from '@/components/crm/DealPipeline';
import { ClientStats } from '@/components/crm/ClientStats';
import { ClientFilters } from '@/components/crm/ClientFilters';
import { ClientCard } from '@/components/crm/ClientCard';
import { ClientFormDialog } from '@/components/crm/ClientFormDialog';
import { ClientDetailsDialog } from '@/components/crm/ClientDetailsDialog';

export default function CRM() {
  const { 
    clients, 
    addClient, 
    updateClient, 
    deleteClient, 
    getClientProjects, 
    addInteraction, 
    deleteInteraction, 
    getClientInteractions 
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'clients' | 'pipeline'>('clients');

  const handleFormSubmit = (data: any) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient(data);
    }
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    setSelectedClient(null);
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = clients.filter(c => c.status === 'active').length;
  const leadCount = clients.filter(c => c.status === 'lead').length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;

  return (
    <AppLayout>
      <PageHeader
        title="CRM"
        description="Gestão de clientes, leads e pipeline de vendas"
        icon={Users}
      >
        {activeTab === 'clients' && (
          <Button 
            className="w-full md:w-auto gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => { setEditingClient(null); setIsFormOpen(true); }}
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        )}
      </PageHeader>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'clients' | 'pipeline')} className="mb-6">
        <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="clients" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
            <Users className="w-4 h-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
            <Handshake className="w-4 h-4" />
            Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-6">
          <ClientStats 
            activeCount={activeCount} 
            leadCount={leadCount} 
            inactiveCount={inactiveCount} 
          />

          <ClientFilters 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            statusFilter={statusFilter} 
            onStatusChange={setStatusFilter} 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard 
                key={client.id}
                client={client}
                projectCount={getClientProjects(client.id).length}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={setSelectedClient}
              />
            ))}
            {filteredClients.length === 0 && (
              <div className="col-span-full">
                <div className="py-16 text-center bg-card rounded-2xl shadow-lg">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nenhum cliente encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros ou adicione um novo cliente</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <DealPipeline />
        </TabsContent>
      </Tabs>

      <ClientFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        editingClient={editingClient} 
        onSubmit={handleFormSubmit} 
      />

      <ClientDetailsDialog 
        client={selectedClient}
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        projects={selectedClient ? getClientProjects(selectedClient.id) : []}
        interactions={selectedClient ? getClientInteractions(selectedClient.id) : []}
        onAddInteraction={addInteraction}
        onDeleteInteraction={deleteInteraction}
      />
    </AppLayout>
  );
}
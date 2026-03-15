"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { Handshake, Plus, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PartnerCard } from '@/components/partners/PartnerCard';
import { PartnerFormDialog } from '@/components/partners/PartnerFormDialog';
import { Partner } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Partners() {
  const { partners, loading, addPartner, updatePartner, deletePartner } = useApp();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.services.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = () => {
    setEditingPartner(null);
    setIsFormOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingPartner) {
      updatePartner(editingPartner.id, data);
    } else {
      addPartner(data);
    }
  };

  if (loading && partners.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Parceiros e Fornecedores"
        description="Gestão de contactos externos, subempreiteiros e fornecedores de materiais"
        icon={Handshake}
      >
        <Button 
          className="gap-2 shadow-lg rounded-2xl h-12 px-6 font-bold"
          onClick={handleCreate}
        >
          <Plus className="w-5 h-5" /> Novo Parceiro
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por nome ou serviço..."
            className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="Fornecedor">Fornecedores</SelectItem>
            <SelectItem value="Subempreiteiro">Subempreiteiros</SelectItem>
            <SelectItem value="Consultor">Consultores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPartners.map(partner => (
          <PartnerCard 
            key={partner.id} 
            partner={partner} 
            onEdit={handleEdit}
            onDelete={deletePartner}
          />
        ))}
        
        {filteredPartners.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center bg-white dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Handshake className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black text-xl">Nenhum parceiro encontrado</p>
            <p className="text-sm text-slate-300 mt-2">Adicione novos parceiros para centralizar os seus contactos.</p>
          </div>
        )}
      </div>

      <PartnerFormDialog 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingPartner={editingPartner}
        onSubmit={handleFormSubmit}
      />
    </AppLayout>
  );
}
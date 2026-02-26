"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDocuments } from '@/hooks/useDocuments';
import { FileText, Search, Filter, Loader2, Plus, LayoutGrid, List, Trash2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentCategory, Document } from '@/types';
import { DocumentFormDialog } from '@/components/documents/DocumentFormDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function Documents() {
  const { documents, loading, uploadFile, getDownloadUrl, updateDocument, deleteDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleFormSubmit = async (file: File | null, data: any) => {
    if (editingDoc) {
      await updateDocument(editingDoc.id, data);
    } else if (file) {
      await uploadFile(file, data);
    }
    setIsFormOpen(false);
    setEditingDoc(null);
  };

  const handleDownload = async (filePath: string) => {
    const url = await getDownloadUrl(filePath);
    if (url) window.open(url, '_blank');
  };

  if (loading) {
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
        title="Gestão de Documentos"
        description="Armazenamento interno seguro e organizado por categorias"
        icon={FileText}
      >
        <Button 
          className="gap-2 shadow-lg rounded-2xl h-12 px-6 font-bold"
          onClick={() => { setEditingDoc(null); setIsFormOpen(true); }}
        >
          <Plus className="w-5 h-5" /> Novo Documento
        </Button>
      </PageHeader>

      {/* Dashboard de Documentos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-pastel-sky p-5 rounded-3xl border border-blue-100/50">
          <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">Total Ficheiros</p>
          <p className="text-2xl font-black text-slate-800">{documents.length}</p>
        </div>
        <div className="bg-pastel-mint p-5 rounded-3xl border border-emerald-100/50">
          <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Ativos</p>
          <p className="text-2xl font-black text-slate-800">{documents.filter(d => d.status === 'active').length}</p>
        </div>
        <div className="bg-pastel-rose p-5 rounded-3xl border border-rose-100/50">
          <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest">Expirados</p>
          <p className="text-2xl font-black text-slate-800">{documents.filter(d => d.status === 'expired').length}</p>
        </div>
        <div className="bg-pastel-slate p-5 rounded-3xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arquivados</p>
          <p className="text-2xl font-black text-slate-800">{documents.filter(d => d.status === 'archived').length}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por nome ou descrição..."
            className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
            <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="rh">Recursos Humanos</SelectItem>
              <SelectItem value="contratos">Contratos</SelectItem>
              <SelectItem value="projetos">Projectos</SelectItem>
              <SelectItem value="templates">Templates</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-lg", viewMode === 'grid' && "bg-white dark:bg-slate-700 shadow-sm")} onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-lg", viewMode === 'list' && "bg-white dark:bg-slate-700 shadow-sm")} onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "flex flex-col gap-3"
      )}>
        {filteredDocs.map(doc => (
          <DocumentCard 
            key={doc.id} 
            doc={doc} 
            onDownload={handleDownload}
            onEdit={(d) => { setEditingDoc(d); setIsFormOpen(true); }}
            onArchive={(d) => updateDocument(d.id, { status: d.status === 'archived' ? 'active' : 'archived' })}
            onDelete={(id, filePath) => {
              if (confirm('Deseja eliminar permanentemente do servidor?')) {
                deleteDocument(id, filePath, true);
              } else {
                deleteDocument(id, filePath, false);
              }
            }} 
          />
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black text-xl">Nenhum documento encontrado</p>
            <p className="text-sm text-slate-300 mt-2">Ajuste os filtros ou carregue um novo ficheiro.</p>
          </div>
        )}
      </div>

      <DocumentFormDialog 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingDoc={editingDoc}
        onSubmit={handleFormSubmit}
      />
    </AppLayout>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDocuments } from '@/hooks/useDocuments';
import { FileText, Upload, Search, Filter, HardDrive, AlertCircle, Loader2, Plus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentCategory } from '@/types';
import { toast } from 'sonner';
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

const categories: DocumentCategory[] = ['Administrativo', 'Financeiro', 'RH', 'Contratos', 'Templates', 'Geral'];

export default function Documents() {
  const { documents, settings, loading, connectGoogleDrive, uploadFile, deleteDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Geral');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const success = params.get('success');

    if (error === 'unauthorized_account') {
      toast.error('Conta não autorizada! Utilize apenas neutralarqd@gmail.com', { duration: 5000 });
      navigate('/documentos', { replace: true });
    } else if (error) {
      toast.error('Erro na autenticação com o Google Drive');
      navigate('/documentos', { replace: true });
    }

    if (success === 'connected') {
      toast.success('Google Drive conectado com sucesso!');
      navigate('/documentos', { replace: true });
    }
  }, [location, navigate]);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadFile(selectedFile, uploadCategory);
    setIsUploadOpen(false);
    setSelectedFile(null);
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
        description="Armazenamento centralizado e seguro no Google Drive"
        icon={FileText}
      >
        {!settings.isConnected ? (
          <Button onClick={connectGoogleDrive} className="gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl">
            <HardDrive className="w-4 h-4" /> Conectar neutralarqd@gmail.com
          </Button>
        ) : (
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg rounded-xl h-11 px-6">
                <Plus className="w-4 h-4" /> Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload para o Google Drive</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Ficheiro</label>
                  <Input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Categoria / Pasta</label>
                  <Select value={uploadCategory} onValueChange={(v: any) => setUploadCategory(v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleUpload} disabled={!selectedFile} className="w-full rounded-xl h-11">
                  Iniciar Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {!settings.isConnected && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center gap-4 mb-8">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
          <div>
            <h3 className="font-bold text-amber-800">Acesso Restrito</h3>
            <p className="text-sm text-amber-700">Apenas a conta oficial <strong>neutralarqd@gmail.com</strong> pode ser conectada para armazenamento.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar documentos..."
            className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
          <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocs.map(doc => (
          <DocumentCard 
            key={doc.id} 
            doc={doc} 
            onDelete={(id, fileId) => {
              if (confirm('Deseja remover também do Google Drive?')) {
                deleteDocument(id, fileId, true);
              } else {
                deleteDocument(id, fileId, false);
              }
            }} 
          />
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Nenhum documento encontrado</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
"use client";

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, DocumentStatus } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

const BUCKET_NAME = 'documents';

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar lista de documentos');
    } else {
      setDocuments((data || []).map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category as DocumentCategory,
        department: d.department,
        filePath: d.file_path,
        size: d.size,
        fileType: d.file_type,
        version: d.version,
        status: d.status as DocumentStatus,
        expiryDate: d.expiry_date ? new Date(d.expiry_date) : null,
        createdBy: d.created_by,
        createdAt: new Date(d.created_at),
        updatedAt: new Date(d.updated_at)
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = async (file: File, metadata: { 
    name: string, 
    description?: string, 
    category: DocumentCategory, 
    department?: string,
    expiryDate?: Date | null
  }) => {
    if (!user) return;

    const timestamp = new Date().getTime();
    const year = new Date().getFullYear();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${metadata.category}/${year}/${timestamp}_${cleanFileName}`;

    toast.loading('A carregar ficheiro...', { id: 'upload' });

    // 1. Upload para o Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (storageError) {
      toast.error('Erro no upload físico: ' + storageError.message, { id: 'upload' });
      return;
    }

    // 2. Salvar na Base de Dados
    const { error: dbError } = await supabase.from('documents').insert({
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      department: metadata.department,
      file_path: filePath,
      size: file.size,
      file_type: file.type,
      expiry_date: metadata.expiryDate?.toISOString(),
      created_by: user.id
    });

    if (dbError) {
      // Rollback storage se falhar DB
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      toast.error('Erro ao salvar metadados: ' + dbError.message, { id: 'upload' });
    } else {
      toast.success('Documento guardado com sucesso!', { id: 'upload' });
      fetchDocuments();
    }
  };

  const getDownloadUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60); // Link válido por 60 segundos

    if (error) {
      toast.error('Erro ao gerar link de download');
      return null;
    }
    return data.signedUrl;
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    const dbUpdates: any = { ...updates };
    if (updates.filePath) { dbUpdates.file_path = updates.filePath; delete dbUpdates.filePath; }
    if (updates.expiryDate) { dbUpdates.expiry_date = updates.expiryDate.toISOString(); delete dbUpdates.expiryDate; }
    
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('documents').update(dbUpdates).eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar documento');
    } else {
      toast.success('Documento atualizado');
      fetchDocuments();
    }
  };

  const deleteDocument = async (id: string, filePath: string, permanent: boolean) => {
    if (permanent) {
      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      if (storageError) {
        toast.error('Erro ao remover ficheiro do servidor');
        return;
      }
      const { error: dbError } = await supabase.from('documents').delete().eq('id', id);
      if (dbError) toast.error('Erro ao remover registo');
    } else {
      // Soft delete
      await supabase.from('documents').update({ status: 'deleted', updated_at: new Date().toISOString() }).eq('id', id);
    }
    
    toast.success(permanent ? 'Documento eliminado permanentemente' : 'Documento movido para a lixeira');
    fetchDocuments();
  };

  return {
    documents,
    loading,
    uploadFile,
    getDownloadUrl,
    updateDocument,
    deleteDocument,
    refresh: fetchDocuments
  };
}
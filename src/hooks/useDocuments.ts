"use client";

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, GoogleDriveSettings } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [settings, setSettings] = useState<GoogleDriveSettings>({ isConnected: false, updatedAt: new Date() });
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data.map(d => ({
        ...d,
        fileId: d.file_id,
        webViewLink: d.web_view_link,
        downloadLink: d.download_link,
        mimeType: d.mime_type,
        isArchived: d.is_archived,
        createdAt: new Date(d.created_at),
        updatedAt: new Date(d.updated_at)
      })));
    }
    setLoading(false);
  }, [user]);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('google_drive_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setSettings({ isConnected: data.is_connected, updatedAt: new Date(data.updated_at) });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchSettings();
    }
  }, [user, fetchDocuments, fetchSettings]);

  const connectGoogleDrive = async () => {
    // Chama a Edge Function para obter a URL de autorização
    const { data, error } = await supabase.functions.invoke('google-drive-auth', {
      body: { action: 'get_auth_url' }
    });

    if (error) {
      toast.error('Erro ao conectar com Google Drive');
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const uploadFile = async (file: File, category: DocumentCategory) => {
    if (!settings.isConnected) {
      toast.error('Conecte o Google Drive primeiro');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('year', new Date().getFullYear().toString());

    toast.loading('A enviar para o Google Drive...', { id: 'upload' });

    const { data, error } = await supabase.functions.invoke('google-drive-upload', {
      body: formData,
    });

    if (error) {
      toast.error('Erro no upload', { id: 'upload' });
      return;
    }

    // Salvar metadados no banco
    const { error: dbError } = await supabase.from('documents').insert({
      user_id: user?.id,
      name: file.name,
      file_id: data.fileId,
      web_view_link: data.webViewLink,
      download_link: data.downloadLink,
      mime_type: file.type,
      size: file.size,
      category,
      year: new Date().getFullYear()
    });

    if (dbError) {
      toast.error('Erro ao salvar metadados', { id: 'upload' });
    } else {
      toast.success('Documento guardado no Drive!', { id: 'upload' });
      fetchDocuments();
    }
  };

  const deleteDocument = async (id: string, fileId: string, removeFromDrive: boolean) => {
    if (removeFromDrive) {
      await supabase.functions.invoke('google-drive-delete', {
        body: { fileId }
      });
    }

    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Documento removido');
    }
  };

  return {
    documents,
    settings,
    loading,
    connectGoogleDrive,
    uploadFile,
    deleteDocument,
    refresh: fetchDocuments
  };
}
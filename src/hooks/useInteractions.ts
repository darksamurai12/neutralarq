import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClientInteraction, InteractionType } from '@/types';
import { useAuth } from './useAuth';

interface DBInteraction {
  id: string;
  user_id: string;
  client_id: string;
  type: string;
  description: string;
  date: string;
  created_at: string;
}

function mapFromDB(row: DBInteraction): ClientInteraction {
  return {
    id: row.id,
    clientId: row.client_id,
    type: row.type as InteractionType,
    description: row.description,
    date: new Date(row.date),
    createdAt: new Date(row.created_at),
  };
}

export function useInteractions() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = useCallback(async () => {
    // Removido o filtro .eq('user_id', user.id)
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching interactions:', error);
        return;
      }
      setInteractions((data || []).map(mapFromDB));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchInteractions();
    }
  }, [user, fetchInteractions]);

  const addInteraction = useCallback(async (
    clientId: string,
    interaction: Omit<ClientInteraction, 'id' | 'createdAt' | 'clientId'>
  ) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('client_interactions')
      .insert({
        user_id: user.id,
        client_id: clientId,
        type: interaction.type,
        description: interaction.description,
        date: interaction.date.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding interaction:', error);
      return;
    }
    if (data) {
      setInteractions(prev => [mapFromDB(data), ...prev]);
    }
  }, [user]);

  const deleteInteraction = useCallback(async (interactionId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('client_interactions')
      .delete()
      .eq('id', interactionId);

    if (error) {
      console.error('Error deleting interaction:', error);
      return;
    }
    setInteractions(prev => prev.filter(i => i.id !== interactionId));
  }, [user]);

  const getClientInteractions = useCallback((clientId: string) => {
    return interactions.filter(i => i.clientId === clientId);
  }, [interactions]);

  return {
    interactions,
    loading,
    addInteraction,
    deleteInteraction,
    getClientInteractions,
  };
}
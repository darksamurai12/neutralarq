"use client";

import { useState } from 'react';
import { 
  PhoneCall, 
  Video, 
  Mail, 
  MessageSquare, 
  StickyNote, 
  Send, 
  Clock, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientInteraction, InteractionType } from '@/types';

interface ClientInteractionsProps {
  clientId: string;
  interactions: ClientInteraction[];
  onAdd: (clientId: string, data: any) => void;
  onDelete: (clientId: string, id: string) => void;
}

export function ClientInteractions({ clientId, interactions, onAdd, onDelete }: ClientInteractionsProps) {
  const [type, setType] = useState<InteractionType>('call');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!description.trim()) return;
    onAdd(clientId, {
      type,
      description: description.trim(),
      date: new Date(),
    });
    setDescription('');
  };

  const iconMap: Record<InteractionType, React.ReactNode> = {
    call: <PhoneCall className="w-3.5 h-3.5" />,
    meeting: <Video className="w-3.5 h-3.5" />,
    email: <Mail className="w-3.5 h-3.5" />,
    whatsapp: <MessageSquare className="w-3.5 h-3.5" />,
    note: <StickyNote className="w-3.5 h-3.5" />,
  };

  const labelMap: Record<InteractionType, string> = {
    call: 'Chamada',
    meeting: 'Reunião',
    email: 'Email',
    whatsapp: 'WhatsApp',
    note: 'Nota',
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2">
        <div className="flex gap-2">
          <Select
            value={type}
            onValueChange={(v: InteractionType) => setType(v)}
          >
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">
                <span className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" /> Chamada</span>
              </SelectItem>
              <SelectItem value="meeting">
                <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Reunião</span>
              </SelectItem>
              <SelectItem value="email">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
              </SelectItem>
              <SelectItem value="whatsapp">
                <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</span>
              </SelectItem>
              <SelectItem value="note">
                <span className="flex items-center gap-1.5"><StickyNote className="w-3.5 h-3.5" /> Nota</span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Descrever a interação..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-9 text-sm flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button
            size="sm"
            className="h-9 px-3"
            disabled={!description.trim()}
            onClick={handleAdd}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {interactions.length === 0 ? (
          <div className="text-center py-6 rounded-xl bg-muted/30 border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Sem interações registadas</p>
          </div>
        ) : (
          interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="group/int flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/20 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                {iconMap[interaction.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {labelMap[interaction.type]}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(interaction.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-foreground mt-1">{interaction.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover/int:opacity-100 transition-opacity flex-shrink-0"
                onClick={() => onDelete(clientId, interaction.id)}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
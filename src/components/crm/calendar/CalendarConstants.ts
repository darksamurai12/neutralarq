import { CalendarEventType, CalendarView } from '@/types';
import { CalendarDays, Phone, Users, Target, Clock } from 'lucide-react';

export const eventTypeConfig: Record<CalendarEventType, { label: string; icon: any; color: string; bgClass: string; pastelClass: string }> = {
  meeting: { label: 'Reunião', icon: Users, color: 'text-blue-600', bgClass: 'bg-blue-500', pastelClass: 'bg-blue-50 border-blue-100' },
  call: { label: 'Chamada', icon: Phone, color: 'text-emerald-600', bgClass: 'bg-emerald-500', pastelClass: 'bg-emerald-50 border-emerald-100' },
  follow_up: { label: 'Acompanhamento', icon: Target, color: 'text-purple-600', bgClass: 'bg-purple-500', pastelClass: 'bg-purple-50 border-purple-100' },
  deadline: { label: 'Prazo', icon: Clock, color: 'text-rose-600', bgClass: 'bg-rose-500', pastelClass: 'bg-rose-50 border-rose-100' },
  other: { label: 'Outro', icon: CalendarDays, color: 'text-slate-600', bgClass: 'bg-slate-500', pastelClass: 'bg-slate-50 border-slate-100' },
};

export const reminderOptions = [
  { value: '0', label: 'Sem lembrete' },
  { value: '15', label: '15 min antes' },
  { value: '30', label: '30 min antes' },
  { value: '60', label: '1 hora antes' },
  { value: '1440', label: '1 dia antes' },
];
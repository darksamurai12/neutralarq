"use client";

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { CalendarEvent, CalendarEventType, CalendarView } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, getHours, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarStats } from './calendar/CalendarStats';
import { CalendarEventCard } from './calendar/CalendarEventCard';
import { eventTypeConfig, reminderOptions } from './calendar/CalendarConstants';

const emptyFormData = {
  title: '',
  description: '',
  type: 'meeting' as CalendarEventType,
  startDate: new Date(),
  endDate: new Date(),
  allDay: false,
  clientId: '' as string | null,
  dealId: '' as string | null,
  reminder: 30 as number | null,
  completed: false,
};

export function CRMCalendar() {
  const { 
    clients, calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
    getEventsForDay, getEventsForWeek, getEventsForMonth,
  } = useApp();

  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (isMobile) setView('day');
    else setView('month');
  }, [isMobile]);

  const navigatePrevious = () => {
    if (view === 'day') setCurrentDate(subDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const navigateNext = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const displayedEvents = useMemo(() => {
    if (view === 'day') return getEventsForDay(currentDate);
    if (view === 'week') return getEventsForWeek(currentDate);
    return getEventsForMonth(currentDate);
  }, [view, currentDate, getEventsForDay, getEventsForWeek, getEventsForMonth]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = { ...formData, clientId: formData.clientId || null, dealId: formData.dealId || null, reminder: formData.reminder || null };
    if (editingEvent) await updateCalendarEvent(editingEvent.id, eventData);
    else await addCalendarEvent(eventData);
    resetForm();
  };

  const resetForm = () => { setFormData(emptyFormData); setEditingEvent(null); setIsDialogOpen(false); };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title, description: event.description, type: event.type,
      startDate: new Date(event.startDate), endDate: new Date(event.endDate),
      allDay: event.allDay, clientId: event.clientId, dealId: event.dealId,
      reminder: event.reminder, completed: event.completed,
    });
    setIsDialogOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setFormData({ ...emptyFormData, startDate: setHours(setMinutes(day, 0), 9), endDate: setHours(setMinutes(day, 0), 10) });
    setIsDialogOpen(true);
  };

  const toggleEventComplete = async (event: CalendarEvent) => {
    await updateCalendarEvent(event.id, { completed: !event.completed });
  };

  const getClientName = (clientId: string | null) => clientId ? clients.find(c => c.id === clientId)?.name : null;

  const getViewTitle = () => {
    if (view === 'day') return format(currentDate, "d 'de' MMMM", { locale: ptBR });
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM', { locale: ptBR })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <CalendarStats events={calendarEvents} />

      <Card className="shadow-card border-none rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={navigatePrevious}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" className="h-9 px-4 font-semibold text-slate-600" onClick={goToToday}>Hoje</Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={navigateNext}><ChevronRight className="w-4 h-4" /></Button>
              </div>
              <h2 className="text-lg font-bold text-slate-800 capitalize">{getViewTitle()}</h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 flex-1 sm:flex-none">
                <Button variant={view === 'day' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('day')} className={cn("flex-1 rounded-lg h-9 text-xs font-bold", view === 'day' && "bg-white shadow-sm")}>Dia</Button>
                {!isMobile && (
                  <>
                    <Button variant={view === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('week')} className={cn("flex-1 rounded-lg h-9 text-xs font-bold", view === 'week' && "bg-white shadow-sm")}>Semana</Button>
                    <Button variant={view === 'month' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('month')} className={cn("flex-1 rounded-lg h-9 text-xs font-bold", view === 'month' && "bg-white shadow-sm")}>Mês</Button>
                  </>
                )}
              </div>

              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="h-11 gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all"><Plus className="w-4 h-4" />Novo Evento</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader><DialogTitle className="text-xl font-bold">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Evento *</Label>
                      <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Reunião de Projecto" className="h-11 rounded-xl" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={formData.type} onValueChange={(value: CalendarEventType) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(eventTypeConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}><div className="flex items-center gap-2">{config.icon && <config.icon className={cn('w-4 h-4', config.color)} />}{config.label}</div></SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Lembrete</Label>
                        <Select value={formData.reminder?.toString() || '0'} onValueChange={(value) => setFormData({ ...formData, reminder: value === '0' ? null : parseInt(value) })}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>{reminderOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Switch id="allDay" checked={formData.allDay} onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })} />
                      <Label htmlFor="allDay" className="font-semibold text-slate-600">Evento de dia inteiro</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Popover>
                          <PopoverTrigger asChild><Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-xl"><CalendarIcon className="mr-2 h-4 w-4" />{format(formData.startDate, 'dd/MM/yyyy')}</Button></PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={formData.startDate} onSelect={(date) => date && setFormData({ ...formData, startDate: date, endDate: date })} initialFocus /></PopoverContent>
                        </Popover>
                      </div>
                      {!formData.allDay && (
                        <div className="space-y-2">
                          <Label>Hora</Label>
                          <Input type="time" value={format(formData.startDate, 'HH:mm')} className="h-11 rounded-xl" onChange={(e) => { const [hours, minutes] = e.target.value.split(':').map(Number); setFormData({ ...formData, startDate: setMinutes(setHours(formData.startDate, hours), minutes) }); }} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição / Notas</Label>
                      <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detalhes adicionais..." className="rounded-xl resize-none" rows={3} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" className="h-11 rounded-xl px-6" onClick={resetForm}>Cancelar</Button>
                      <Button type="submit" className="h-11 rounded-xl px-8">{editingEvent ? 'Guardar Alterações' : 'Criar Evento'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="shadow-card border-none rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {view === 'month' && !isMobile && (
                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-7 bg-slate-50/50">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                      <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const dayEvents = calendarEvents.filter(e => isSameDay(new Date(e.startDate), day));
                      const isCurrMonth = isSameMonth(day, currentDate);
                      return (
                        <div key={idx} className={cn('min-h-[120px] p-2 border-r border-b border-slate-50 cursor-pointer hover:bg-slate-50/50 transition-colors group', !isCurrMonth && 'bg-slate-50/20 text-slate-300', isToday(day) && 'bg-primary/5')} onClick={() => handleDayClick(day)}>
                          <div className={cn('text-sm font-bold mb-2 w-8 h-8 flex items-center justify-center rounded-xl transition-all', isToday(day) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 group-hover:text-primary')}>{format(day, 'd')}</div>
                          <div className="space-y-1.5">
                            {dayEvents.slice(0, 3).map((event) => (
                              <CalendarEventCard key={event.id} event={event} compact onEdit={handleEdit} onDelete={deleteCalendarEvent} onToggleComplete={toggleEventComplete} />
                            ))}
                            {dayEvents.length > 3 && <p className="text-[10px] font-bold text-slate-400 pl-1">+ {dayEvents.length - 3} mais</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {view === 'day' && (
                <div className="divide-y divide-slate-100">
                  <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
                    {hours.map((hour) => {
                      const hourEvents = displayedEvents.filter(e => getHours(new Date(e.startDate)) === hour);
                      return (
                        <div key={hour} className="grid grid-cols-12 border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                          <div className="col-span-2 md:col-span-1 py-6 px-2 text-right text-xs font-bold text-slate-400">{hour.toString().padStart(2, '0')}:00</div>
                          <div className="col-span-10 md:col-span-11 py-3 px-4 min-h-[100px] cursor-pointer" onClick={() => { setFormData({ ...emptyFormData, startDate: setHours(setMinutes(currentDate, 0), hour), endDate: setHours(setMinutes(currentDate, 0), hour + 1) }); setIsDialogOpen(true); }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {hourEvents.map((event) => (
                                <CalendarEventCard key={event.id} event={event} clientName={getClientName(event.clientId)} onEdit={handleEdit} onDelete={deleteCalendarEvent} onToggleComplete={toggleEventComplete} />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!isMobile && (
          <div className="space-y-6">
            <Card className="shadow-card border-none rounded-3xl overflow-hidden">
              <CardContent className="p-2">
                <Calendar mode="single" selected={currentDate} onSelect={(date) => date && setCurrentDate(date)} className="rounded-2xl" locale={ptBR} />
              </CardContent>
            </Card>
            <Card className="shadow-card border-none rounded-3xl bg-pastel-lavender/30">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Próximos Compromissos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {calendarEvents.filter(e => !e.completed && new Date(e.startDate) >= new Date()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 4).map((event) => (
                  <div key={event.id} className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 cursor-pointer hover:border-primary/20 transition-all" onClick={() => handleEdit(event)}>
                    <p className="text-xs font-bold text-slate-700 truncate">{event.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400 font-medium">{format(new Date(event.startDate), "d 'de' MMM", { locale: ptBR })}</span>
                      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 border-none", eventTypeConfig[event.type].pastelClass, eventTypeConfig[event.type].color)}>{eventTypeConfig[event.type].label}</Badge>
                    </div>
                  </div>
                ))}
                {calendarEvents.filter(e => !e.completed && new Date(e.startDate) >= new Date()).length === 0 && (<p className="text-xs text-slate-400 text-center py-6 italic">Nenhum evento agendado</p>)}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
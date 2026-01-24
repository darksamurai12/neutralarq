import { useState, useMemo } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  Users,
  Target,
  Bell,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Handshake,
  MoreHorizontal,
} from 'lucide-react';
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  getHours,
  setHours,
  setMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const eventTypeConfig: Record<CalendarEventType, { label: string; icon: typeof CalendarDays; color: string; bgClass: string }> = {
  meeting: { label: 'Reunião', icon: Users, color: 'text-blue-600', bgClass: 'bg-blue-500' },
  call: { label: 'Chamada', icon: Phone, color: 'text-emerald-600', bgClass: 'bg-emerald-500' },
  follow_up: { label: 'Acompanhamento', icon: Target, color: 'text-purple-600', bgClass: 'bg-purple-500' },
  deadline: { label: 'Prazo', icon: Clock, color: 'text-rose-600', bgClass: 'bg-rose-500' },
  other: { label: 'Outro', icon: CalendarDays, color: 'text-slate-600', bgClass: 'bg-slate-500' },
};

const reminderOptions = [
  { value: '0', label: 'Sem lembrete' },
  { value: '15', label: '15 minutos antes' },
  { value: '30', label: '30 minutos antes' },
  { value: '60', label: '1 hora antes' },
  { value: '1440', label: '1 dia antes' },
];

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
    clients, 
    deals, 
    calendarEvents,
    addCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent,
    getEventsForDay,
    getEventsForWeek,
    getEventsForMonth,
    getUpcomingEvents,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Navigation
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

  // Get events based on view
  const displayedEvents = useMemo(() => {
    if (view === 'day') return getEventsForDay(currentDate);
    if (view === 'week') return getEventsForWeek(currentDate);
    return getEventsForMonth(currentDate);
  }, [view, currentDate, getEventsForDay, getEventsForWeek, getEventsForMonth]);

  // Calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Week days for week view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Hours for day/week view
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      clientId: formData.clientId || null,
      dealId: formData.dealId || null,
      reminder: formData.reminder || null,
    };
    
    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, eventData);
    } else {
      addCalendarEvent(eventData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      allDay: event.allDay,
      clientId: event.clientId,
      dealId: event.dealId,
      reminder: event.reminder,
      completed: event.completed,
    });
    setIsDialogOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setFormData({
      ...emptyFormData,
      startDate: setHours(setMinutes(day, 0), 9),
      endDate: setHours(setMinutes(day, 0), 10),
    });
  };

  const toggleEventComplete = (event: CalendarEvent) => {
    updateCalendarEvent(event.id, { completed: !event.completed });
  };

  const getEventsForDayLocal = (day: Date) => {
    return calendarEvents.filter(e => isSameDay(new Date(e.startDate), day));
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find(c => c.id === clientId)?.name;
  };

  const getDealTitle = (dealId: string | null) => {
    if (!dealId) return null;
    return deals.find(d => d.id === dealId)?.title;
  };

  const upcomingEvents = getUpcomingEvents(5);

  // Title based on view
  const getViewTitle = () => {
    if (view === 'day') return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, "d MMM 'de' yyyy", { locale: ptBR })}`;
    }
    return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  };

  const EventCard = ({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) => {
    const config = eventTypeConfig[event.type];
    const Icon = config.icon;
    const clientName = getClientName(event.clientId);
    const dealTitle = getDealTitle(event.dealId);

    if (compact) {
      return (
        <div 
          className={cn(
            'text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 transition-opacity',
            config.bgClass,
            event.completed && 'opacity-50 line-through'
          )}
          onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
        >
          {event.title}
        </div>
      );
    }

    return (
      <Card className={cn(
        'group border-l-4 shadow-sm hover:shadow-md transition-all duration-200',
        event.completed && 'opacity-60'
      )} style={{ borderLeftColor: config.bgClass.replace('bg-', '') }}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <button 
                  onClick={() => toggleEventComplete(event)}
                  className="flex-shrink-0"
                >
                  {event.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <span className={cn(
                  'font-medium text-sm truncate',
                  event.completed && 'line-through text-muted-foreground'
                )}>
                  {event.title}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Icon className={cn('w-3 h-3', config.color)} />
                <Badge variant="secondary" className="text-xs">
                  {config.label}
                </Badge>
                {!event.allDay && (
                  <span>
                    {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                  </span>
                )}
                {event.allDay && <span>Dia inteiro</span>}
              </div>

              {(clientName || dealTitle) && (
                <div className="flex flex-wrap gap-1.5">
                  {clientName && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Users className="w-3 h-3" />
                      {clientName}
                    </Badge>
                  )}
                  {dealTitle && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Handshake className="w-3 h-3" />
                      {dealTitle}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(event)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => deleteCalendarEvent(event.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Eventos Hoje</p>
                <p className="text-3xl font-bold tracking-tight">{getEventsForDay(new Date()).length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Esta Semana</p>
                <p className="text-3xl font-bold tracking-tight">{getEventsForWeek(new Date()).length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Este Mês</p>
                <p className="text-3xl font-bold tracking-tight">{getEventsForMonth(new Date()).length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Com Lembrete</p>
                <p className="text-3xl font-bold tracking-tight">{calendarEvents.filter(e => e.reminder && !e.completed).length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
          </CardContent>
        </Card>
      </div>

      {/* Calendar Header */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>Hoje</Button>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold ml-2 capitalize">{getViewTitle()}</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border overflow-hidden">
                <Button 
                  variant={view === 'day' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setView('day')}
                  className="rounded-none"
                >
                  Dia
                </Button>
                <Button 
                  variant={view === 'week' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setView('week')}
                  className="rounded-none"
                >
                  Semana
                </Button>
                <Button 
                  variant={view === 'month' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setView('month')}
                  className="rounded-none"
                >
                  Mês
                </Button>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="w-4 h-4" />
                    Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Nome do evento"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: CalendarEventType) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(eventTypeConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <config.icon className={cn('w-4 h-4', config.color)} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Lembrete</Label>
                        <Select
                          value={formData.reminder?.toString() || '0'}
                          onValueChange={(value) => setFormData({ ...formData, reminder: value === '0' ? null : parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {reminderOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="allDay"
                        checked={formData.allDay}
                        onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
                      />
                      <Label htmlFor="allDay">Dia inteiro</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Início</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(formData.startDate, 'dd/MM/yyyy')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date) => date && setFormData({ ...formData, startDate: date, endDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {!formData.allDay && (
                        <div className="space-y-2">
                          <Label>Hora Início</Label>
                          <Input
                            type="time"
                            value={format(formData.startDate, 'HH:mm')}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              setFormData({ 
                                ...formData, 
                                startDate: setMinutes(setHours(formData.startDate, hours), minutes) 
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {!formData.allDay && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data Fim</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(formData.endDate, 'dd/MM/yyyy')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.endDate}
                                onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>Hora Fim</Label>
                          <Input
                            type="time"
                            value={format(formData.endDate, 'HH:mm')}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              setFormData({ 
                                ...formData, 
                                endDate: setMinutes(setHours(formData.endDate, hours), minutes) 
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contacto</Label>
                        <Select
                          value={formData.clientId || ''}
                          onValueChange={(value) => setFormData({ ...formData, clientId: value || null })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar contacto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum</SelectItem>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Negócio</Label>
                        <Select
                          value={formData.dealId || ''}
                          onValueChange={(value) => setFormData({ ...formData, dealId: value || null })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar negócio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum</SelectItem>
                            {deals.map((deal) => (
                              <SelectItem key={deal.id} value={deal.id}>{deal.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detalhes do evento..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingEvent ? 'Guardar' : 'Criar Evento'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="shadow-lg border-0">
            <CardContent className="p-0">
              {view === 'month' && (
                <div className="divide-y">
                  {/* Week day headers */}
                  <div className="grid grid-cols-7 bg-muted/50">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                      <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const dayEvents = getEventsForDayLocal(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      
                      return (
                        <div
                          key={idx}
                          className={cn(
                            'min-h-[100px] p-2 border-r border-b cursor-pointer hover:bg-muted/30 transition-colors',
                            !isCurrentMonth && 'bg-muted/20 text-muted-foreground',
                            isToday(day) && 'bg-primary/5'
                          )}
                          onClick={() => handleDayClick(day)}
                        >
                          <div className={cn(
                            'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                            isToday(day) && 'bg-primary text-primary-foreground'
                          )}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <EventCard key={event.id} event={event} compact />
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{dayEvents.length - 3} mais
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {view === 'week' && (
                <div className="divide-y">
                  <div className="grid grid-cols-8 bg-muted/50">
                    <div className="py-3 px-2 text-center text-sm font-medium text-muted-foreground border-r" />
                    {weekDays.map((day) => (
                      <div 
                        key={day.toISOString()} 
                        className={cn(
                          'py-3 text-center text-sm font-medium text-muted-foreground border-r',
                          isToday(day) && 'bg-primary/10'
                        )}
                      >
                        <div>{format(day, 'EEE', { locale: ptBR })}</div>
                        <div className={cn(
                          'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-lg',
                          isToday(day) && 'bg-primary text-primary-foreground'
                        )}>
                          {format(day, 'd')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="max-h-[500px] overflow-y-auto">
                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-8 border-b">
                        <div className="py-4 px-2 text-right text-xs text-muted-foreground border-r">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        {weekDays.map((day) => {
                          const dayEvents = getEventsForDayLocal(day).filter(e => {
                            const eventHour = getHours(new Date(e.startDate));
                            return eventHour === hour;
                          });
                          
                          return (
                            <div 
                              key={day.toISOString()}
                              className={cn(
                                'py-1 px-1 border-r min-h-[60px] hover:bg-muted/30 transition-colors cursor-pointer',
                                isToday(day) && 'bg-primary/5'
                              )}
                              onClick={() => {
                                handleDayClick(day);
                                setFormData(prev => ({
                                  ...prev,
                                  startDate: setHours(setMinutes(day, 0), hour),
                                  endDate: setHours(setMinutes(day, 0), hour + 1),
                                }));
                              }}
                            >
                              {dayEvents.map((event) => (
                                <EventCard key={event.id} event={event} compact />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'day' && (
                <div className="divide-y">
                  <div className="max-h-[500px] overflow-y-auto">
                    {hours.map((hour) => {
                      const hourEvents = displayedEvents.filter(e => {
                        const eventHour = getHours(new Date(e.startDate));
                        return eventHour === hour;
                      });
                      
                      return (
                        <div key={hour} className="grid grid-cols-12 border-b hover:bg-muted/30 transition-colors">
                          <div className="col-span-1 py-4 px-2 text-right text-sm text-muted-foreground">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          <div 
                            className="col-span-11 py-2 px-2 min-h-[80px] cursor-pointer"
                            onClick={() => {
                              setFormData({
                                ...emptyFormData,
                                startDate: setHours(setMinutes(currentDate, 0), hour),
                                endDate: setHours(setMinutes(currentDate, 0), hour + 1),
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <div className="space-y-2">
                              {hourEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
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

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum evento próximo
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Mini Calendar */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                className="rounded-md"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
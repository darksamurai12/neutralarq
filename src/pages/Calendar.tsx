import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarDays } from 'lucide-react';
import { CRMCalendar } from '@/components/crm/CRMCalendar';

export default function CalendarPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Calendário"
        description="Agenda de reuniões, chamadas e eventos"
        icon={CalendarDays}
      />
      <CRMCalendar />
    </AppLayout>
  );
}

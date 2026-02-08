import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center shadow-sm">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="mt-4 md:mt-0">{children}</div>}
    </div>
  );
}

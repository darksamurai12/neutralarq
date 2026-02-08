import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleIcon?: LucideIcon;
  icon: LucideIcon;
  pastelClass: string;
  iconColor: string;
}

export function DashboardStatCard({
  title,
  value,
  subtitle,
  subtitleIcon: SubIcon,
  icon: Icon,
  pastelClass,
  iconColor,
}: DashboardStatCardProps) {
  return (
    <div className={cn(
      'rounded-2xl p-5 transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5 animate-in-up',
      pastelClass
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-xl font-bold text-foreground tracking-tight">{value}</p>
      {subtitle && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          {SubIcon && <SubIcon className="w-3 h-3" />}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}

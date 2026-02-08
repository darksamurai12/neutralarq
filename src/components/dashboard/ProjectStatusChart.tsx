import { ProjectStatus } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ProjectStatusChartProps {
  data: Record<ProjectStatus, number>;
}

const statusLabels: Record<ProjectStatus, string> = {
  planning: 'Planeamento',
  in_progress: 'Em Execução',
  paused: 'Parado',
  completed: 'Concluído',
};

const statusColors: Record<ProjectStatus, string> = {
  planning: 'hsl(245, 58%, 70%)',
  in_progress: 'hsl(210, 60%, 55%)',
  paused: 'hsl(38, 80%, 55%)',
  completed: 'hsl(152, 69%, 45%)',
};

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([status, value]) => ({
      name: statusLabels[status as ProjectStatus],
      value,
      color: statusColors[status as ProjectStatus],
    }));

  const total = Object.values(data).reduce((sum, v) => sum + v, 0);

  if (total === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground">
        Nenhum projecto registado
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
            }}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

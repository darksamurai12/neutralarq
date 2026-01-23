import { ProjectStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  planning: 'hsl(215, 20%, 65%)',
  in_progress: 'hsl(217, 91%, 60%)',
  paused: 'hsl(38, 92%, 50%)',
  completed: 'hsl(142, 76%, 36%)',
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Distribuição de Projectos por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Nenhum projecto registado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Distribuição de Projectos por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

import { ProjectStatus, ProjectType } from '@/types';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Client } from '@/types';

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ProjectStatus | 'all';
  onStatusChange: (value: ProjectStatus | 'all') => void;
  typeFilter: ProjectType | 'all';
  onTypeChange: (value: ProjectType | 'all') => void;
  clientFilter: string;
  onClientChange: (value: string) => void;
  clients: Client[];
}

const statusOptions = [
  { value: 'all', label: 'Todos os Estados' },
  { value: 'planning', label: 'Planeamento' },
  { value: 'in_progress', label: 'Em Execução' },
  { value: 'paused', label: 'Parado' },
  { value: 'completed', label: 'Concluído' },
];

const typeOptions = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'architecture', label: 'Arquitectura' },
  { value: 'construction', label: 'Construção Civil' },
  { value: 'interior_design', label: 'Design de Interiores' },
];

export function ProjectFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  clientFilter,
  onClientChange,
  clients,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <SearchFilter
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Pesquisar por nome ou localização..."
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as ProjectStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as ProjectType | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={clientFilter} onValueChange={onClientChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

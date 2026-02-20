"use client";

import { Card, CardContent } from '@/components/ui/card';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { StatusFilter } from '@/components/filters/StatusFilter';
import { ClientStatus } from '@/types';

interface ClientFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ClientStatus | 'all';
  onStatusChange: (value: ClientStatus | 'all') => void;
}

const statusOptions = [
  { value: 'lead' as const, label: 'Lead' },
  { value: 'active' as const, label: 'Activo' },
  { value: 'inactive' as const, label: 'Inactivo' },
];

export function ClientFilters({ searchQuery, onSearchChange, statusFilter, onStatusChange }: ClientFiltersProps) {
  return (
    <Card className="shadow-card border-border/50 rounded-2xl mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 max-w-md">
            <SearchFilter
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Pesquisar clientes por nome, email ou empresa..."
            />
          </div>
          <StatusFilter<ClientStatus>
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
            placeholder="Filtrar por status"
          />
        </div>
      </CardContent>
    </Card>
  );
}
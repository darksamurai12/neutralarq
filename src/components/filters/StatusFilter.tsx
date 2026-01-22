import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusFilterProps<T extends string> {
  value: T | 'all';
  onChange: (value: T | 'all') => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}

export function StatusFilter<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Filtrar por status',
}: StatusFilterProps<T>) {
  return (
    <Select 
      value={value} 
      onValueChange={(v: string) => onChange(v as T | 'all')}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

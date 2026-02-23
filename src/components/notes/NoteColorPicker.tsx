"use client";

import { NoteColor } from '@/types';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface NoteColorPickerProps {
  currentColor: NoteColor;
  onColorSelect: (color: NoteColor) => void;
}

const colors: { name: NoteColor; class: string }[] = [
  { name: 'default', class: 'bg-white border-slate-200' },
  { name: 'blue', class: 'bg-pastel-sky border-blue-200' },
  { name: 'green', class: 'bg-pastel-mint border-emerald-200' },
  { name: 'yellow', class: 'bg-pastel-amber border-amber-200' },
  { name: 'purple', class: 'bg-pastel-lavender border-primary/20' },
  { name: 'rose', class: 'bg-pastel-rose border-rose-200' },
];

export function NoteColorPicker({ currentColor, onColorSelect }: NoteColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-black/5">
          <Palette className="w-5 h-5 text-slate-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="center">
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              className={cn(
                "h-8 w-8 rounded-full border flex items-center justify-center transition-transform hover:scale-110",
                c.class
              )}
              onClick={() => onColorSelect(c.name)}
            >
              {currentColor === c.name && <Check className="w-3 h-3 text-slate-600" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
"use client";

import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sparkles } from 'lucide-react';

const quotes = [
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "A melhor forma de prever o futuro é criá-lo.",
  "Grandes coisas nunca vêm de zonas de conforto.",
  "A excelência não é um ato, mas um hábito.",
  "Foque no progresso, não na perfeição.",
  "A produtividade é o resultado de compromisso com a excelência."
];

export function WelcomeHeader() {
  const { profile, user } = useAuth();
  
  const hour = new Date().getHours();
  let greeting = "Bom dia";
  if (hour >= 12 && hour < 18) greeting = "Boa tarde";
  if (hour >= 18 || hour < 5) greeting = "Boa noite";

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Utilizador';
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  
  const quoteIndex = new Date().getDate() % quotes.length;
  const quoteOfDay = quotes[quoteIndex];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 md:mb-10 p-4 md:p-6 rounded-3xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
      <div className="flex items-center gap-4 md:gap-5">
        <Avatar className="h-14 w-14 md:h-20 md:w-20 rounded-2xl border-2 md:border-4 border-white dark:border-slate-800 shadow-lg">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-white text-xl md:text-2xl font-bold rounded-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-left">
          <h1 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            {greeting}, <span className="text-primary">{firstName}</span>!
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1 font-medium">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="w-full md:flex-1 md:max-w-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-3 md:p-4 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-sm">
        <div className="flex items-center gap-2 mb-1 text-primary">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Frase do Dia</span>
        </div>
        <p className="text-xs md:text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
          "{quoteOfDay}"
        </p>
      </div>
    </div>
  );
}
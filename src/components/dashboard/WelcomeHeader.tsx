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
  
  // Seleciona uma frase baseada no dia do mês para ser consistente durante o dia
  const quoteIndex = new Date().getDate() % quotes.length;
  const quoteOfDay = quotes[quoteIndex];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 p-6 rounded-3xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl">
          <AvatarImage src="" /> {/* Espaço para avatar_url se existir no futuro */}
          <AvatarFallback className="bg-primary text-white text-2xl font-bold rounded-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            {greeting}, <span className="text-primary">{firstName}</span>!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-sm">
        <div className="flex items-center gap-2 mb-1 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Frase do Dia</span>
        </div>
        <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
          "{quoteOfDay}"
        </p>
      </div>
    </div>
  );
}
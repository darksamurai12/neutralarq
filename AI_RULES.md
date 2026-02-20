# Regras de Desenvolvimento e Stack Tecnológica - GestãoPro

Este documento serve como guia para a IA e desenvolvedores manterem a consistência do projeto.

## 🛠 Stack Tecnológica

*   **Framework Principal:** React 18 com Vite e TypeScript.
*   **Estilização:** Tailwind CSS seguindo um design system de "Soft Pastel Glass Morphism".
*   **Componentes de UI:** shadcn/ui (baseado em Radix UI primitives).
*   **Gestão de Estado & Dados:** TanStack Query (React Query) para cache/sincronização e React Context API para estado global da aplicação (`AppContext`).
*   **Backend & Autenticação:** Supabase (PostgreSQL + Auth).
*   **Navegação:** React Router DOM v6.
*   **Ícones:** Lucide React.
*   **Visualização de Dados:** Recharts para gráficos financeiros e de progresso.
*   **Manipulação de Datas:** date-fns (configurado para locale `pt-BR` ou `pt`).
*   **Formulários:** React Hook Form com validação Zod.

## 📏 Regras de Utilização de Bibliotecas

1.  **Componentes de UI:** Utilize sempre os componentes da pasta `@/components/ui` (shadcn). Não crie componentes de base (botões, inputs, diálogos) do zero se já existirem no shadcn.
2.  **Ícones:** Use exclusivamente a biblioteca `lucide-react`. Mantenha o tamanho padrão de `w-4 h-4` ou `w-5 h-5` para ícones dentro de botões e listas.
3.  **Datas:** Use `date-fns` para qualquer cálculo ou formatação de data. Evite o objeto `Date` nativo para formatação de strings.
4.  **Estilização:** Utilize classes utilitárias do Tailwind. Evite CSS inline ou CSS Modules. Siga as cores do tema pastel definidas em `tailwind.config.ts` (ex: `bg-pastel-lavender`, `shadow-glass`).
5.  **Notificações:** Utilize `sonner` (através do hook `toast`) para feedbacks de sucesso/erro em ações do utilizador.
6.  **Gráficos:** Utilize `recharts`. Certifique-se de que os gráficos são responsivos usando `ResponsiveContainer`.
7.  **Animações:** Use `framer-motion` para transições de página e animações de entrada de listas/cards (ex: `animate-in-up`).
8.  **Backend:** Todas as chamadas de dados devem passar pelo Supabase client em `@/integrations/supabase/client.ts`.
9.  **Tipagem:** Mantenha os tipos centralizados em `src/types/index.ts`. Sempre defina interfaces para novos dados.
10. **PDF:** Para geração de relatórios ou orçamentos, utilize `jspdf` com o plugin `jspdf-autotable`.

## 📂 Estrutura de Pastas

*   `src/components/`: Componentes reutilizáveis organizados por funcionalidade (ex: `crm/`, `projects/`).
*   `src/hooks/`: Hooks personalizados para lógica de negócio e integração com DB.
*   `src/pages/`: Componentes de página que representam as rotas principais.
*   `src/contexts/`: Provedores de contexto global.
*   `src/lib/`: Utilitários e configurações de bibliotecas (ex: `utils.ts`, `currency.ts`).
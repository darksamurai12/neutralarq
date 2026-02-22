-- 1. EXTENSÕES E FUNÇÕES AUXILIARES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. TABELA DE PERFIS (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- 3. TABELA DE CLIENTES (CRM)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    position TEXT,
    address TEXT,
    notes TEXT,
    status TEXT DEFAULT 'lead' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. TABELA DE PROJECTOS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    parent_project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    budget NUMERIC DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'planning' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. TABELA DE TAREFAS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    responsible TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'todo' NOT NULL,
    priority TEXT DEFAULT 'medium' NOT NULL,
    phase TEXT DEFAULT 'projeto' NOT NULL,
    completion_percentage NUMERIC DEFAULT 0 NOT NULL,
    subtasks JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. TABELA DE TRANSAÇÕES (Finanças)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    value NUMERIC NOT NULL,
    type TEXT NOT NULL, -- 'income' or 'expense'
    destination TEXT NOT NULL, -- 'project' or 'cashflow'
    category TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 7. TABELA DE NEGÓCIOS (Pipeline CRM)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    value NUMERIC DEFAULT 0 NOT NULL,
    stage TEXT NOT NULL,
    probability NUMERIC DEFAULT 10 NOT NULL,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 8. TABELA DE EVENTOS (Calendário)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false NOT NULL,
    reminder INTEGER,
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 9. TABELA DE INTERAÇÕES COM CLIENTES
CREATE TABLE IF NOT EXISTS public.client_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 10. TABELA DE INVENTÁRIO
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0 NOT NULL,
    unit TEXT NOT NULL,
    min_stock NUMERIC DEFAULT 0 NOT NULL,
    unit_cost NUMERIC DEFAULT 0 NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 11. TABELAS DE PRECIFICAÇÃO (Catálogo)
CREATE TABLE IF NOT EXISTS public.pricing_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL,
    margin_percent NUMERIC NOT NULL,
    final_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pricing_labor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    provider_value NUMERIC NOT NULL,
    margin_percent NUMERIC NOT NULL,
    final_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pricing_transport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_cost NUMERIC NOT NULL,
    margin_percent NUMERIC NOT NULL,
    final_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 12. TABELAS DE ORÇAMENTOS (Budgets)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    client_name TEXT,
    status TEXT DEFAULT 'draft' NOT NULL,
    total_value NUMERIC DEFAULT 0 NOT NULL,
    total_cost NUMERIC DEFAULT 0 NOT NULL,
    total_profit NUMERIC DEFAULT 0 NOT NULL,
    margin_percent NUMERIC DEFAULT 0 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    item_id UUID,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    unit_cost NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    profit NUMERIC NOT NULL,
    group_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 13. HISTÓRICO DE PROJECTOS
CREATE TABLE IF NOT EXISTS public.project_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 14. CONFIGURAÇÃO DE RLS (SEGURANÇA) PARA TODAS AS TABELAS
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own %I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Users can manage their own %I" ON public.%I FOR ALL USING (auth.uid() = user_id);', t, t);
    END LOOP;
END $$;

-- Ajuste específico para budget_items (que não tem user_id direto)
DROP POLICY IF EXISTS "Users can manage their own budget_items" ON public.budget_items;
CREATE POLICY "Users can manage their own budget_items" ON public.budget_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.budgets 
        WHERE public.budgets.id = public.budget_items.budget_id 
        AND public.budgets.user_id = auth.uid()
    )
);

-- 15. TRIGGERS PARA UPDATED_AT
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT IN ('budget_items', 'project_history', 'client_interactions', 'transactions', 'calendar_events')) 
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS handle_updated_at ON public.%I;', t);
        EXECUTE format('CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();', t);
    END LOOP;
END $$;

-- 16. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE NO SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
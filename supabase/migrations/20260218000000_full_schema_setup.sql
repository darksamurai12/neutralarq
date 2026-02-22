-- Script completo corrigido para configuração do banco de dados

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Função para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Tabela de Perfis (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);

-- 4. CRM: Clientes
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
    status TEXT DEFAULT 'lead',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own clients" ON public.clients FOR ALL USING (auth.uid() = user_id);

-- 5. CRM: Negócios (Deals)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    value NUMERIC DEFAULT 0,
    stage TEXT DEFAULT 'lead',
    probability INTEGER DEFAULT 10,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own deals" ON public.deals FOR ALL USING (auth.uid() = user_id);

-- 6. CRM: Interações
CREATE TABLE IF NOT EXISTS public.client_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own interactions" ON public.client_interactions FOR ALL USING (auth.uid() = user_id);

-- 7. Projetos
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
    budget NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'planning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

-- 8. Projetos: Tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    responsible TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    phase TEXT DEFAULT 'projeto',
    completion_percentage INTEGER DEFAULT 0,
    subtasks JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- 9. Finanças: Transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    value NUMERIC NOT NULL,
    type TEXT NOT NULL, -- income / expense
    destination TEXT NOT NULL, -- project / cashflow
    category TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- 10. Inventário
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    unit TEXT NOT NULL,
    min_stock NUMERIC DEFAULT 0,
    unit_cost NUMERIC DEFAULT 0,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own inventory" ON public.inventory FOR ALL USING (auth.uid() = user_id);

-- 11. Precificação: Produtos
CREATE TABLE IF NOT EXISTS public.pricing_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL,
    margin_percent NUMERIC NOT NULL,
    final_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pricing_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own pricing_products" ON public.pricing_products FOR ALL USING (auth.uid() = user_id);

-- 12. Precificação: Mão de Obra
CREATE TABLE IF NOT EXISTS public.pricing_labor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    provider_value NUMERIC NOT NULL,
    margin_percent NUMERIC NOT NULL,
    final_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pricing_labor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own pricing_labor" ON public.pricing_labor FOR ALL USING (auth.uid() = user_id);

-- 13. Precificação: Transporte
CREATE TABLE IF NOT EXISTS public.pricing_transport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_cost NUMERIC NOT NULL,
    margin_percent NUMERIC NOT NULL,
    final_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pricing_transport ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own pricing_transport" ON public.pricing_transport FOR ALL USING (auth.uid() = user_id);

-- 14. Precificação: Orçamentos (Budgets)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    client_name TEXT,
    notes TEXT,
    status TEXT DEFAULT 'draft',
    total_value NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    total_profit NUMERIC DEFAULT 0,
    margin_percent NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);

-- 15. Precificação: Itens do Orçamento (Budget Items)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- CORREÇÃO DA POLÍTICA: Validar acesso através da tabela budgets
CREATE POLICY "Users can manage their own budget_items" ON public.budget_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.budgets
    WHERE budgets.id = budget_items.budget_id
    AND budgets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.budgets
    WHERE budgets.id = budget_items.budget_id
    AND budgets.user_id = auth.uid()
  )
);

-- 16. Calendário: Eventos
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
    all_day BOOLEAN DEFAULT false,
    reminder INTEGER,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own events" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);

-- 17. Triggers para updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$;

-- 18. Trigger para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
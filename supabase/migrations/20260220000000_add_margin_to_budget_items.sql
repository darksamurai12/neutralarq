-- Adiciona a coluna margin_percent à tabela budget_items
ALTER TABLE public.budget_items ADD COLUMN IF NOT EXISTS margin_percent NUMERIC DEFAULT 0;

-- Comentário para documentação
COMMENT ON COLUMN public.budget_items.margin_percent IS 'Margem de lucro aplicada ao item no momento da criação do orçamento';
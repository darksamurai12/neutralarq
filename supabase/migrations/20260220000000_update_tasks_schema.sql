-- Tornar o project_id opcional
ALTER TABLE public.tasks ALTER COLUMN project_id DROP NOT NULL;

-- Atualizar ou remover restrições de check se existirem para suportar os novos estados
-- Nota: Dependendo da versão, as restrições podem ter nomes diferentes. 
-- Se houver erro aqui, pode ignorar e ajustar manualmente no painel.
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;

-- Adicionar novas restrições (opcional, mas recomendado para integridade)
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('todo', 'doing', 'done', 'canceled', 'pending', 'in_progress', 'completed'));

ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'critical', 'urgent'));
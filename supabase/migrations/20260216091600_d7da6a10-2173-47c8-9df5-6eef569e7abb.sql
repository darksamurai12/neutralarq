
-- Fix: Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- budgets
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- budget_items
DROP POLICY IF EXISTS "Users can view budget items through budget" ON public.budget_items;
DROP POLICY IF EXISTS "Users can insert budget items through budget" ON public.budget_items;
DROP POLICY IF EXISTS "Users can update budget items through budget" ON public.budget_items;
DROP POLICY IF EXISTS "Users can delete budget items through budget" ON public.budget_items;

CREATE POLICY "Users can view budget items through budget" ON public.budget_items FOR SELECT
USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can insert budget items through budget" ON public.budget_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can update budget items through budget" ON public.budget_items FOR UPDATE
USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can delete budget items through budget" ON public.budget_items FOR DELETE
USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));

-- pricing_products
DROP POLICY IF EXISTS "Users can view own products" ON public.pricing_products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.pricing_products;
DROP POLICY IF EXISTS "Users can update own products" ON public.pricing_products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.pricing_products;

CREATE POLICY "Users can view own products" ON public.pricing_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON public.pricing_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.pricing_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.pricing_products FOR DELETE USING (auth.uid() = user_id);

-- pricing_labor
DROP POLICY IF EXISTS "Users can view own labor" ON public.pricing_labor;
DROP POLICY IF EXISTS "Users can insert own labor" ON public.pricing_labor;
DROP POLICY IF EXISTS "Users can update own labor" ON public.pricing_labor;
DROP POLICY IF EXISTS "Users can delete own labor" ON public.pricing_labor;

CREATE POLICY "Users can view own labor" ON public.pricing_labor FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own labor" ON public.pricing_labor FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own labor" ON public.pricing_labor FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own labor" ON public.pricing_labor FOR DELETE USING (auth.uid() = user_id);

-- pricing_transport
DROP POLICY IF EXISTS "Users can view own transport" ON public.pricing_transport;
DROP POLICY IF EXISTS "Users can insert own transport" ON public.pricing_transport;
DROP POLICY IF EXISTS "Users can update own transport" ON public.pricing_transport;
DROP POLICY IF EXISTS "Users can delete own transport" ON public.pricing_transport;

CREATE POLICY "Users can view own transport" ON public.pricing_transport FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transport" ON public.pricing_transport FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transport" ON public.pricing_transport FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transport" ON public.pricing_transport FOR DELETE USING (auth.uid() = user_id);

-- Create the missing trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert profile for existing user who doesn't have one
INSERT INTO public.profiles (user_id, full_name)
SELECT id, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT DO NOTHING;

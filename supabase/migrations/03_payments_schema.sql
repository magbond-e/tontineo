-- ============================================================
-- 1. TABLE : cycles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  pot_amount BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (circle_id, cycle_number)
);

-- ============================================================
-- 2. TABLE : payments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  fedapay_transaction_id TEXT UNIQUE,
  operator TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payments_fedapay_id ON public.payments(fedapay_transaction_id);

-- ============================================================
-- 3. SECURITE : ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_see_cycles" ON public.cycles FOR SELECT USING (
  public.check_is_circle_member(circle_id, auth.uid()) OR public.check_is_circle_organizer(circle_id, auth.uid())
);

CREATE POLICY "organizer_manages_cycles" ON public.cycles FOR ALL USING (
  public.check_is_circle_organizer(circle_id, auth.uid())
);

CREATE POLICY "user_sees_own_payments" ON public.payments FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "members_see_circle_payments" ON public.payments FOR SELECT USING (
  public.check_is_circle_member(circle_id, auth.uid()) OR public.check_is_circle_organizer(circle_id, auth.uid())
);

CREATE POLICY "user_inserts_own_payments" ON public.payments FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- ============================================================
-- 4. TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cycles_updated_at ON public.cycles;
CREATE TRIGGER set_cycles_updated_at BEFORE UPDATE ON public.cycles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 5. RPC (FONCTIONS BASE DE DONNÉES)
-- ============================================================
-- Fonction sécurisée appelée par le Webhook FedaPay pour incrémenter le pot
CREATE OR REPLACE FUNCTION public.increment_cycle_pot(p_cycle_id UUID, p_amount BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.cycles 
  SET pot_amount = pot_amount + p_amount 
  WHERE id = p_cycle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 1. TRIGGERS POUR COMPTER LES MEMBRES AUTOMATIQUEMENT
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_circle_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.circles SET current_members = current_members + 1 WHERE id = NEW.circle_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE public.circles SET current_members = current_members - 1 WHERE id = OLD.circle_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
      UPDATE public.circles SET current_members = current_members + 1 WHERE id = NEW.circle_id;
    ELSIF NEW.status != 'active' AND OLD.status = 'active' THEN
      UPDATE public.circles SET current_members = current_members - 1 WHERE id = NEW.circle_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_circle_members_count ON public.memberships;
CREATE TRIGGER trg_update_circle_members_count
AFTER INSERT OR UPDATE OR DELETE ON public.memberships
FOR EACH ROW EXECUTE FUNCTION public.update_circle_members_count();

-- Backfill pour corriger le compte des membres existants
UPDATE public.circles c
SET current_members = (SELECT count(*) FROM public.memberships m WHERE m.circle_id = c.id AND m.status = 'active');


-- ============================================================
-- 2. FONCTIONS RPC (REMOTE PROCEDURE CALL) POUR LES INVITATIONS
-- ============================================================

-- A. Lire les infos d'un cercle sans être membre (Bypasse RLS)
CREATE OR REPLACE FUNCTION public.get_circle_info_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  icon_emoji TEXT,
  amount BIGINT,
  frequency TEXT,
  max_members INTEGER,
  current_members INTEGER,
  organizer_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, c.name, c.description, c.icon_emoji, c.amount, c.frequency, c.max_members, c.current_members,
    p.full_name AS organizer_name
  FROM public.circles c
  JOIN public.profiles p ON c.organizer_id = p.id
  WHERE c.invite_token = p_token AND c.status = 'En attente'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Rejoindre un cercle avec un token (Bypasse RLS de Circles)
CREATE OR REPLACE FUNCTION public.join_circle_by_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_circle_id UUID;
  v_max_members INTEGER;
  v_current_members INTEGER;
  v_status TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vous devez être connecté pour rejoindre un cercle.');
  END IF;

  -- Obtenir les infos du cercle
  SELECT id, max_members, current_members, status 
  INTO v_circle_id, v_max_members, v_current_members, v_status
  FROM public.circles 
  WHERE invite_token = p_token;

  IF v_circle_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ce lien d''invitation est invalide ou expiré.');
  END IF;

  IF v_status != 'En attente' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ce cercle ne recrute plus de nouveaux membres.');
  END IF;

  IF v_current_members >= v_max_members THEN
    RETURN jsonb_build_object('success', false, 'message', 'Désolé, ce cercle est déjà complet.');
  END IF;

  -- Ajouter le membre (le trigger va mettre à jour current_members)
  INSERT INTO public.memberships (circle_id, user_id, status, role)
  VALUES (v_circle_id, v_user_id, 'active', 'member')
  ON CONFLICT (circle_id, user_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'circle_id', v_circle_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

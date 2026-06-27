-- 1. Ajout des colonnes de sécurité PIN sur profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS failed_pin_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS pin_blocked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deactivated BOOLEAN DEFAULT false;

-- (is_locked existait peut-être déjà, on ajoute les nouvelles pour la logique de temps)

-- 2. Ajout de la pénalité fixe sur les cercles
ALTER TABLE public.circles
ADD COLUMN IF NOT EXISTS late_penalty_amount NUMERIC DEFAULT 0;

-- 3. Trigger pour notifier l'organisateur quand un membre demande à rejoindre (status = 'pending')
CREATE OR REPLACE FUNCTION notify_organizer_on_join()
RETURNS TRIGGER AS $$
DECLARE
    v_organizer_id uuid;
    v_circle_name text;
    v_member_name text;
BEGIN
    -- Obtenir l'organisateur du cercle
    SELECT created_by, name INTO v_organizer_id, v_circle_name
    FROM public.circles
    WHERE id = NEW.circle_id;

    -- Obtenir le nom du membre
    SELECT full_name INTO v_member_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF NEW.status = 'pending' THEN
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (
            v_organizer_id,
            'circle_invite',
            'Nouvelle demande d''adhésion',
            v_member_name || ' souhaite rejoindre votre cercle "' || v_circle_name || '".'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_organizer_on_join ON public.circle_members;
CREATE TRIGGER trigger_notify_organizer_on_join
AFTER INSERT OR UPDATE OF status ON public.circle_members
FOR EACH ROW
WHEN (NEW.status = 'pending' AND (TG_OP = 'INSERT' OR OLD.status != 'pending'))
EXECUTE FUNCTION notify_organizer_on_join();

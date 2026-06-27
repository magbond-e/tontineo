-- Fonction RPC "Security Definer" pour mettre à jour le profil de manière sécurisée
-- Cela permet de contourner les éventuels blocages RLS (Row Level Security) capricieux sur les colonnes.

CREATE OR REPLACE FUNCTION public.submit_onboarding(
    p_city text, 
    p_whatsapp text, 
    p_momo text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Récupérer l'ID de l'utilisateur authentifié depuis le jeton JWT (Supabase Auth)
    v_user_id := auth.uid();
    
    -- Si l'utilisateur n'est pas connecté, rejeter l'action
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Non authentifié';
    END IF;

    -- Mise à jour directe du profil de l'utilisateur
    UPDATE public.profiles
    SET 
        city = p_city,
        whatsapp = p_whatsapp,
        phone = p_momo,
        cgu_accepted_at = now()
    WHERE id = v_user_id;
END;
$$;

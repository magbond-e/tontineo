-- Fix search_path warnings for SECURITY DEFINER functions
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.check_is_circle_member(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.check_is_circle_organizer(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.update_circle_members_count() SET search_path = '';
ALTER FUNCTION public.get_circle_info_by_token(text) SET search_path = '';
ALTER FUNCTION public.join_circle_by_token(text) SET search_path = '';
ALTER FUNCTION public.handle_updated_at() SET search_path = '';
ALTER FUNCTION public.sync_profile_has_pin() SET search_path = '';
ALTER FUNCTION public.increment_cycle_pot(uuid, bigint) SET search_path = '';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
        ALTER FUNCTION public.rls_auto_enable() SET search_path = '';
    END IF;
END $$;

-- Revoke EXECUTE from PUBLIC for all SECURITY DEFINER functions to prevent anon access
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_is_circle_member(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_is_circle_organizer(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_circle_members_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_circle_info_by_token(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.join_circle_by_token(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_profile_has_pin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_cycle_pot(uuid, bigint) FROM PUBLIC;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
        REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
    END IF;
END $$;

-- Explicitly revoke from anon and authenticated for strictly internal triggers/functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_circle_members_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_profile_has_pin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_cycle_pot(uuid, bigint) FROM anon, authenticated;

-- Grant EXECUTE to authenticated users for functions used in RLS policies or RPC calls
GRANT EXECUTE ON FUNCTION public.check_is_circle_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_circle_organizer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_circle_info_by_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_circle_by_token(text) TO authenticated;

-- (The security linter might still warn about authenticated execution of SECURITY DEFINER functions, 
-- but this is intentional for check_is_circle_member and the others above as they need to bypass RLS or are RLS helpers).

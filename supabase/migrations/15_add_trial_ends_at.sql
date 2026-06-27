-- Add trial_ends_at to profiles for the 30-day free trial feature
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Allow reading the new column
GRANT SELECT (trial_ends_at) ON public.profiles TO authenticated, anon;

-- Update RLS policies for profiles if needed (usually update is allowed for own profile, but we might want only backend or specific RPC to update plan/trial)
-- We will allow users to start their own trial via a secure RPC to prevent them from extending it infinitely.

CREATE OR REPLACE FUNCTION public.start_premium_trial()
RETURNS void AS $$
BEGIN
  -- Check if user already had a trial (trial_ends_at is not null, or we could add a has_had_trial flag)
  -- For simplicity in this iteration, we just set it if it's null
  UPDATE public.profiles
  SET 
    current_plan = 'pro', -- Or 'premium' depending on exact naming convention, the DB says IN ('free', 'pro', 'business') in 04_profiles_extended.sql. Wait, the DB check constraint allows 'pro'. So let's use 'pro' for the middle plan.
    trial_ends_at = NOW() + INTERVAL '30 days'
  WHERE id = auth.uid() 
  AND trial_ends_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

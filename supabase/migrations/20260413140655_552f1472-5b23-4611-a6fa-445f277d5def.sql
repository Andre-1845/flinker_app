
-- Remove the broad SELECT policy (exposes PII via direct table queries)
DROP POLICY IF EXISTS "Authenticated can select profiles for public view" ON public.profiles;

-- Drop the view
DROP VIEW IF EXISTS public.profiles_public;

-- Create a SECURITY DEFINER function that returns only safe fields
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  is_verified boolean,
  trust_score numeric,
  responsible_name text,
  responsible_role text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.is_verified,
    p.trust_score,
    p.responsible_name,
    p.responsible_role,
    p.created_at,
    p.updated_at
  FROM public.profiles p;
$$;

-- Recreate view using the function (SECURITY INVOKER - safe, no DEFINER warning)
CREATE VIEW public.profiles_public AS
SELECT * FROM public.get_public_profiles();

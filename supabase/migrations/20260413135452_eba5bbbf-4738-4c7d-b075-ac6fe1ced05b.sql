
-- Remove the overly permissive policy that exposed PII
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- Recreate the view WITHOUT security_invoker so it bypasses base-table RLS
-- This is safe because the view only exposes non-sensitive columns
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
SELECT
  id,
  user_id,
  full_name,
  is_verified,
  trust_score,
  responsible_name,
  responsible_role,
  created_at,
  updated_at
FROM public.profiles;

-- Grant read access on the view to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;
